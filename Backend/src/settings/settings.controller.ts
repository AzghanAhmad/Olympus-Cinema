import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/settings.dto';
import { Public, Roles } from '../common/decorators';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { successResponse } from '../common/types/api-response.type';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private settings: SettingsService) {}

  @Public()
  @Get()
  async getPublic() {
    const data = await this.settings.getPublicSettings();
    return successResponse(data);
  }
}

@ApiTags('Admin — Settings')
@Controller('admin/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class SettingsAdminController {
  constructor(private settings: SettingsService) {}

  @Get()
  async getAll() {
    const data = await this.settings.getAllSettings();
    return successResponse(data);
  }

  @Patch()
  async update(@Body() dto: UpdateSettingsDto) {
    const data = await this.settings.updateSettings(dto);
    return successResponse(data, 'Settings updated');
  }
}
