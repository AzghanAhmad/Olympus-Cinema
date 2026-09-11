import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../common/decorators';
import { successResponse } from '../common/types/api-response.type';
import { OtpService } from './otp.service';
import { SendOtpDto, VerifyOtpDto } from './dto/otp.dto';

@ApiTags('OTP')
@Controller('otp')
export class OtpController {
  constructor(private otp: OtpService) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('send')
  async send(@Body() dto: SendOtpDto) {
    const data = await this.otp.send(dto);
    return successResponse(data, 'Verification code sent');
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('verify')
  async verify(@Body() dto: VerifyOtpDto) {
    const data = await this.otp.verify(dto);
    return successResponse(data, 'Verified');
  }
}
