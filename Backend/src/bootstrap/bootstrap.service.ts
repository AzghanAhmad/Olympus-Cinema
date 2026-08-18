import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { UserRole, UserStatus } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';

const SEED_PASSWORD = 'Password123!';

@Injectable()
export class BootstrapService implements OnModuleInit {
  private readonly logger = new Logger(BootstrapService.name);

  constructor(private prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    try {
      const passwordHash = await argon2.hash(SEED_PASSWORD);

      const admin = await this.prisma.user.upsert({
        where: { email: 'admin@cinema.local' },
        update: {
          role: UserRole.ADMIN,
          status: UserStatus.ACTIVE,
          emailVerified: true,
          passwordHash,
        },
        create: {
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@cinema.local',
          passwordHash,
          role: UserRole.ADMIN,
          status: UserStatus.ACTIVE,
          emailVerified: true,
        },
      });

      await this.prisma.user.upsert({
        where: { email: 'staff@cinema.local' },
        update: { role: UserRole.STAFF, status: UserStatus.ACTIVE, emailVerified: true },
        create: {
          firstName: 'Staff',
          lastName: 'Member',
          email: 'staff@cinema.local',
          passwordHash,
          role: UserRole.STAFF,
          status: UserStatus.ACTIVE,
          emailVerified: true,
        },
      });

      await this.prisma.user.upsert({
        where: { email: 'user@cinema.local' },
        update: { role: UserRole.USER, status: UserStatus.ACTIVE, emailVerified: true },
        create: {
          firstName: 'Sample',
          lastName: 'User',
          email: 'user@cinema.local',
          phone: '+1234567890',
          passwordHash,
          role: UserRole.USER,
          status: UserStatus.ACTIVE,
          emailVerified: true,
        },
      });

      this.logger.log(`Admin account ready: ${admin.email}`);
    } catch (err) {
      this.logger.error(
        `Could not ensure seed accounts exist: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}
