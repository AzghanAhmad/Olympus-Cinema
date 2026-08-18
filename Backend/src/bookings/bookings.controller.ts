import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, QueryBookingsDto } from './dto/booking.dto';
import { CurrentUser, Public, Roles } from '../common/decorators';
import type { JwtPayloadUser } from '../common/decorators';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import {
  paginatedResponse,
  successResponse,
} from '../common/types/api-response.type';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private bookings: BookingsService) {}

  @Public()
  @Post()
  async create(
    @Body() dto: CreateBookingDto,
    @CurrentUser() user?: JwtPayloadUser,
  ) {
    const data = await this.bookings.create(dto, user?.sub);
    return successResponse(data, 'Reservation submitted');
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  async findMyBookings(
    @CurrentUser() user: JwtPayloadUser,
    @Query() query: QueryBookingsDto,
  ) {
    const { data, meta } = await this.bookings.findMyBookings(user.sub, query);
    return paginatedResponse(data, meta);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me/:id')
  async findMyBooking(
    @CurrentUser() user: JwtPayloadUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.bookings.findOne(id, user.sub);
    return successResponse(data);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('me/:id/cancel')
  async cancelMyBooking(
    @CurrentUser() user: JwtPayloadUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.bookings.cancel(id, user.sub);
    return successResponse(data, 'Booking cancelled');
  }

  @Public()
  @Get(':id')
  async findPublic(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.bookings.findOne(id, undefined, true);
    return successResponse(data);
  }
}

@ApiTags('Admin — Bookings')
@Controller('admin/bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class BookingsAdminController {
  constructor(private bookings: BookingsService) {}

  @Get()
  async findAll(@Query() query: QueryBookingsDto) {
    const { data, meta } = await this.bookings.findAllAdmin(query);
    return paginatedResponse(data, meta);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.bookings.findOne(id, undefined, true);
    return successResponse(data);
  }

  @Post(':id/confirm')
  async confirm(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.bookings.confirm(id);
    return successResponse(data, 'Booking confirmed');
  }

  @Post(':id/cancel')
  async cancel(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.bookings.cancel(id, undefined, true);
    return successResponse(data, 'Booking cancelled');
  }
}
