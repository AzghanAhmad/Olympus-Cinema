import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/settings.dto';

const PUBLIC_SETTING_KEYS = [
  'siteName',
  'tagline',
  'contactEmail',
  'contactPhone',
  'address',
  'socialLinks',
  'heroContent',
  'footerText',
];

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getPublicSettings() {
    const settings = await this.prisma.siteSetting.findMany({
      where: { key: { in: PUBLIC_SETTING_KEYS } },
    });
    return this.toMap(settings);
  }

  async getAllSettings() {
    const settings = await this.prisma.siteSetting.findMany({
      orderBy: { key: 'asc' },
    });
    return this.toMap(settings);
  }

  async updateSettings(dto: UpdateSettingsDto) {
    const entries = Object.entries(dto.settings);

    await this.prisma.$transaction(
      entries.map(([key, value]) =>
        this.prisma.siteSetting.upsert({
          where: { key },
          create: { key, value: value as Prisma.InputJsonValue },
          update: { value: value as Prisma.InputJsonValue },
        }),
      ),
    );

    return this.getAllSettings();
  }

  private toMap(settings: Array<{ key: string; value: unknown }>) {
    return settings.reduce<Record<string, unknown>>((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});
  }
}
