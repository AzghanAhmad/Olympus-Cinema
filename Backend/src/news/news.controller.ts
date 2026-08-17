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
import { NewsService } from './news.service';
import { CreateNewsDto, QueryNewsDto, UpdateNewsDto } from './dto/news.dto';
import { CurrentUser, Public, Roles } from '../common/decorators';
import type { JwtPayloadUser } from '../common/decorators';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import {
  paginatedResponse,
  successResponse,
} from '../common/types/api-response.type';

@ApiTags('News')
@Controller('news')
export class NewsController {
  constructor(private news: NewsService) {}

  @Public()
  @Get()
  async findAll(@Query() query: QueryNewsDto) {
    const { data, meta } = await this.news.findAll(query);
    return paginatedResponse(data, meta);
  }

  @Public()
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    const data = await this.news.findBySlug(slug);
    return successResponse(data);
  }
}

@ApiTags('Admin — News')
@Controller('admin/news')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class NewsAdminController {
  constructor(private news: NewsService) {}

  @Get()
  async findAll(@Query() query: QueryNewsDto) {
    const { data, meta } = await this.news.findAll(query, false);
    return paginatedResponse(data, meta);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.news.adminFindOne(id);
    return successResponse(data);
  }

  @Post()
  async create(
    @Body() dto: CreateNewsDto,
    @CurrentUser() user: JwtPayloadUser,
  ) {
    const data = await this.news.create(dto, user.sub);
    return successResponse(data, 'News article created');
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateNewsDto,
  ) {
    const data = await this.news.update(id, dto);
    return successResponse(data, 'News article updated');
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.news.remove(id);
    return successResponse(data);
  }
}
