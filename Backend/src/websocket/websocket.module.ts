import { Module } from '@nestjs/common';
import { CinemaGateway } from './cinema.gateway';
import { SeatHoldsModule } from '../seat-holds/seat-holds.module';

@Module({
  imports: [SeatHoldsModule],
  providers: [CinemaGateway],
  exports: [CinemaGateway],
})
export class WebsocketModule {}
