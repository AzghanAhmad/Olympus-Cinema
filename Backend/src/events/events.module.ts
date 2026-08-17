import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController, EventsAdminController } from './events.controller';

@Module({
  controllers: [EventsController, EventsAdminController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
