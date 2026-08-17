import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ScreeningStatus } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { REDIS_KEYS } from '../common/constants';
import { HoldMeta } from './interfaces/hold-meta.interface';
import { CreateHoldDto } from './dto/seat-hold.dto';

@Injectable()
export class SeatHoldsService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private config: ConfigService,
  ) {}

  private getHoldTtlSeconds(): number {
    return this.config.get<number>('SEAT_HOLD_MINUTES', 10) * 60;
  }

  async createHold(
    screeningId: string,
    dto: CreateHoldDto,
    userId?: string,
  ): Promise<HoldMeta> {
    const screening = await this.prisma.screening.findUnique({
      where: { id: screeningId },
      include: { screen: true },
    });
    if (!screening) throw new NotFoundException('Screening not found');
    if (screening.status !== ScreeningStatus.SCHEDULED) {
      throw new BadRequestException('Screening is not available for booking');
    }
    if (screening.startTime <= new Date()) {
      throw new BadRequestException('Screening has already started');
    }

    const uniqueSeatIds = [...new Set(dto.seatIds)];
    const seats = await this.prisma.seat.findMany({
      where: {
        id: { in: uniqueSeatIds },
        screenId: screening.screenId,
        status: 'ACTIVE',
      },
    });

    if (seats.length !== uniqueSeatIds.length) {
      throw new BadRequestException('One or more seats are invalid or inactive');
    }

    const reserved = await this.prisma.screeningSeatReservation.findMany({
      where: { screeningId, seatId: { in: uniqueSeatIds } },
    });
    if (reserved.length) {
      throw new ConflictException('One or more seats are already booked');
    }

    const holdId = randomUUID();
    const ttlSeconds = this.getHoldTtlSeconds();
    const keys = uniqueSeatIds.map((seatId) =>
      REDIS_KEYS.seatHold(screeningId, seatId),
    );

    const { acquired, failed } = await this.redis.acquireSeatHolds(
      keys,
      holdId,
      ttlSeconds,
    );

    if (failed.length > 0) {
      throw new ConflictException('One or more seats are currently held by another user');
    }

    const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();
    const meta: HoldMeta = {
      holdId,
      screeningId,
      userId,
      sessionId: dto.sessionId,
      seatIds: uniqueSeatIds,
      expiresAt,
    };

    await this.redis.setJson(REDIS_KEYS.holdMeta(holdId), meta, ttlSeconds);
    await this.redis.setJson(REDIS_KEYS.holdSeats(holdId), uniqueSeatIds, ttlSeconds);

    return meta;
  }

  async getHold(holdId: string): Promise<HoldMeta | null> {
    return this.redis.getJson<HoldMeta>(REDIS_KEYS.holdMeta(holdId));
  }

  async releaseHold(holdId: string, userId?: string, sessionId?: string) {
    const meta = await this.getHold(holdId);
    if (!meta) throw new NotFoundException('Hold not found or expired');

    if (userId && meta.userId && meta.userId !== userId) {
      throw new ForbiddenException('You cannot release this hold');
    }
    if (
      !userId &&
      sessionId &&
      meta.sessionId &&
      meta.sessionId !== sessionId
    ) {
      throw new ForbiddenException('You cannot release this hold');
    }

    await this.releaseHoldInternal(meta);
    return { message: 'Hold released' };
  }

  async releaseHoldInternal(meta: HoldMeta) {
    const keys = meta.seatIds.map((seatId) =>
      REDIS_KEYS.seatHold(meta.screeningId, seatId),
    );
    await this.redis.del(...keys, REDIS_KEYS.holdMeta(meta.holdId), REDIS_KEYS.holdSeats(meta.holdId));
  }

  async validateHoldForBooking(
    holdId: string,
    screeningId: string,
    seatIds: string[],
    userId?: string,
  ): Promise<HoldMeta> {
    const meta = await this.getHold(holdId);
    if (!meta) throw new BadRequestException('Hold expired or not found');
    if (meta.screeningId !== screeningId) {
      throw new BadRequestException('Hold does not match screening');
    }
    if (userId && meta.userId && meta.userId !== userId) {
      throw new ForbiddenException('Hold belongs to another user');
    }

    const requested = new Set(seatIds);
    const held = new Set(meta.seatIds);
    if (requested.size !== held.size || ![...requested].every((id) => held.has(id))) {
      throw new BadRequestException('Seat selection does not match hold');
    }

    return meta;
  }

  async getHeldSeatIds(screeningId: string): Promise<string[]> {
    const screening = await this.prisma.screening.findUnique({
      where: { id: screeningId },
      include: { screen: { include: { seats: { select: { id: true } } } } },
    });
    if (!screening) return [];

    const held: string[] = [];
    for (const seat of screening.screen.seats) {
      const key = REDIS_KEYS.seatHold(screeningId, seat.id);
      const value = await this.redis.client.get(key);
      if (value) held.push(seat.id);
    }
    return held;
  }
}
