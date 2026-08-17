import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ScreeningStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SeatHoldsService } from '../seat-holds/seat-holds.service';
import {
  CreateScreeningDto,
  QueryScreeningsDto,
  UpdateScreeningDto,
} from './dto/screening.dto';
import { buildMeta, getPagination } from '../common/utils';

export type ComputedSeatStatus = 'AVAILABLE' | 'HELD' | 'BOOKED' | 'DISABLED';

const screeningInclude = {
  movie: {
    select: {
      id: true,
      title: true,
      slug: true,
      durationMinutes: true,
      posterUrl: true,
      ageRating: true,
    },
  },
  screen: {
    select: { id: true, name: true, slug: true, capacity: true },
  },
};

@Injectable()
export class ScreeningsService {
  constructor(
    private prisma: PrismaService,
    private seatHolds: SeatHoldsService,
  ) {}

  private validateTimes(startTime: Date, endTime: Date) {
    if (endTime <= startTime) {
      throw new BadRequestException('endTime must be after startTime');
    }
  }

  private async assertNoOverlap(
    screenId: string,
    startTime: Date,
    endTime: Date,
    excludeId?: string,
  ) {
    const overlapping = await this.prisma.screening.findFirst({
      where: {
        screenId,
        status: ScreeningStatus.SCHEDULED,
        id: excludeId ? { not: excludeId } : undefined,
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
    });

    if (overlapping) {
      throw new ConflictException(
        'Screening overlaps with an existing scheduled screening on this screen',
      );
    }
  }

  async findAll(query: QueryScreeningsDto, includeAllStatuses = false) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const { skip, take } = getPagination(page, limit);

    const where: Prisma.ScreeningWhereInput = {};
    if (!includeAllStatuses) {
      where.status = ScreeningStatus.SCHEDULED;
      if (!query.from) {
        where.startTime = { gte: new Date() };
      }
    }
    if (query.movieId) where.movieId = query.movieId;
    if (query.screenId) where.screenId = query.screenId;
    if (query.from || query.to) {
      where.startTime = {};
      if (query.from) where.startTime.gte = new Date(query.from);
      if (query.to) where.startTime.lte = new Date(query.to);
    }
    if (query.movieSlug) {
      where.movie = { slug: query.movieSlug };
    }

    const [screenings, total] = await Promise.all([
      this.prisma.screening.findMany({
        where,
        skip,
        take,
        orderBy: { startTime: 'asc' },
        include: screeningInclude,
      }),
      this.prisma.screening.count({ where }),
    ]);

    return { data: screenings, meta: buildMeta(total, page, limit) };
  }

  async findOne(id: string) {
    const screening = await this.prisma.screening.findUnique({
      where: { id },
      include: {
        ...screeningInclude,
        screen: {
          include: {
            seats: {
              where: { status: 'ACTIVE' },
              orderBy: [{ row: 'asc' }, { number: 'asc' }],
            },
          },
        },
        reservations: { select: { seatId: true } },
      },
    });
    if (!screening) throw new NotFoundException('Screening not found');

    const reservedSeatIds = new Set(screening.reservations.map((r) => r.seatId));
    const { reservations, ...rest } = screening;
    void reservations;

    return {
      ...rest,
      reservedSeatIds: [...reservedSeatIds],
    };
  }

  async create(dto: CreateScreeningDto) {
    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);
    this.validateTimes(startTime, endTime);

    const [movie, screen] = await Promise.all([
      this.prisma.movie.findUnique({ where: { id: dto.movieId } }),
      this.prisma.screen.findUnique({ where: { id: dto.screenId } }),
    ]);
    if (!movie) throw new NotFoundException('Movie not found');
    if (!screen) throw new NotFoundException('Screen not found');

    if ((dto.status ?? ScreeningStatus.SCHEDULED) === ScreeningStatus.SCHEDULED) {
      await this.assertNoOverlap(dto.screenId, startTime, endTime);
    }

    return this.prisma.screening.create({
      data: {
        movieId: dto.movieId,
        screenId: dto.screenId,
        startTime,
        endTime,
        status: dto.status ?? ScreeningStatus.SCHEDULED,
      },
      include: screeningInclude,
    });
  }

  async update(id: string, dto: UpdateScreeningDto) {
    const existing = await this.prisma.screening.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Screening not found');

    const startTime = dto.startTime ? new Date(dto.startTime) : existing.startTime;
    const endTime = dto.endTime ? new Date(dto.endTime) : existing.endTime;
    const screenId = dto.screenId ?? existing.screenId;
    const status = dto.status ?? existing.status;

    this.validateTimes(startTime, endTime);

    if (status === ScreeningStatus.SCHEDULED) {
      await this.assertNoOverlap(screenId, startTime, endTime, id);
    }

    if (dto.movieId) {
      const movie = await this.prisma.movie.findUnique({ where: { id: dto.movieId } });
      if (!movie) throw new NotFoundException('Movie not found');
    }
    if (dto.screenId) {
      const screen = await this.prisma.screen.findUnique({ where: { id: dto.screenId } });
      if (!screen) throw new NotFoundException('Screen not found');
    }

    return this.prisma.screening.update({
      where: { id },
      data: {
        movieId: dto.movieId,
        screenId: dto.screenId,
        startTime,
        endTime,
        status: dto.status,
      },
      include: screeningInclude,
    });
  }

  async findByMovieId(movieId: string, query: QueryScreeningsDto) {
    return this.findAll({ ...query, movieId });
  }

  async getSeatAvailability(screeningId: string) {
    const screening = await this.prisma.screening.findUnique({
      where: { id: screeningId },
      include: {
        screen: {
          include: {
            seats: { orderBy: [{ row: 'asc' }, { number: 'asc' }] },
          },
        },
        reservations: { select: { seatId: true } },
      },
    });
    if (!screening) throw new NotFoundException('Screening not found');

    const bookedIds = new Set(screening.reservations.map((r) => r.seatId));
    const heldIds = new Set(await this.seatHolds.getHeldSeatIds(screeningId));

    const seats = screening.screen.seats.map((seat) => {
      let status: ComputedSeatStatus = 'AVAILABLE';
      if (seat.status === 'DISABLED') status = 'DISABLED';
      else if (bookedIds.has(seat.id)) status = 'BOOKED';
      else if (heldIds.has(seat.id)) status = 'HELD';
      return {
        id: seat.id,
        row: seat.row,
        number: seat.number,
        label: seat.label,
        seatType: seat.seatType,
        status,
        positionX: seat.positionX,
        positionY: seat.positionY,
      };
    });

    return {
      screeningId,
      screenId: screening.screenId,
      seats,
    };
  }

  async cancel(id: string) {
    const screening = await this.prisma.screening.findUnique({ where: { id } });
    if (!screening) throw new NotFoundException('Screening not found');
    if (screening.status === ScreeningStatus.CANCELLED) {
      throw new BadRequestException('Screening is already cancelled');
    }
    return this.prisma.screening.update({
      where: { id },
      data: { status: ScreeningStatus.CANCELLED },
      include: screeningInclude,
    });
  }

  async remove(id: string) {
    const screening = await this.prisma.screening.findUnique({
      where: { id },
      include: {
        bookings: {
          where: { status: { in: ['CONFIRMED', 'CHECKED_IN', 'PENDING'] } },
          take: 1,
        },
      },
    });
    if (!screening) throw new NotFoundException('Screening not found');
    if (screening.bookings.length) {
      throw new ConflictException('Cannot delete screening with active bookings');
    }

    await this.prisma.screening.delete({ where: { id } });
    return { message: 'Screening deleted' };
  }
}
