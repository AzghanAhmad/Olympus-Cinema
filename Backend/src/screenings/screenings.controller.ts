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
import { ScreeningsService } from './screenings.service';
import {
  CreateScreeningDto,
  QueryScreeningsDto,
  UpdateScreeningDto,
} from './dto/screening.dto';
import { Public, Roles } from '../common/decorators';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import {
  paginatedResponse,
  successResponse,
} from '../common/types/api-response.type';

@ApiTags('Screenings')
@Controller('screenings')
export class ScreeningsController {
  constructor(private screenings: ScreeningsService) {}

  @Public()
  @Get()
  async findAll(@Query() query: QueryScreeningsDto) {
    const { data, meta } = await this.screenings.findAll(query);
    return paginatedResponse(data, meta);
  }

  @Public()
  @Get('movie/:movieId')
  async findByMovie(
    @Param('movieId', ParseUUIDPipe) movieId: string,
    @Query() query: QueryScreeningsDto,
  ) {
    const { data, meta } = await this.screenings.findByMovieId(movieId, query);
    return paginatedResponse(data, meta);
  }

  @Public()
  @Get(':id/seats')
  async getSeats(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.screenings.getSeatAvailability(id);
    return successResponse(data);
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.screenings.findOne(id);
    return successResponse(data);
  }
}

@ApiTags('Admin — Screenings')
@Controller('admin/screenings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class ScreeningsAdminController {
  constructor(private screenings: ScreeningsService) {}

  @Get()
  async findAll(@Query() query: QueryScreeningsDto) {
    const { data, meta } = await this.screenings.findAll(query, true);
    return paginatedResponse(data, meta);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.screenings.findOne(id);
    return successResponse(data);
  }

  @Post()
  async create(@Body() dto: CreateScreeningDto) {
    const data = await this.screenings.create(dto);
    return successResponse(data, 'Screening created');
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateScreeningDto,
  ) {
    const data = await this.screenings.update(id, dto);
    return successResponse(data, 'Screening updated');
  }

  @Post(':id/cancel')
  async cancel(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.screenings.cancel(id);
    return successResponse(data, 'Screening cancelled');
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.screenings.remove(id);
    return successResponse(data);
  }
}
