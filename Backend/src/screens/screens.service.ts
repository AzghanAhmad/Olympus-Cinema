import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  BulkCreateSeatsDto,
  CreateScreenDto,
  CreateSeatDto,
  QueryScreensDto,
  UpdateScreenDto,
  UpdateSeatDto,
} from './dto/screen.dto';
import { buildMeta, getPagination, slugify } from '../common/utils';

@Injectable()
export class ScreensService {
  constructor(private prisma: PrismaService) {}

  private async resolveUniqueSlug(name: string, slug?: string, excludeId?: string) {
    let base = slugify(slug ?? name);
    if (!base) base = 'screen';

    let candidate = base;
    let counter = 1;
    while (true) {
      const existing = await this.prisma.screen.findUnique({
        where: { slug: candidate },
      });
      if (!existing || existing.id === excludeId) return candidate;
      candidate = `${base}-${counter++}`;
    }
  }

  private validateDuplicateLabels(labels: string[]) {
    const seen = new Set<string>();
    const duplicates: string[] = [];
    for (const label of labels) {
      const normalized = label.trim().toUpperCase();
      if (seen.has(normalized)) duplicates.push(label);
      seen.add(normalized);
    }
    if (duplicates.length) {
      throw new BadRequestException(
        `Duplicate seat labels: ${[...new Set(duplicates)].join(', ')}`,
      );
    }
  }

  async findAll(query: QueryScreensDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const { skip, take } = getPagination(page, limit);

    const where: Prisma.ScreenWhereInput = {};
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { slug: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [screens, total] = await Promise.all([
      this.prisma.screen.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' },
        include: { _count: { select: { seats: true } } },
      }),
      this.prisma.screen.count({ where }),
    ]);

    return { data: screens, meta: buildMeta(total, page, limit) };
  }

  async findOne(id: string) {
    const screen = await this.prisma.screen.findUnique({
      where: { id },
      include: { seats: { orderBy: [{ row: 'asc' }, { number: 'asc' }] } },
    });
    if (!screen) throw new NotFoundException('Screen not found');
    return screen;
  }

  async create(dto: CreateScreenDto) {
    const slug = await this.resolveUniqueSlug(dto.name, dto.slug);
    return this.prisma.screen.create({
      data: { ...dto, slug },
    });
  }

  async update(id: string, dto: UpdateScreenDto) {
    const existing = await this.prisma.screen.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Screen not found');

    const slug =
      dto.slug || dto.name
        ? await this.resolveUniqueSlug(
            dto.name ?? existing.name,
            dto.slug ?? existing.slug,
            id,
          )
        : undefined;

    return this.prisma.screen.update({
      where: { id },
      data: { ...dto, ...(slug ? { slug } : {}) },
    });
  }

  async remove(id: string) {
    const screen = await this.prisma.screen.findUnique({
      where: { id },
      include: { screenings: { where: { status: 'SCHEDULED' }, take: 1 } },
    });
    if (!screen) throw new NotFoundException('Screen not found');
    if (screen.screenings.length) {
      throw new ConflictException('Cannot delete screen with scheduled screenings');
    }

    await this.prisma.screen.delete({ where: { id } });
    return { message: 'Screen deleted' };
  }

  async listSeats(screenId: string) {
    await this.ensureScreen(screenId);
    return this.prisma.seat.findMany({
      where: { screenId },
      orderBy: [{ row: 'asc' }, { number: 'asc' }],
    });
  }

  async createSeat(screenId: string, dto: CreateSeatDto) {
    await this.ensureScreen(screenId);
    this.validateDuplicateLabels([dto.label]);

    const existing = await this.prisma.seat.findUnique({
      where: { screenId_label: { screenId, label: dto.label } },
    });
    if (existing) {
      throw new ConflictException(`Seat label "${dto.label}" already exists on this screen`);
    }

    const seat = await this.prisma.seat.create({
      data: { ...dto, screenId },
    });
    await this.syncCapacity(screenId);
    return seat;
  }

  async bulkCreateSeats(screenId: string, dto: BulkCreateSeatsDto) {
    await this.ensureScreen(screenId);
    this.validateDuplicateLabels(dto.seats.map((s) => s.label));

    const existing = await this.prisma.seat.findMany({
      where: { screenId, label: { in: dto.seats.map((s) => s.label) } },
    });
    if (existing.length) {
      throw new ConflictException(
        `Seat labels already exist: ${existing.map((s) => s.label).join(', ')}`,
      );
    }

    await this.prisma.seat.createMany({
      data: dto.seats.map((s) => ({ ...s, screenId })),
    });
    await this.syncCapacity(screenId);
    return this.listSeats(screenId);
  }

  async updateSeat(screenId: string, seatId: string, dto: UpdateSeatDto) {
    await this.ensureScreen(screenId);
    const seat = await this.prisma.seat.findFirst({
      where: { id: seatId, screenId },
    });
    if (!seat) throw new NotFoundException('Seat not found');

    if (dto.label && dto.label !== seat.label) {
      this.validateDuplicateLabels([dto.label]);
      const conflict = await this.prisma.seat.findUnique({
        where: { screenId_label: { screenId, label: dto.label } },
      });
      if (conflict) {
        throw new ConflictException(`Seat label "${dto.label}" already exists on this screen`);
      }
    }

    return this.prisma.seat.update({
      where: { id: seatId },
      data: dto,
    });
  }

  async removeSeat(screenId: string, seatId: string) {
    await this.ensureScreen(screenId);
    const seat = await this.prisma.seat.findFirst({
      where: { id: seatId, screenId },
    });
    if (!seat) throw new NotFoundException('Seat not found');

    const reserved = await this.prisma.screeningSeatReservation.findFirst({
      where: { seatId },
    });
    if (reserved) {
      throw new ConflictException('Cannot delete seat with active reservations');
    }

    await this.prisma.seat.delete({ where: { id: seatId } });
    await this.syncCapacity(screenId);
    return { message: 'Seat deleted' };
  }

  private async ensureScreen(screenId: string) {
    const screen = await this.prisma.screen.findUnique({ where: { id: screenId } });
    if (!screen) throw new NotFoundException('Screen not found');
    return screen;
  }

  private async syncCapacity(screenId: string) {
    const count = await this.prisma.seat.count({
      where: { screenId, status: 'ACTIVE' },
    });
    await this.prisma.screen.update({
      where: { id: screenId },
      data: { capacity: count },
    });
  }
}
