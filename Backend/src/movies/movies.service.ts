import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MovieStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateMovieDto,
  QueryMoviesDto,
  UpdateMovieDto,
} from './dto/movie.dto';
import { buildMeta, getPagination, slugify } from '../common/utils';

const movieInclude = {
  genres: { include: { genre: true } },
  cast: { orderBy: { displayOrder: 'asc' as const } },
  crew: { orderBy: { displayOrder: 'asc' as const } },
  gallery: { orderBy: { displayOrder: 'asc' as const } },
};

@Injectable()
export class MoviesService {
  constructor(private prisma: PrismaService) {}

  private formatMovie<T extends Record<string, unknown>>(movie: T) {
    const { genres, ...rest } = movie as T & {
      genres?: Array<{ genre: unknown }>;
    };
    return {
      ...rest,
      genres: genres?.map((g) => g.genre) ?? [],
    };
  }

  private async resolveUniqueSlug(title: string, slug?: string, excludeId?: string) {
    let base = slugify(slug ?? title);
    if (!base) base = 'movie';

    let candidate = base;
    let counter = 1;
    while (true) {
      const existing = await this.prisma.movie.findUnique({
        where: { slug: candidate },
      });
      if (!existing || existing.id === excludeId) return candidate;
      candidate = `${base}-${counter++}`;
    }
  }

  async findAll(query: QueryMoviesDto, status: MovieStatus = MovieStatus.PUBLISHED) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const { skip, take } = getPagination(page, limit);

    const where: Prisma.MovieWhereInput = { status };
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { tagline: { contains: query.search, mode: 'insensitive' } },
        { synopsis: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.genre) {
      where.genres = {
        some: {
          genre: {
            OR: [
              { slug: query.genre },
              { name: { equals: query.genre, mode: 'insensitive' } },
            ],
          },
        },
      };
    }

    const [movies, total] = await Promise.all([
      this.prisma.movie.findMany({
        where,
        skip,
        take,
        orderBy: { releaseDate: 'desc' },
        include: movieInclude,
      }),
      this.prisma.movie.count({ where }),
    ]);

    return {
      data: movies.map((m) => this.formatMovie(m)),
      meta: buildMeta(total, page, limit),
    };
  }

  async findFeatured() {
    const movies = await this.prisma.movie.findMany({
      where: { status: MovieStatus.PUBLISHED, isFeatured: true },
      orderBy: { releaseDate: 'desc' },
      include: movieInclude,
    });
    return movies.map((m) => this.formatMovie(m));
  }

  async findNowShowing() {
    const now = new Date();
    const movies = await this.prisma.movie.findMany({
      where: {
        status: MovieStatus.PUBLISHED,
        releaseDate: { lte: now },
        screenings: {
          some: {
            status: 'SCHEDULED',
            startTime: { gte: now },
          },
        },
      },
      orderBy: { releaseDate: 'desc' },
      include: movieInclude,
    });
    return movies.map((m) => this.formatMovie(m));
  }

  async findComingSoon() {
    const now = new Date();
    const movies = await this.prisma.movie.findMany({
      where: {
        status: MovieStatus.PUBLISHED,
        releaseDate: { gt: now },
      },
      orderBy: { releaseDate: 'asc' },
      include: movieInclude,
    });
    return movies.map((m) => this.formatMovie(m));
  }

  async findBySlug(slug: string) {
    const movie = await this.prisma.movie.findFirst({
      where: { slug, status: MovieStatus.PUBLISHED },
      include: movieInclude,
    });
    if (!movie) throw new NotFoundException('Movie not found');
    return this.formatMovie(movie);
  }

  async adminFindAll(query: QueryMoviesDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const { skip, take } = getPagination(page, limit);

    const where: Prisma.MovieWhereInput = {};
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { slug: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.genre) {
      where.genres = {
        some: {
          genre: {
            OR: [{ slug: query.genre }, { id: query.genre }],
          },
        },
      };
    }

    const [movies, total] = await Promise.all([
      this.prisma.movie.findMany({
        where,
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
        include: movieInclude,
      }),
      this.prisma.movie.count({ where }),
    ]);

    return {
      data: movies.map((m) => this.formatMovie(m)),
      meta: buildMeta(total, page, limit),
    };
  }

  async adminFindOne(id: string) {
    const movie = await this.prisma.movie.findUnique({
      where: { id },
      include: movieInclude,
    });
    if (!movie) throw new NotFoundException('Movie not found');
    return this.formatMovie(movie);
  }

  async create(dto: CreateMovieDto) {
    const slug = await this.resolveUniqueSlug(dto.title, dto.slug);
    const { genreIds, cast, crew, gallery, ...data } = dto;

    const movie = await this.prisma.movie.create({
      data: {
        ...data,
        slug,
        releaseDate: new Date(dto.releaseDate),
        genres: genreIds?.length
          ? { create: genreIds.map((genreId) => ({ genreId })) }
          : undefined,
        cast: cast?.length
          ? { create: cast.map((c, i) => ({ ...c, displayOrder: c.displayOrder ?? i })) }
          : undefined,
        crew: crew?.length
          ? { create: crew.map((c, i) => ({ ...c, displayOrder: c.displayOrder ?? i })) }
          : undefined,
        gallery: gallery?.length
          ? { create: gallery.map((g, i) => ({ ...g, displayOrder: g.displayOrder ?? i })) }
          : undefined,
      },
      include: movieInclude,
    });

    return this.formatMovie(movie);
  }

  async update(id: string, dto: UpdateMovieDto) {
    const existing = await this.prisma.movie.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Movie not found');

    const { genreIds, cast, crew, gallery, slug, releaseDate, ...data } = dto;
    const resolvedSlug =
      slug || dto.title
        ? await this.resolveUniqueSlug(dto.title ?? existing.title, slug ?? existing.slug, id)
        : undefined;

    await this.prisma.$transaction(async (tx) => {
      await tx.movie.update({
        where: { id },
        data: {
          ...data,
          ...(resolvedSlug ? { slug: resolvedSlug } : {}),
          ...(releaseDate ? { releaseDate: new Date(releaseDate) } : {}),
        },
      });

      if (genreIds !== undefined) {
        await tx.movieGenre.deleteMany({ where: { movieId: id } });
        if (genreIds.length) {
          await tx.movieGenre.createMany({
            data: genreIds.map((genreId) => ({ movieId: id, genreId })),
          });
        }
      }

      if (cast !== undefined) {
        await tx.castMember.deleteMany({ where: { movieId: id } });
        if (cast.length) {
          await tx.castMember.createMany({
            data: cast.map((c, i) => ({
              movieId: id,
              name: c.name,
              characterName: c.characterName,
              imageUrl: c.imageUrl,
              displayOrder: c.displayOrder ?? i,
            })),
          });
        }
      }

      if (crew !== undefined) {
        await tx.crewMember.deleteMany({ where: { movieId: id } });
        if (crew.length) {
          await tx.crewMember.createMany({
            data: crew.map((c, i) => ({
              movieId: id,
              name: c.name,
              role: c.role,
              imageUrl: c.imageUrl,
              displayOrder: c.displayOrder ?? i,
            })),
          });
        }
      }

      if (gallery !== undefined) {
        await tx.movieGallery.deleteMany({ where: { movieId: id } });
        if (gallery.length) {
          await tx.movieGallery.createMany({
            data: gallery.map((g, i) => ({
              movieId: id,
              imageUrl: g.imageUrl,
              altText: g.altText,
              displayOrder: g.displayOrder ?? i,
            })),
          });
        }
      }
    });

    return this.adminFindOne(id);
  }

  async publish(id: string) {
    const movie = await this.prisma.movie.findUnique({ where: { id } });
    if (!movie) throw new NotFoundException('Movie not found');
    if (movie.status === MovieStatus.PUBLISHED) {
      throw new BadRequestException('Movie is already published');
    }

    const updated = await this.prisma.movie.update({
      where: { id },
      data: { status: MovieStatus.PUBLISHED },
      include: movieInclude,
    });
    return this.formatMovie(updated);
  }

  async remove(id: string) {
    const movie = await this.prisma.movie.findUnique({
      where: { id },
      include: { screenings: { where: { status: 'SCHEDULED' }, take: 1 } },
    });
    if (!movie) throw new NotFoundException('Movie not found');
    if (movie.screenings.length) {
      throw new ConflictException('Cannot delete movie with scheduled screenings');
    }

    await this.prisma.movie.delete({ where: { id } });
    return { message: 'Movie deleted' };
  }
}
