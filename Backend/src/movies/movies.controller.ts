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
import { MoviesService } from './movies.service';
import { CreateMovieDto, QueryMoviesDto, UpdateMovieDto } from './dto/movie.dto';
import { Public, Roles } from '../common/decorators';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import {
  paginatedResponse,
  successResponse,
} from '../common/types/api-response.type';

@ApiTags('Movies')
@Controller('movies')
export class MoviesController {
  constructor(private movies: MoviesService) {}

  @Public()
  @Get()
  async findAll(@Query() query: QueryMoviesDto) {
    const { data, meta } = await this.movies.findAll(query);
    return paginatedResponse(data, meta);
  }

  @Public()
  @Get('featured')
  async findFeatured() {
    const data = await this.movies.findFeatured();
    return successResponse(data);
  }

  @Public()
  @Get('now-showing')
  async findNowShowing() {
    const data = await this.movies.findNowShowing();
    return successResponse(data);
  }

  @Public()
  @Get('coming-soon')
  async findComingSoon() {
    const data = await this.movies.findComingSoon();
    return successResponse(data);
  }

  @Public()
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    const data = await this.movies.findBySlug(slug);
    return successResponse(data);
  }
}

@ApiTags('Admin — Movies')
@Controller('admin/movies')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class MoviesAdminController {
  constructor(private movies: MoviesService) {}

  @Get()
  async findAll(@Query() query: QueryMoviesDto) {
    const { data, meta } = await this.movies.adminFindAll(query);
    return paginatedResponse(data, meta);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.movies.adminFindOne(id);
    return successResponse(data);
  }

  @Post()
  async create(@Body() dto: CreateMovieDto) {
    const data = await this.movies.create(dto);
    return successResponse(data, 'Movie created');
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMovieDto,
  ) {
    const data = await this.movies.update(id, dto);
    return successResponse(data, 'Movie updated');
  }

  @Patch(':id/publish')
  async publish(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.movies.publish(id);
    return successResponse(data, 'Movie published');
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.movies.remove(id);
    return successResponse(data);
  }
}
