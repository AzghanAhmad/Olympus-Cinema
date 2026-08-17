import { Injectable, NotFoundException } from '@nestjs/common';
import { NewsStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNewsDto, QueryNewsDto, UpdateNewsDto } from './dto/news.dto';
import { buildMeta, getPagination, slugify } from '../common/utils';

@Injectable()
export class NewsService {
  constructor(private prisma: PrismaService) {}

  private async resolveUniqueSlug(title: string, slug?: string, excludeId?: string) {
    let base = slugify(slug ?? title);
    if (!base) base = 'news';

    let candidate = base;
    let counter = 1;
    while (true) {
      const existing = await this.prisma.news.findUnique({
        where: { slug: candidate },
      });
      if (!existing || existing.id === excludeId) return candidate;
      candidate = `${base}-${counter++}`;
    }
  }

  async findAll(query: QueryNewsDto, publishedOnly = true) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const { skip, take } = getPagination(page, limit);

    const where: Prisma.NewsWhereInput = {};
    if (publishedOnly) where.status = NewsStatus.PUBLISHED;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { excerpt: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [articles, total] = await Promise.all([
      this.prisma.news.findMany({
        where,
        skip,
        take,
        orderBy: { publishedAt: 'desc' },
        include: {
          author: {
            select: { id: true, firstName: true, lastName: true, avatarUrl: true },
          },
        },
      }),
      this.prisma.news.count({ where }),
    ]);

    return { data: articles, meta: buildMeta(total, page, limit) };
  }

  async findBySlug(slug: string) {
    const article = await this.prisma.news.findFirst({
      where: { slug, status: NewsStatus.PUBLISHED },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
    });
    if (!article) throw new NotFoundException('News article not found');
    return article;
  }

  async adminFindOne(id: string) {
    const article = await this.prisma.news.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
    });
    if (!article) throw new NotFoundException('News article not found');
    return article;
  }

  async create(dto: CreateNewsDto, authorId?: string) {
    const slug = await this.resolveUniqueSlug(dto.title, dto.slug);
    const status = dto.status ?? NewsStatus.DRAFT;
    const publishedAt =
      dto.publishedAt
        ? new Date(dto.publishedAt)
        : status === NewsStatus.PUBLISHED
          ? new Date()
          : undefined;

    return this.prisma.news.create({
      data: {
        title: dto.title,
        slug,
        excerpt: dto.excerpt,
        content: dto.content,
        featuredImageUrl: dto.featuredImageUrl,
        status,
        publishedAt,
        authorId,
      },
    });
  }

  async update(id: string, dto: UpdateNewsDto) {
    const existing = await this.prisma.news.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('News article not found');

    const slug =
      dto.slug || dto.title
        ? await this.resolveUniqueSlug(
            dto.title ?? existing.title,
            dto.slug ?? existing.slug,
            id,
          )
        : undefined;

    let publishedAt = dto.publishedAt ? new Date(dto.publishedAt) : undefined;
    if (dto.status === NewsStatus.PUBLISHED && !existing.publishedAt && !publishedAt) {
      publishedAt = new Date();
    }

    return this.prisma.news.update({
      where: { id },
      data: {
        title: dto.title,
        slug,
        excerpt: dto.excerpt,
        content: dto.content,
        featuredImageUrl: dto.featuredImageUrl,
        status: dto.status,
        publishedAt,
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.news.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('News article not found');
    await this.prisma.news.delete({ where: { id } });
    return { message: 'News article deleted' };
  }
}
