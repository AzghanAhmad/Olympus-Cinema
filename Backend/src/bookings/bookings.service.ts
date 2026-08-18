import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, Prisma, ScreeningStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SeatHoldsService } from '../seat-holds/seat-holds.service';
import { EmailService } from '../email/email.service';
import { CreateBookingDto, QueryBookingsDto } from './dto/booking.dto';
import {
  buildMeta,
  generateBookingCode,
  generateSecureToken,
  generateTicketCode,
  getPagination,
} from '../common/utils';

const bookingInclude = {
  screening: {
    include: {
      movie: { select: { id: true, title: true, slug: true, posterUrl: true } },
      screen: { select: { id: true, name: true, slug: true } },
    },
  },
  seats: { include: { seat: true } },
  tickets: true,
};

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    private prisma: PrismaService,
    private seatHolds: SeatHoldsService,
    private email: EmailService,
  ) {}

  async create(dto: CreateBookingDto, userId?: string) {
    if (dto.idempotencyKey) {
      const existing = await this.prisma.booking.findUnique({
        where: { idempotencyKey: dto.idempotencyKey },
        include: bookingInclude,
      });
      if (existing) return existing;
    }

    const screening = await this.prisma.screening.findUnique({
      where: { id: dto.screeningId },
      include: {
        movie: true,
        screen: true,
      },
    });
    if (!screening) throw new NotFoundException('Screening not found');
    if (screening.status !== ScreeningStatus.SCHEDULED) {
      throw new BadRequestException('Screening is not available');
    }
    if (screening.startTime <= new Date()) {
      throw new BadRequestException('Screening has already started');
    }

    let requestedSeatIds = [...new Set(dto.seatIds)];
    let holdMeta: Awaited<ReturnType<SeatHoldsService['validateHoldForBooking']>> | null =
      null;

    if (dto.holdId) {
      holdMeta = await this.seatHolds.validateHoldForBooking(
        dto.holdId,
        dto.screeningId,
        requestedSeatIds,
        userId,
      );
      requestedSeatIds = holdMeta.seatIds;
    }

    const seats = await this.prisma.seat.findMany({
      where: {
        screenId: screening.screenId,
        status: 'ACTIVE',
        OR: [{ id: { in: requestedSeatIds } }, { label: { in: requestedSeatIds } }],
      },
    });
    if (seats.length !== requestedSeatIds.length) {
      throw new BadRequestException('Invalid seats for this screening');
    }

    const seatIds = seats.map((s) => s.id);
    const alreadyReserved = await this.prisma.screeningSeatReservation.findMany({
      where: { screeningId: dto.screeningId, seatId: { in: seatIds } },
    });
    if (alreadyReserved.length) {
      throw new ConflictException('One or more seats are already booked');
    }

    const bookingCode = generateBookingCode();

    try {
      const booking = await this.prisma.$transaction(async (tx) => {
        const created = await tx.booking.create({
          data: {
            bookingCode,
            userId,
            screeningId: dto.screeningId,
            status: BookingStatus.PENDING,
            customerName: dto.customerName,
            customerEmail: dto.customerEmail,
            customerPhone: dto.customerPhone,
            idempotencyKey: dto.idempotencyKey,
          },
        });

        await tx.bookingSeat.createMany({
          data: seatIds.map((seatId) => ({
            bookingId: created.id,
            screeningId: dto.screeningId,
            seatId,
          })),
        });

        await tx.screeningSeatReservation.createMany({
          data: seatIds.map((seatId) => ({
            screeningId: dto.screeningId,
            seatId,
            bookingId: created.id,
          })),
        });

        return tx.booking.findUniqueOrThrow({
          where: { id: created.id },
          include: bookingInclude,
        });
      });

      if (holdMeta) {
        await this.seatHolds.releaseHoldInternal(holdMeta);
      }

      return booking;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('One or more seats are no longer available');
      }
      throw error;
    }
  }

  async findMyBookings(userId: string, query: QueryBookingsDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const { skip, take } = getPagination(page, limit);

    const where: Prisma.BookingWhereInput = { userId };
    if (query.status) {
      where.status = query.status as BookingStatus;
    }

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: bookingInclude,
      }),
      this.prisma.booking.count({ where }),
    ]);

    return { data: bookings, meta: buildMeta(total, page, limit) };
  }

  async findOne(id: string, userId?: string, isAdmin = false) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: bookingInclude,
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (!isAdmin && booking.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    return booking;
  }

  async findAllAdmin(query: QueryBookingsDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const { skip, take } = getPagination(page, limit);

    const where: Prisma.BookingWhereInput = {};
    if (query.status) where.status = query.status as BookingStatus;
    if (query.search) {
      where.OR = [
        { bookingCode: { contains: query.search, mode: 'insensitive' } },
        { customerEmail: { contains: query.search, mode: 'insensitive' } },
        { customerName: { contains: query.search, mode: 'insensitive' } },
        { customerPhone: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: bookingInclude,
      }),
      this.prisma.booking.count({ where }),
    ]);

    return { data: bookings, meta: buildMeta(total, page, limit) };
  }

  async confirm(id: string) {
    const booking = await this.findOne(id, undefined, true);
    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Only pending bookings can be confirmed');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id },
        data: {
          status: BookingStatus.CONFIRMED,
          confirmedAt: new Date(),
        },
      });

      if (booking.tickets.length === 0) {
        for (const bookingSeat of booking.seats) {
          const secureToken = generateSecureToken();
          await tx.ticket.create({
            data: {
              bookingId: id,
              ticketCode: generateTicketCode(),
              secureToken,
              qrPayload: secureToken,
              seatLabel: bookingSeat.seat.label,
            },
          });
        }
      }

      return tx.booking.findUniqueOrThrow({
        where: { id },
        include: bookingInclude,
      });
    });

    const screening = updated.screening;
    await this.email
      .sendBookingConfirmation({
        email: updated.customerEmail,
        customerName: updated.customerName,
        movieTitle: screening.movie.title,
        date: screening.startTime.toLocaleDateString(),
        time: screening.startTime.toLocaleTimeString(),
        hall: screening.screen.name,
        seats: updated.seats.map((s) => s.seat.label),
        bookingCode: updated.bookingCode,
      })
      .catch((err) => this.logger.warn('Confirmation email failed', err));

    return updated;
  }

  async cancel(id: string, userId?: string, isAdmin = false) {
    const booking = await this.findOne(id, userId, isAdmin);
    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking is already cancelled');
    }
    if (
      booking.status !== BookingStatus.CONFIRMED &&
      booking.status !== BookingStatus.PENDING
    ) {
      throw new BadRequestException('Booking cannot be cancelled');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.screeningSeatReservation.deleteMany({
        where: { bookingId: id },
      });
      await tx.ticket.updateMany({
        where: { bookingId: id },
        data: { status: 'VOID' },
      });
      return tx.booking.update({
        where: { id },
        data: {
          status: BookingStatus.CANCELLED,
          cancelledAt: new Date(),
        },
        include: bookingInclude,
      });
    });

    await this.email
      .sendBookingCancellation(booking.customerEmail, booking.bookingCode)
      .catch((err) => this.logger.warn('Cancellation email failed', err));

    return updated;
  }
}
