import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsController, SettingsAdminController } from './settings.controller';

@Module({
  controllers: [SettingsController, SettingsAdminController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
