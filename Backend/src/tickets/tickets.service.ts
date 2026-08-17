import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TicketStatus } from '@prisma/client';
import PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';
import { PrismaService } from '../prisma/prisma.service';
import { VerifyTicketDto } from './dto/ticket.dto';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async verify(dto: VerifyTicketDto) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { secureToken: dto.secureToken },
      include: {
        booking: {
          include: {
            screening: {
              include: {
                movie: { select: { title: true } },
                screen: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    if (!ticket) throw new NotFoundException('Ticket not found');
    if (ticket.status === TicketStatus.VOID) {
      throw new BadRequestException('Ticket is void');
    }
    if (ticket.status === TicketStatus.USED) {
      return {
        valid: false,
        ticket,
        message: 'Ticket already used',
      };
    }

    return {
      valid: true,
      ticket,
      message: 'Ticket is valid',
    };
  }

  async checkIn(id: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: { booking: true },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    if (ticket.status === TicketStatus.VOID) {
      throw new BadRequestException('Ticket is void');
    }
    if (ticket.status === TicketStatus.USED) {
      throw new BadRequestException('Ticket already checked in');
    }
    if (ticket.booking.status === 'CANCELLED') {
      throw new BadRequestException('Booking is cancelled');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const checkedIn = await tx.ticket.update({
        where: { id },
        data: { status: TicketStatus.USED, checkedInAt: new Date() },
        include: {
          booking: {
            include: {
              screening: {
                include: {
                  movie: { select: { title: true } },
                  screen: { select: { name: true } },
                },
              },
            },
          },
        },
      });

      const activeTickets = await tx.ticket.count({
        where: {
          bookingId: ticket.bookingId,
          status: TicketStatus.ACTIVE,
          id: { not: id },
        },
      });

      if (activeTickets === 0) {
        await tx.booking.update({
          where: { id: ticket.bookingId },
          data: { status: 'CHECKED_IN' },
        });
      }

      return checkedIn;
    });

    return updated;
  }

  async findOne(id: string, userId?: string, isStaff = false) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            screening: {
              include: {
                movie: { select: { title: true, slug: true } },
                screen: { select: { name: true } },
              },
            },
          },
        },
      },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    if (!isStaff && ticket.booking.userId !== userId) {
      throw new NotFoundException('Ticket not found');
    }
    return ticket;
  }

  async generatePdf(id: string, userId?: string, isStaff = false): Promise<Buffer> {
    const ticket = await this.findOne(id, userId, isStaff);
    const movieTitle = ticket.booking.screening.movie.title;
    const screenName = ticket.booking.screening.screen.name;
    const startTime = ticket.booking.screening.startTime;
    const qrDataUrl = await QRCode.toDataURL(ticket.qrPayload);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(20).text('Cinema Ticket', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Ticket Code: ${ticket.ticketCode}`);
      doc.text(`Booking Code: ${ticket.booking.bookingCode}`);
      doc.text(`Movie: ${movieTitle}`);
      doc.text(`Screen: ${screenName}`);
      doc.text(`Seat: ${ticket.seatLabel}`);
      doc.text(`Date: ${startTime.toLocaleDateString()}`);
      doc.text(`Time: ${startTime.toLocaleTimeString()}`);
      doc.moveDown();

      const base64 = qrDataUrl.split(',')[1];
      if (base64) {
        const qrBuffer = Buffer.from(base64, 'base64');
        doc.image(qrBuffer, { fit: [150, 150], align: 'center' });
      }

      doc.end();
    });
  }
}
