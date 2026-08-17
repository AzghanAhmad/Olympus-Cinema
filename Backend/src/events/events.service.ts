import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto, QueryEventsDto, UpdateEventDto } from './dto/event.dto';
import { buildMeta, getPagination, slugify } from '../common/utils';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  private validateTimes(startTime: Date, endTime: Date) {
    if (endTime <= startTime) {
      throw new BadRequestException('endTime must be after startTime');
    }
  }

  private async resolveUniqueSlug(title: string, slug?: string, excludeId?: string) {
    let base = slugify(slug ?? title);
    if (!base) base = 'event';

    let candidate = base;
    let counter = 1;
    while (true) {
      const existing = await this.prisma.event.findUnique({
        where: { slug: candidate },
      });
      if (!existing || existing.id === excludeId) return candidate;
      candidate = `${base}-${counter++}`;
    }
  }

  async findAll(query: QueryEventsDto, publishedOnly = true) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const { skip, take } = getPagination(page, limit);

    const where: Prisma.EventWhereInput = {};
    if (publishedOnly) where.status = EventStatus.PUBLISHED;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { location: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.from || query.to) {
      where.startTime = {};
      if (query.from) where.startTime.gte = new Date(query.from);
      if (query.to) where.startTime.lte = new Date(query.to);
    }

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip,
        take,
        orderBy: { startTime: 'asc' },
      }),
      this.prisma.event.count({ where }),
    ]);

    return { data: events, meta: buildMeta(total, page, limit) };
  }

  async findBySlug(slug: string) {
    const event = await this.prisma.event.findFirst({
      where: { slug, status: EventStatus.PUBLISHED },
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async adminFindOne(id: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async create(dto: CreateEventDto) {
    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);
    this.validateTimes(startTime, endTime);

    const slug = await this.resolveUniqueSlug(dto.title, dto.slug);
    return this.prisma.event.create({
      data: {
        title: dto.title,
        slug,
        description: dto.description,
        coverImageUrl: dto.coverImageUrl,
        location: dto.location,
        startTime,
        endTime,
        status: dto.status ?? EventStatus.DRAFT,
      },
    });
  }

  async update(id: string, dto: UpdateEventDto) {
    const existing = await this.prisma.event.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Event not found');

    const startTime = dto.startTime ? new Date(dto.startTime) : existing.startTime;
    const endTime = dto.endTime ? new Date(dto.endTime) : existing.endTime;
    this.validateTimes(startTime, endTime);

    const slug =
      dto.slug || dto.title
        ? await this.resolveUniqueSlug(
            dto.title ?? existing.title,
            dto.slug ?? existing.slug,
            id,
          )
        : undefined;

    return this.prisma.event.update({
      where: { id },
      data: {
        title: dto.title,
        slug,
        description: dto.description,
        coverImageUrl: dto.coverImageUrl,
        location: dto.location,
        startTime,
        endTime,
        status: dto.status,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.event.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Event not found');
    await this.prisma.event.delete({ where: { id } });
    return { message: 'Event deleted' };
  }
}
