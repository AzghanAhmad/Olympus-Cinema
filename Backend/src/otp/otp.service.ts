import {
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { createHash, randomInt } from 'crypto';
import { RedisService } from '../redis/redis.service';
import { EmailService } from '../email/email.service';
import { SendOtpDto, VerifyOtpDto } from './dto/otp.dto';

const OTP_TTL_SECONDS = 10 * 60;

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    private redis: RedisService,
    private email: EmailService,
  ) {}

  private destination(dto: { channel: string; email?: string; phone?: string }) {
    if (dto.channel === 'email') {
      const email = dto.email?.trim().toLowerCase();
      if (!email) throw new BadRequestException('Email is required');
      return email;
    }
    const phone = dto.phone?.trim();
    if (!phone) throw new BadRequestException('Phone is required');
    return phone;
  }

  private redisKey(channel: string, destination: string) {
    return `otp:${channel}:${destination}`;
  }

  private hashCode(code: string) {
    return createHash('sha256').update(code).digest('hex');
  }

  private generateCode() {
    return String(randomInt(100000, 999999));
  }

  async send(dto: SendOtpDto) {
    const destination = this.destination(dto);
    const code = this.generateCode();
    const key = this.redisKey(dto.channel, destination);

    await this.redis.setJson(
      key,
      { hash: this.hashCode(code), attempts: 0 },
      OTP_TTL_SECONDS,
    );

    if (dto.channel === 'email') {
      await this.email.sendOtpCode({
        email: destination,
        code,
        purpose: 'booking',
      });
      return { sent: true, channel: 'email' as const };
    }

    // No SMS provider configured — deliver phone OTP to the guest email when available.
    const email = dto.email?.trim().toLowerCase();
    if (!email) {
      throw new BadRequestException(
        'SMS is not configured. Enter your email and verify by email, or add an email to receive the phone code.',
      );
    }

    await this.email.sendOtpCode({
      email,
      code,
      purpose: `phone (${destination})`,
    });

    return { sent: true, channel: 'phone' as const, deliveredVia: 'email' as const };
  }

  async verify(dto: VerifyOtpDto) {
    const destination = this.destination(dto);
    const key = this.redisKey(dto.channel, destination);
    const stored = await this.redis.getJson<{ hash: string; attempts: number }>(key);

    if (!stored?.hash) {
      throw new BadRequestException('Code expired or not found. Please request a new one.');
    }

    if (stored.attempts >= 5) {
      await this.redis.del(key);
      throw new BadRequestException('Too many attempts. Please request a new code.');
    }

    const incoming = this.hashCode(dto.code.trim());
    if (incoming !== stored.hash) {
      await this.redis.setJson(
        key,
        { hash: stored.hash, attempts: stored.attempts + 1 },
        OTP_TTL_SECONDS,
      );
      throw new BadRequestException('Invalid verification code');
    }

    await this.redis.del(key);
    this.logger.log(`OTP verified for ${dto.channel}:${destination}`);
    return { verified: true, channel: dto.channel };
  }
}
