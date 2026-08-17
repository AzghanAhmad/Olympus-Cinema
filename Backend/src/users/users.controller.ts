import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { UsersService } from './users.service';
import {
  AdminUpdateUserDto,
  QueryUsersDto,
  UpdatePasswordDto,
  UpdateUserDto,
  UpdateUserStatusDto,
} from './dto/update-user.dto';
import { CurrentUser, Roles } from '../common/decorators';
import type { JwtPayloadUser } from '../common/decorators';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import {
  paginatedResponse,
  successResponse,
} from '../common/types/api-response.type';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private users: UsersService) {}

  @Get('me')
  async getMe(@CurrentUser() user: JwtPayloadUser) {
    const data = await this.users.findMe(user.sub);
    return successResponse(data);
  }

  @Patch('me')
  async updateMe(
    @CurrentUser() user: JwtPayloadUser,
    @Body() dto: UpdateUserDto,
  ) {
    const data = await this.users.updateMe(user.sub, dto);
    return successResponse(data, 'Profile updated');
  }

  @Patch('me/password')
  async updatePassword(
    @CurrentUser() user: JwtPayloadUser,
    @Body() dto: UpdatePasswordDto,
  ) {
    const data = await this.users.updatePassword(user.sub, dto);
    return successResponse(data);
  }
}

@ApiTags('Admin — Users')
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class UsersAdminController {
  constructor(private users: UsersService) {}

  @Get()
  async findAll(@Query() query: QueryUsersDto) {
    const { data, meta } = await this.users.findAll(query);
    return paginatedResponse(data, meta);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.users.findOne(id);
    return successResponse(data);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminUpdateUserDto,
  ) {
    const data = await this.users.adminUpdate(id, dto);
    return successResponse(data, 'User updated');
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    const data = await this.users.updateStatus(id, dto);
    return successResponse(data, 'User status updated');
  }
}
