import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import {
  BookingsController,
  BookingsAdminController,
} from './bookings.controller';
import { SeatHoldsModule } from '../seat-holds/seat-holds.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [SeatHoldsModule, EmailModule],
  controllers: [BookingsController, BookingsAdminController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
