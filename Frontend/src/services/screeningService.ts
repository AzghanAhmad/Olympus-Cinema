import { MOCK_SCREENINGS } from '@/data/screenings';
import { generateMockSeats, generateSeatsFromScreen } from '@/data/seats';
import { useCinemaLayoutStore } from '@/store/useCinemaLayoutStore';
import { useSiteSettingsStore } from '@/store/useSiteSettingsStore';
import { Screening, Seat } from '@/types/screening';

function enrichScreening(screening: Screening): Screening {
  const screen = useCinemaLayoutStore.getState().getScreen(screening.hallId);
  const defaultPrice = useSiteSettingsStore.getState().ticketPrice || 15;
  if (!screen) return { ...screening, price: screening.price || defaultPrice };
  const total = screen.rows.reduce((sum, r) => sum + r.left + r.right, 0);
  return {
    ...screening,
    hallName: screen.name,
    screenType: screen.screenType,
    totalSeatsCount: total,
    price: screening.price || defaultPrice,
  };
}

export const screeningService = {
  async getScreenings(): Promise<Screening[]> {
    await new Promise((res) => setTimeout(res, 200));
    return MOCK_SCREENINGS.map(enrichScreening);
  },

  async getScreeningById(id: string): Promise<Screening | null> {
    await new Promise((res) => setTimeout(res, 150));
    const found = MOCK_SCREENINGS.find((s) => s.id === id);
    return found ? enrichScreening(found) : null;
  },

  async getScreeningsByMovieId(movieId: string): Promise<Screening[]> {
    await new Promise((res) => setTimeout(res, 150));
    return MOCK_SCREENINGS.filter((s) => s.movieId === movieId).map(enrichScreening);
  },

  async getScreeningSeats(screeningId: string): Promise<Seat[]> {
    await new Promise((res) => setTimeout(res, 200));
    const screening = MOCK_SCREENINGS.find((s) => s.id === screeningId);
    const hallId = screening?.hallId || 'hall-olympus';
    const screen = useCinemaLayoutStore.getState().getScreen(hallId);
    const price = screening?.price || useSiteSettingsStore.getState().ticketPrice || 15;

    if (screen) {
      return generateSeatsFromScreen(screen, price);
    }

    return generateMockSeats(hallId, price);
  },
};
