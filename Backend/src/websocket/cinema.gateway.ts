import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { SeatHoldsService } from '../seat-holds/seat-holds.service';
import { CreateHoldDto } from '../seat-holds/dto/seat-hold.dto';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/cinema',
})
export class CinemaGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(CinemaGateway.name);

  constructor(
    private seatHolds: SeatHoldsService,
    private prisma: PrismaService,
  ) {}

  handleConnection(client: Socket) {
    this.logger.debug(`Client connected: ${client.id}`);
  }

  @SubscribeMessage('join-screening')
  async handleJoinScreening(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { screeningId: string },
  ) {
    const room = `screening:${payload.screeningId}`;
    await client.join(room);

    const [reservedSeatIds, heldSeatIds] = await Promise.all([
      this.getReservedSeatIds(payload.screeningId),
      this.seatHolds.getHeldSeatIds(payload.screeningId),
    ]);

    client.emit('seat-map', {
      screeningId: payload.screeningId,
      reservedSeatIds,
      heldSeatIds,
    });

    return { event: 'joined', screeningId: payload.screeningId };
  }

  @SubscribeMessage('hold-seats')
  async handleHoldSeats(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      screeningId: string;
      seatIds: string[];
      sessionId?: string;
      userId?: string;
    },
  ) {
    const dto: CreateHoldDto = {
      seatIds: payload.seatIds,
      sessionId: payload.sessionId ?? client.id,
    };

    try {
      const hold = await this.seatHolds.createHold(
        payload.screeningId,
        dto,
        payload.userId,
      );

      this.broadcastSeatUpdate(payload.screeningId, {
        type: 'hold-created',
        holdId: hold.holdId,
        seatIds: hold.seatIds,
        expiresAt: hold.expiresAt,
      });

      return { success: true, hold };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Hold failed';
      return { success: false, message };
    }
  }

  @SubscribeMessage('release-hold')
  async handleReleaseHold(
    @MessageBody()
    payload: { holdId: string; screeningId: string; sessionId?: string; userId?: string },
  ) {
    try {
      await this.seatHolds.releaseHold(
        payload.holdId,
        payload.userId,
        payload.sessionId,
      );

      this.broadcastSeatUpdate(payload.screeningId, {
        type: 'hold-released',
        holdId: payload.holdId,
      });

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Release failed';
      return { success: false, message };
    }
  }

  broadcastSeatUpdate(screeningId: string, data: unknown) {
    this.server.to(`screening:${screeningId}`).emit('seat-update', data);
  }

  private async getReservedSeatIds(screeningId: string): Promise<string[]> {
    const reservations = await this.prisma.screeningSeatReservation.findMany({
      where: { screeningId },
      select: { seatId: true },
    });
    return reservations.map((r) => r.seatId);
  }
}
