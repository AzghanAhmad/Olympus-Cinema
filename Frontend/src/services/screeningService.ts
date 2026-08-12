import { MOCK_SCREENINGS } from '@/data/screenings';
import { generateMockSeats } from '@/data/seats';
import { Screening, Seat } from '@/types/screening';

export const screeningService = {
  async getScreenings(): Promise<Screening[]> {
    await new Promise((res) => setTimeout(res, 200));
    return MOCK_SCREENINGS;
  },

  async getScreeningById(id: string): Promise<Screening | null> {
    await new Promise((res) => setTimeout(res, 150));
    return MOCK_SCREENINGS.find((s) => s.id === id) || null;
  },

  async getScreeningsByMovieId(movieId: string): Promise<Screening[]> {
    await new Promise((res) => setTimeout(res, 150));
    return MOCK_SCREENINGS.filter((s) => s.movieId === movieId);
  },

  async getScreeningSeats(screeningId: string): Promise<Seat[]> {
    await new Promise((res) => setTimeout(res, 200));
    const screening = MOCK_SCREENINGS.find((s) => s.id === screeningId);
    return generateMockSeats(
      screening?.hallId || 'hall-1',
      screening?.priceStandard || 15,
      screening?.priceVIP || 25
    );
  },
};
