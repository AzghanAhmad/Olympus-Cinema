import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const [
      totalUsers,
      totalMovies,
      publishedMovies,
      totalBookings,
      confirmedBookings,
      todayBookings,
      todayRevenueBookings,
      upcomingScreenings,
      activeEvents,
      publishedNews,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.movie.count(),
      this.prisma.movie.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.booking.count(),
      this.prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      this.prisma.booking.count({
        where: { createdAt: { gte: startOfDay, lte: endOfDay } },
      }),
      this.prisma.booking.findMany({
        where: {
          status: { in: ['CONFIRMED', 'CHECKED_IN'] },
          createdAt: { gte: startOfDay, lte: endOfDay },
        },
        include: { seats: true },
      }),
      this.prisma.screening.count({
        where: { status: 'SCHEDULED', startTime: { gte: now } },
      }),
      this.prisma.event.count({
        where: { status: 'PUBLISHED', endTime: { gte: now } },
      }),
      this.prisma.news.count({ where: { status: 'PUBLISHED' } }),
    ]);

    const ticketsSoldToday = todayRevenueBookings.reduce(
      (sum, b) => sum + b.seats.length,
      0,
    );

    const recentBookings = await this.prisma.booking.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        screening: {
          include: {
            movie: { select: { title: true } },
            screen: { select: { name: true } },
          },
        },
        _count: { select: { seats: true } },
      },
    });

    const bookingsByStatus = await this.prisma.booking.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);
    const weekBookings = await this.prisma.booking.findMany({
      where: { createdAt: { gte: weekStart } },
      select: { createdAt: true, seats: { select: { id: true } } },
    });

    const trendMap = new Map<string, { bookings: number; tickets: number }>();
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      trendMap.set(key, { bookings: 0, tickets: 0 });
    }
    for (const b of weekBookings) {
      const key = b.createdAt.toISOString().slice(0, 10);
      const bucket = trendMap.get(key);
      if (bucket) {
        bucket.bookings += 1;
        bucket.tickets += b.seats.length;
      }
    }

    const popularMovies = await this.prisma.booking.groupBy({
      by: ['screeningId'],
      where: { status: { in: ['CONFIRMED', 'CHECKED_IN'] } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });
    const screeningIds = popularMovies.map((p) => p.screeningId);
    const screeningMovies = await this.prisma.screening.findMany({
      where: { id: { in: screeningIds } },
      include: { movie: { select: { title: true } } },
    });
    const movieTicketCounts = new Map<string, number>();
    for (const p of popularMovies) {
      const scr = screeningMovies.find((s) => s.id === p.screeningId);
      const title = scr?.movie.title ?? 'Unknown';
      movieTicketCounts.set(title, (movieTicketCounts.get(title) ?? 0) + p._count.id);
    }

    return {
      totals: {
        users: totalUsers,
        movies: totalMovies,
        publishedMovies,
        bookings: totalBookings,
        confirmedBookings,
        upcomingScreenings,
        activeEvents,
        publishedNews,
      },
      today: {
        bookings: todayBookings,
        ticketsSold: ticketsSoldToday,
      },
      bookingsByStatus: bookingsByStatus.map((b) => ({
        status: b.status,
        count: b._count.status,
      })),
      recentBookings,
      weeklyTrend: [...trendMap.entries()].map(([day, v]) => ({ day, ...v })),
      popularMovies: [...movieTicketCounts.entries()].map(([name, tickets]) => ({
        name,
        tickets,
      })),
    };
  }
}
