import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { UserRole, UserStatus } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { seedCinemaCatalog } from './cinema-seed';

const DEFAULT_ADMIN_EMAIL = 'admin-crystalmaldives@gmail.com';
const DEFAULT_ADMIN_PASSWORD = 'Crystal@999';

@Injectable()
export class BootstrapService implements OnModuleInit {
  private readonly logger = new Logger(BootstrapService.name);

  constructor(private prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    try {
      const adminPasswordHash = await argon2.hash(DEFAULT_ADMIN_PASSWORD);
      const defaultPasswordHash = await argon2.hash('Password123!');

      const admin = await this.prisma.user.upsert({
        where: { email: DEFAULT_ADMIN_EMAIL },
        update: {
          role: UserRole.ADMIN,
          status: UserStatus.ACTIVE,
          emailVerified: true,
          passwordHash: adminPasswordHash,
        },
        create: {
          firstName: 'Admin',
          lastName: 'User',
          email: DEFAULT_ADMIN_EMAIL,
          passwordHash: adminPasswordHash,
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
          passwordHash: defaultPasswordHash,
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
          passwordHash: defaultPasswordHash,
          role: UserRole.USER,
          status: UserStatus.ACTIVE,
          emailVerified: true,
        },
      });

      await seedCinemaCatalog(this.prisma);
      this.logger.log(
        `Cinema catalog ready (Majnoon, hall, seats, showtimes). Admin: ${admin.email}`,
      );
    } catch (err) {
      this.logger.error(
        `Could not seed cinema catalog: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}
