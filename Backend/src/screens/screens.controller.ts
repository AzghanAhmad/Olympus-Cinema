import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { ScreensService } from './screens.service';
import {
  BulkCreateSeatsDto,
  CreateScreenDto,
  CreateSeatDto,
  QueryScreensDto,
  UpdateScreenDto,
  UpdateSeatDto,
} from './dto/screen.dto';
import { Roles } from '../common/decorators';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import {
  paginatedResponse,
  successResponse,
} from '../common/types/api-response.type';

@ApiTags('Admin — Screens')
@Controller('admin/screens')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class ScreensController {
  constructor(private screens: ScreensService) {}

  @Get()
  async findAll(@Query() query: QueryScreensDto) {
    const { data, meta } = await this.screens.findAll(query);
    return paginatedResponse(data, meta);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.screens.findOne(id);
    return successResponse(data);
  }

  @Post()
  async create(@Body() dto: CreateScreenDto) {
    const data = await this.screens.create(dto);
    return successResponse(data, 'Screen created');
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateScreenDto,
  ) {
    const data = await this.screens.update(id, dto);
    return successResponse(data, 'Screen updated');
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.screens.remove(id);
    return successResponse(data);
  }

  @Get(':screenId/seats')
  async listSeats(@Param('screenId', ParseUUIDPipe) screenId: string) {
    const data = await this.screens.listSeats(screenId);
    return successResponse(data);
  }

  @Post(':screenId/seats')
  async createSeat(
    @Param('screenId', ParseUUIDPipe) screenId: string,
    @Body() dto: CreateSeatDto,
  ) {
    const data = await this.screens.createSeat(screenId, dto);
    return successResponse(data, 'Seat created');
  }

  @Post(':screenId/seats/bulk')
  async bulkCreateSeats(
    @Param('screenId', ParseUUIDPipe) screenId: string,
    @Body() dto: BulkCreateSeatsDto,
  ) {
    const data = await this.screens.bulkCreateSeats(screenId, dto);
    return successResponse(data, 'Seats created');
  }

  @Patch(':screenId/seats/:seatId')
  async updateSeat(
    @Param('screenId', ParseUUIDPipe) screenId: string,
    @Param('seatId', ParseUUIDPipe) seatId: string,
    @Body() dto: UpdateSeatDto,
  ) {
    const data = await this.screens.updateSeat(screenId, seatId, dto);
    return successResponse(data, 'Seat updated');
  }

  @Delete(':screenId/seats/:seatId')
  async removeSeat(
    @Param('screenId', ParseUUIDPipe) screenId: string,
    @Param('seatId', ParseUUIDPipe) seatId: string,
  ) {
    const data = await this.screens.removeSeat(screenId, seatId);
    return successResponse(data);
  }
}
