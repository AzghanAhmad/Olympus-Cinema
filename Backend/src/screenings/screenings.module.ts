import { Module, forwardRef } from '@nestjs/common';
import { ScreeningsService } from './screenings.service';
import {
  ScreeningsController,
  ScreeningsAdminController,
} from './screenings.controller';
import { SeatHoldsModule } from '../seat-holds/seat-holds.module';

@Module({
  imports: [forwardRef(() => SeatHoldsModule)],
  controllers: [ScreeningsController, ScreeningsAdminController],
  providers: [ScreeningsService],
  exports: [ScreeningsService],
})
export class ScreeningsModule {}