import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import type { Response } from 'express';
import { TicketsService } from './tickets.service';
import { VerifyTicketDto } from './dto/ticket.dto';
import { CurrentUser, Roles } from '../common/decorators';
import type { JwtPayloadUser } from '../common/decorators';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { successResponse } from '../common/types/api-response.type';

@ApiTags('Tickets')
@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TicketsController {
  constructor(private tickets: TicketsService) {}

  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @Post('verify')
  async verify(@Body() dto: VerifyTicketDto) {
    const data = await this.tickets.verify(dto);
    return successResponse(data);
  }

  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @Post(':id/check-in')
  async checkIn(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.tickets.checkIn(id);
    return successResponse(data, 'Ticket checked in');
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayloadUser,
  ) {
    const isStaff = user.role === UserRole.STAFF || user.role === UserRole.ADMIN;
    const data = await this.tickets.findOne(id, user.sub, isStaff);
    return successResponse(data);
  }

  @Get(':id/download')
  async download(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayloadUser,
    @Res() res: Response,
  ) {
    const isStaff = user.role === UserRole.STAFF || user.role === UserRole.ADMIN;
    const pdf = await this.tickets.generatePdf(id, user.sub, isStaff);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="ticket-${id}.pdf"`,
    );
    res.send(pdf);
  }
}
