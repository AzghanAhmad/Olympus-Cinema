import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto, ResetPasswordDto } from './dto/auth.dto';
import { hashToken, sanitizeUser, generateSecureToken } from '../common/utils';
import { EmailService } from '../email/email.service';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private email: EmailService,
  ) {}

  async register(dto: RegisterDto, userAgent?: string, ip?: string) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await argon2.hash(dto.password);
    const user = await this.prisma.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        passwordHash,
      },
    });

    const tokens = await this.issueTokens(user.id, user.email, user.role, userAgent, ip);
    await this.email.sendWelcomeEmail(user.email, user.firstName).catch((e) =>
      this.logger.warn('Welcome email failed', e),
    );

    return { user: sanitizeUser(user), ...tokens };
  }

  async login(dto: LoginDto, userAgent?: string, ip?: string) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) {
      this.logger.warn(`Failed login attempt for ${dto.email} from ${ip}`);
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user.status !== 'ACTIVE') throw new UnauthorizedException('Account is not active');

    const tokens = await this.issueTokens(user.id, user.email, user.role, userAgent, ip);
    return { user: sanitizeUser(user), ...tokens };
  }

  async refresh(refreshToken: string, userAgent?: string, ip?: string) {
    if (!refreshToken) throw new UnauthorizedException('Refresh token required');
    const tokenHash = hashToken(refreshToken);

    const stored = await this.prisma.refreshToken.findFirst({
      where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
      include: { user: true },
    });
    if (!stored) throw new UnauthorizedException('Invalid refresh token');

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return this.issueTokens(
      stored.user.id,
      stored.user.email,
      stored.user.role,
      userAgent,
      ip,
    );
  }

  async logout(refreshToken: string) {
    if (!refreshToken) return;
    const tokenHash = hashToken(refreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async logoutAll(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return { message: 'If the email exists, a reset link was sent' };

    const token = generateSecureToken(32);
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await this.prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    await this.email.sendPasswordReset(user.email, token).catch((e) =>
      this.logger.warn('Password reset email failed', e),
    );

    return { message: 'If the email exists, a reset link was sent' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = hashToken(dto.token);
    const record = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });
    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await argon2.hash(dto.password);
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
      this.prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId: record.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    return { message: 'Password reset successful' };
  }

  private async issueTokens(
    userId: string,
    email: string,
    role: string,
    userAgent?: string,
    ip?: string,
  ): Promise<AuthTokens> {
    const payload = { sub: userId, email, role };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES_IN', '15m') as `${number}${'s' | 'm' | 'h' | 'd'}`,
    });

    const refreshToken = randomBytes(48).toString('base64url');
    const tokenHash = hashToken(refreshToken);
    const refreshExpires = this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');
    const expiresAt = this.addDuration(new Date(), refreshExpires);

    await this.prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt, userAgent, ipAddress: ip },
    });

    return { accessToken, refreshToken };
  }

  private addDuration(from: Date, duration: string): Date {
    const match = /^(\d+)([smhd])$/.exec(duration);
    if (!match) return new Date(from.getTime() + 7 * 86400000);
    const value = parseInt(match[1], 10);
    const unit = match[2];
    const ms =
      unit === 's' ? value * 1000 :
      unit === 'm' ? value * 60000 :
      unit === 'h' ? value * 3600000 :
      value * 86400000;
    return new Date(from.getTime() + ms);
  }
}
