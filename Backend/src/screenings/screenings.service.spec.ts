import { BadRequestException, ConflictException } from '@nestjs/common';
import { ScreeningStatus } from '@prisma/client';
import { ScreeningsService } from './screenings.service';
import { PrismaService } from '../prisma/prisma.service';
import { SeatHoldsService } from '../seat-holds/seat-holds.service';

describe('ScreeningsService', () => {
  let service: ScreeningsService;
  let prisma: jest.Mocked<Pick<PrismaService, 'screening' | 'movie' | 'screen'>>;

  beforeEach(() => {
    prisma = {
      screening: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      movie: { findUnique: jest.fn() },
      screen: { findUnique: jest.fn() },
    } as unknown as typeof prisma;

    service = new ScreeningsService(
      prisma as unknown as PrismaService,
      { getHeldSeatIds: jest.fn().mockResolvedValue([]) } as unknown as SeatHoldsService,
    );
  });

  it('rejects endTime before startTime on create', async () => {
    (prisma.movie.findUnique as jest.Mock).mockResolvedValue({ id: 'm1' });
    (prisma.screen.findUnique as jest.Mock).mockResolvedValue({ id: 's1' });

    await expect(
      service.create({
        movieId: 'm1',
        screenId: 's1',
        startTime: '2026-08-15T20:00:00.000Z',
        endTime: '2026-08-15T18:00:00.000Z',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('prevents overlapping scheduled screenings', async () => {
    (prisma.movie.findUnique as jest.Mock).mockResolvedValue({ id: 'm1' });
    (prisma.screen.findUnique as jest.Mock).mockResolvedValue({ id: 's1' });
    (prisma.screening.findFirst as jest.Mock).mockResolvedValue({ id: 'existing' });

    await expect(
      service.create({
        movieId: 'm1',
        screenId: 's1',
        startTime: '2026-08-15T18:00:00.000Z',
        endTime: '2026-08-15T20:00:00.000Z',
        status: ScreeningStatus.SCHEDULED,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
