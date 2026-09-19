import {
  EventStatus,
  MovieStatus,
  NewsStatus,
  PrismaClient,
  ScreenStatus,
  ScreeningStatus,
  SeatStatus,
  SeatType,
} from '@prisma/client';

const ROW_LAYOUT: Record<string, { left: number; right: number }> = {
  A: { left: 8, right: 8 },
  B: { left: 10, right: 10 },
  C: { left: 11, right: 11 },
  D: { left: 11, right: 11 },
  E: { left: 11, right: 11 },
  F: { left: 11, right: 11 },
  G: { left: 11, right: 11 },
  H: { left: 11, right: 11 },
  I: { left: 11, right: 11 },
  J: { left: 11, right: 11 },
  K: { left: 11, right: 11 },
  L: { left: 11, right: 11 },
  M: { left: 11, right: 11 },
  N: { left: 11, right: 11 },
  O: { left: 11, right: 11 },
  P: { left: 11, right: 11 },
  Q: { left: 10, right: 10 },
  R: { left: 10, right: 10 },
  S: { left: 10, right: 10 },
  T: { left: 9, right: 9 },
  U: { left: 8, right: 8 },
};

const MAJNOON = {
  title: 'Majunoon',
  slug: 'majnoon',
  tagline: 'Love can save you or destroy you',
  synopsis:
    'Fifteen years after a tragic incident shattered two young lives, Laana returns the the life where ghosts of her past still linger. There, she comes face to face with Aayan—a man who never stopped loving her.\n\nOnce gentle and full of promise, Aayan has spent years haunted by childhood trauma, wrongful imprisonment, and devastating loss. Unable to escape his painful memories, he retreats into a fractured reality where love and obsession become impossible to separate. In his mind, Laana is no longer just the woman he lost—she is the only thing keeping him alive.',
  durationMinutes: 175,
  language: 'Dhivehi',
  releaseDate: new Date('2026-10-26T00:00:00.000Z'),
  ageRating: '18+',
  rating: 0,
  posterUrl: '/images/majnoon-poster.jpg',
  backdropUrl: '/images/majnoon-backdrop.jpg',
  trailerUrl: 'https://www.youtube.com/embed/sWE0jjKHQXo',
  status: MovieStatus.PUBLISHED,
  isFeatured: true,
};

/** Safe to re-run on Railway. Fills missing cinema catalog without wiping admin edits. */
export async function seedCinemaCatalog(prisma: PrismaClient): Promise<void> {
  const genres = await Promise.all(
    ['Romance Thriller', 'Romance', 'Thriller', 'Drama'].map((name) =>
      prisma.genre.upsert({
        where: { slug: name.toLowerCase().replace(/\s+/g, '-') },
        update: { name },
        create: { name, slug: name.toLowerCase().replace(/\s+/g, '-') },
      }),
    ),
  );

  const movie = await prisma.movie.upsert({
    where: { slug: MAJNOON.slug },
    update: {
      title: MAJNOON.title,
      tagline: MAJNOON.tagline,
      synopsis: MAJNOON.synopsis,
      durationMinutes: MAJNOON.durationMinutes,
      language: MAJNOON.language,
      releaseDate: MAJNOON.releaseDate,
      ageRating: MAJNOON.ageRating,
      rating: MAJNOON.rating,
      posterUrl: MAJNOON.posterUrl,
      backdropUrl: MAJNOON.backdropUrl,
      trailerUrl: MAJNOON.trailerUrl,
      status: MAJNOON.status,
      isFeatured: MAJNOON.isFeatured,
    },
    create: MAJNOON,
  });

  await prisma.movieGenre.deleteMany({ where: { movieId: movie.id } });
  await prisma.movieGenre.createMany({
    data: [
      { movieId: movie.id, genreId: genres[0].id },
    ],
  });

  await prisma.castMember.deleteMany({ where: { movieId: movie.id } });
  await prisma.castMember.createMany({
    data: [
      { movieId: movie.id, name: 'AHMED SHARIF', characterName: 'Lead Cast', displayOrder: 1 },
      { movieId: movie.id, name: 'MARIYAM SHIFA', characterName: 'Lead Cast', displayOrder: 2 },
      { movieId: movie.id, name: 'AHMED EASA', characterName: 'Cast', displayOrder: 3 },
      { movieId: movie.id, name: 'WASHIYA MOHAMED', characterName: 'Cast', displayOrder: 4 },
      { movieId: movie.id, name: 'AYESHA LAYALI SINAN', characterName: 'Cast', displayOrder: 5 },
      { movieId: movie.id, name: 'EVELIN LIVY FIRASH', characterName: 'Cast', displayOrder: 6 },
      { movieId: movie.id, name: 'SAAMEE HUSSAIN DIDI', characterName: 'Cast', displayOrder: 7 },
      { movieId: movie.id, name: 'ALI AZIM', characterName: 'Cast', displayOrder: 8 },
    ],
  });

  await prisma.crewMember.deleteMany({ where: { movieId: movie.id } });
  await prisma.crewMember.createMany({
    data: [
      { movieId: movie.id, name: 'Mohamed Faisal', role: 'Director', displayOrder: 1 },
      { movieId: movie.id, name: 'Fathimath Nahula', role: 'Writer', displayOrder: 2 },
      { movieId: movie.id, name: 'Crystal Entertainment', role: 'Presented By', displayOrder: 3 },
    ],
  });

  const screen = await prisma.screen.upsert({
    where: { slug: 'crystal-entertainment' },
    update: {
      name: 'Crystal Entertainment',
      description: 'Main cinema hall',
      status: ScreenStatus.ACTIVE,
    },
    create: {
      name: 'Crystal Entertainment',
      slug: 'crystal-entertainment',
      description: 'Main cinema hall',
      status: ScreenStatus.ACTIVE,
    },
  });

  const existingSeats = await prisma.seat.count({ where: { screenId: screen.id } });
  if (existingSeats === 0) {
    const seatData: {
      screenId: string;
      row: string;
      number: number;
      label: string;
      seatType: SeatType;
      status: SeatStatus;
    }[] = [];

    Object.entries(ROW_LAYOUT).forEach(([row, { left, right }]) => {
      const total = left + right;
      for (let n = 1; n <= total; n++) {
        seatData.push({
          screenId: screen.id,
          row,
          number: n,
          label: `${row}-${n}`,
          seatType: SeatType.STANDARD,
          status: SeatStatus.ACTIVE,
        });
      }
    });

    await prisma.seat.createMany({ data: seatData });
  } else {
    // Keep every existing seat as the same standard type (no VIP / premium tiers).
    await prisma.seat.updateMany({
      where: {
        screenId: screen.id,
        seatType: { not: SeatType.STANDARD },
      },
      data: { seatType: SeatType.STANDARD },
    });
  }

  const capacity = await prisma.seat.count({
    where: { screenId: screen.id, status: 'ACTIVE' },
  });
  await prisma.screen.update({ where: { id: screen.id }, data: { capacity } });

  const upcomingCount = await prisma.screening.count({
    where: {
      movieId: movie.id,
      status: ScreeningStatus.SCHEDULED,
      startTime: { gte: new Date() },
    },
  });

  if (upcomingCount === 0) {
    const baseDate = new Date();
    baseDate.setUTCDate(baseDate.getUTCDate() + 1);
    baseDate.setUTCHours(14, 0, 0, 0);
    const showtimes = [
      { hours: 0, duration: 155 },
      { hours: 3, duration: 155 },
      { hours: 5.5, duration: 155 },
      { hours: 7.75, duration: 155 },
    ];

    for (const slot of showtimes) {
      const start = new Date(baseDate.getTime() + slot.hours * 3600000);
      const end = new Date(start.getTime() + slot.duration * 60000);
      await prisma.screening.create({
        data: {
          movieId: movie.id,
          screenId: screen.id,
          startTime: start,
          endTime: end,
          status: ScreeningStatus.SCHEDULED,
        },
      });
    }
  }

  const admin = await prisma.user.findUnique({
    where: { email: 'admin@cinema.local' },
    select: { id: true },
  });

  await prisma.news.upsert({
    where: { slug: 'majnoon-premiere' },
    update: {},
    create: {
      title: 'Majnoon Now Showing at Crystal Entertainment',
      slug: 'majnoon-premiere',
      excerpt: 'Experience Majnoon on the big screen.',
      content: 'Book your seats for Majnoon. Reservations confirmed after contact.',
      featuredImageUrl: '/images/majnoon-backdrop.jpg',
      status: NewsStatus.PUBLISHED,
      publishedAt: new Date(),
      authorId: admin?.id,
    },
  });

  await prisma.event.upsert({
    where: { slug: 'majnoon-fan-screening' },
    update: {},
    create: {
      title: 'Majnoon Fan Screening',
      slug: 'majnoon-fan-screening',
      description: 'Special fan event for Majnoon.',
      location: 'Crystal Entertainment',
      startTime: new Date('2026-09-01T18:00:00.000Z'),
      endTime: new Date('2026-09-01T21:00:00.000Z'),
      status: EventStatus.PUBLISHED,
    },
  });

  const settings: Array<{ key: string; value: string | number }> = [
    { key: 'cinemaName', value: 'Crystal Entertainment' },
    { key: 'contactEmail', value: 'crystalmaldives@gmail.com' },
    { key: 'contactPhone', value: '7844422' },
    { key: 'address', value: 'Crystal Entertainment Cinema' },
    { key: 'seatHoldDuration', value: 10 },
    { key: 'maxTicketsPerPerson', value: 15 },
    { key: 'ticketPrice', value: 15 },
    { key: 'siteName', value: 'Crystal Entertainment' },
  ];

  for (const s of settings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update:
        s.key === 'contactEmail' || s.key === 'contactPhone'
          ? { value: s.value }
          : {},
      create: { key: s.key, value: s.value },
    });
  }
}
