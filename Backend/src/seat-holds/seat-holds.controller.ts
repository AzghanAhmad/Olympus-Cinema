import {
  Body,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SeatHoldsService } from './seat-holds.service';
import { CreateHoldDto, ReleaseHoldDto } from './dto/seat-hold.dto';
import { CurrentUser, Public } from '../common/decorators';
import type { JwtPayloadUser } from '../common/decorators';
import { successResponse } from '../common/types/api-response.type';

@ApiTags('Seat Holds')
@Controller('screenings')
export class SeatHoldsController {
  constructor(private seatHolds: SeatHoldsService) {}

  @Public()
  @Post(':screeningId/holds')
  async createHold(
    @Param('screeningId', ParseUUIDPipe) screeningId: string,
    @Body() dto: CreateHoldDto,
    @CurrentUser() user?: JwtPayloadUser,
  ) {
    const data = await this.seatHolds.createHold(screeningId, dto, user?.sub);
    return successResponse(data, 'Seats held successfully');
  }

  @Public()
  @Delete(':screeningId/holds')
  async releaseHold(
    @Body() dto: ReleaseHoldDto,
    @CurrentUser() user?: JwtPayloadUser,
  ) {
    const data = await this.seatHolds.releaseHold(
      dto.holdId,
      user?.sub,
      undefined,
    );
    return successResponse(data);
  }
}
