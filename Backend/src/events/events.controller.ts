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
import { EventsService } from './events.service';
import { CreateEventDto, QueryEventsDto, UpdateEventDto } from './dto/event.dto';
import { Public, Roles } from '../common/decorators';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import {
  paginatedResponse,
  successResponse,
} from '../common/types/api-response.type';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private events: EventsService) {}

  @Public()
  @Get()
  async findAll(@Query() query: QueryEventsDto) {
    const { data, meta } = await this.events.findAll(query);
    return paginatedResponse(data, meta);
  }

  @Public()
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    const data = await this.events.findBySlug(slug);
    return successResponse(data);
  }
}

@ApiTags('Admin — Events')
@Controller('admin/events')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class EventsAdminController {
  constructor(private events: EventsService) {}

  @Get()
  async findAll(@Query() query: QueryEventsDto) {
    const { data, meta } = await this.events.findAll(query, false);
    return paginatedResponse(data, meta);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.events.adminFindOne(id);
    return successResponse(data);
  }

  @Post()
  async create(@Body() dto: CreateEventDto) {
    const data = await this.events.create(dto);
    return successResponse(data, 'Event created');
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEventDto,
  ) {
    const data = await this.events.update(id, dto);
    return successResponse(data, 'Event updated');
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.events.remove(id);
    return successResponse(data);
  }
}
