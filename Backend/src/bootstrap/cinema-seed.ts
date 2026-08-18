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
  title: 'Majnoon',
  slug: 'majnoon',
  tagline: 'Brotherhood, faith, and sacrifice on Majnoon Island.',
  synopsis:
    'Directed by Mehdi Shamohammadi, Majnoon centers on the courageous actions of Mehdi Zeinoddin during the Iran–Iraq war, particularly on Majnoon Island during the Khaybar operation. Presented by Crystal Entertainment.',
  durationMinutes: 101,
  language: 'Persian (English Subtitles)',
  releaseDate: new Date('2024-02-01'),
  ageRating: 'PG-13',
  rating: 8.2,
  posterUrl: '/images/majnoon-poster.jpg',
  backdropUrl: '/images/majnoon-backdrop.jpg',
  trailerUrl: 'https://www.youtube.com/embed/sWE0jjKHQXo',
  status: MovieStatus.PUBLISHED,
  isFeatured: true,
};

/** Safe to re-run on Railway. Fills missing cinema catalog without wiping admin edits. */
export async function seedCinemaCatalog(prisma: PrismaClient): Promise<void> {
  const genres = await Promise.all(
    ['War', 'Drama', 'Biography', 'Action'].map((name) =>
      prisma.genre.upsert({
        where: { slug: name.toLowerCase() },
        update: { name },
        create: { name, slug: name.toLowerCase() },
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

  for (const genre of genres.slice(0, 3)) {
    await prisma.movieGenre.upsert({
      where: { movieId_genreId: { movieId: movie.id, genreId: genre.id } },
      update: {},
      create: { movieId: movie.id, genreId: genre.id },
    });
  }

  const castCount = await prisma.castMember.count({ where: { movieId: movie.id } });
  if (castCount === 0) {
    await prisma.castMember.createMany({
      data: [
        { movieId: movie.id, name: 'Sajjad Babaei', characterName: 'Mehdi Zeinoddin', displayOrder: 1 },
        { movieId: movie.id, name: 'Shabnam Ghorbani', characterName: 'Monireh Armaghan', displayOrder: 2 },
        { movieId: movie.id, name: 'Behzad Khalaj', characterName: 'Majid Zeinoddin', displayOrder: 3 },
      ],
    });
  }

  const crewCount = await prisma.crewMember.count({ where: { movieId: movie.id } });
  if (crewCount === 0) {
    await prisma.crewMember.createMany({
      data: [
        { movieId: movie.id, name: 'Mehdi Shamohammadi', role: 'Director', displayOrder: 1 },
        { movieId: movie.id, name: 'Alireza Mohsooli', role: 'Writer', displayOrder: 2 },
        { movieId: movie.id, name: 'Crystal Entertainment', role: 'Presented By', displayOrder: 3 },
      ],
    });
  }

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

    Object.entries(ROW_LAYOUT).forEach(([row, { left, right }], rowIndex) => {
      const total = left + right;
      for (let n = 1; n <= total; n++) {
        let seatType: SeatType = SeatType.STANDARD;
        if (rowIndex >= 5 && rowIndex <= 11) seatType = SeatType.PREMIUM;
        if (rowIndex >= 12) seatType = SeatType.VIP;
        seatData.push({
          screenId: screen.id,
          row,
          number: n,
          label: `${row}-${n}`,
          seatType,
          status: SeatStatus.ACTIVE,
        });
      }
    });

    await prisma.seat.createMany({ data: seatData });
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
    { key: 'contactEmail', value: 'info@crystalentertainment.local' },
    { key: 'contactPhone', value: '+1234567890' },
    { key: 'address', value: 'Crystal Entertainment Cinema' },
    { key: 'seatHoldDuration', value: 10 },
    { key: 'maxTicketsPerPerson', value: 15 },
    { key: 'ticketPrice', value: 15 },
    { key: 'siteName', value: 'Crystal Entertainment' },
  ];

  for (const s of settings) {
    const existing = await prisma.siteSetting.findUnique({ where: { key: s.key } });
    if (!existing) {
      await prisma.siteSetting.create({
        data: { key: s.key, value: s.value },
      });
    }
  }
}
