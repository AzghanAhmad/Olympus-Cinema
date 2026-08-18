import { apiFetch, ApiPaginated, ApiSuccess } from '@/lib/api';
import { useSiteSettingsStore } from '@/store/useSiteSettingsStore';
import { Screening, Seat, SeatCategory, SeatStatus } from '@/types/screening';

interface ApiScreening {
  id: string;
  movieId: string;
  screenId: string;
  startTime: string;
  endTime: string;
  movie?: { id: string; title: string; posterUrl?: string | null };
  screen?: { id: string; name: string; capacity?: number };
}

interface ApiSeat {
  id: string;
  row: string;
  number: number;
  label: string;
  seatType?: string;
  status: 'AVAILABLE' | 'HELD' | 'BOOKED' | 'DISABLED';
}

function padTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function padDate(iso: string) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function mapScreening(s: ApiScreening, availableSeats?: number): Screening {
  const price = useSiteSettingsStore.getState().ticketPrice || 15;
  const capacity = s.screen?.capacity || 0;
  const available = availableSeats ?? capacity;
  return {
    id: s.id,
    movieId: s.movieId,
    hallId: s.screenId,
    hallName: s.screen?.name || 'Crystal Entertainment',
    screenType: 'STANDARD 4K',
    date: padDate(s.startTime),
    startTime: padTime(s.startTime),
    endTime: padTime(s.endTime),
    availableSeatsCount: available,
    totalSeatsCount: capacity,
    price,
    movieTitle: s.movie?.title,
    moviePoster: s.movie?.posterUrl || undefined,
  };
}

function mapSeatStatus(status: ApiSeat['status']): SeatStatus {
  if (status === 'BOOKED') return 'OCCUPIED';
  if (status === 'HELD') return 'RESERVED';
  if (status === 'DISABLED') return 'DISABLED';
  return 'AVAILABLE';
}

function mapSeatType(seatType?: string): SeatCategory {
  if (seatType === 'VIP') return 'VIP';
  if (seatType === 'PREMIUM') return 'PREMIUM';
  return 'STANDARD';
}

async function fetchScreeningsList(path: string): Promise<Screening[]> {
  try {
    const res = await apiFetch<ApiPaginated<ApiScreening>>(path);
    return (res.data ?? []).map((s) => mapScreening(s));
  } catch {
    return [];
  }
}

export const screeningService = {
  async getScreenings(): Promise<Screening[]> {
    const from = encodeURIComponent(new Date().toISOString());
    let list = await fetchScreeningsList(`/screenings?limit=50&from=${from}`);
    if (!list.length) {
      list = await fetchScreeningsList('/screenings?limit=50');
    }
    return list;
  },

  async getScreeningById(id: string): Promise<Screening | null> {
    try {
      const res = await apiFetch<ApiSuccess<ApiScreening>>(`/screenings/${id}`);
      if (res.data) return mapScreening(res.data);
    } catch {
      /* ignore */
    }
    return null;
  },

  async getScreeningsByMovieId(movieId: string): Promise<Screening[]> {
    const from = encodeURIComponent(new Date().toISOString());
    let list = await fetchScreeningsList(
      `/screenings/movie/${movieId}?limit=50&from=${from}`,
    );
    if (!list.length) {
      list = await fetchScreeningsList(`/screenings/movie/${movieId}?limit=50`);
    }
    return list;
  },

  async getScreeningsByMovieSlug(slug: string): Promise<Screening[]> {
    const from = encodeURIComponent(new Date().toISOString());
    let list = await fetchScreeningsList(
      `/screenings?limit=50&from=${from}&movieSlug=${encodeURIComponent(slug)}`,
    );
    if (!list.length) {
      list = await fetchScreeningsList(
        `/screenings?limit=50&movieSlug=${encodeURIComponent(slug)}`,
      );
    }
    return list;
  },

  async getScreeningSeats(screeningId: string): Promise<Seat[]> {
    const price = useSiteSettingsStore.getState().ticketPrice || 15;
    try {
      const res = await apiFetch<ApiSuccess<{ seats: ApiSeat[] }>>(
        `/screenings/${screeningId}/seats`,
      );
      return (res.data?.seats ?? []).map((seat) => ({
        id: seat.id,
        row: seat.row,
        number: seat.number,
        label: seat.label,
        category: mapSeatType(seat.seatType),
        price,
        status: mapSeatStatus(seat.status),
      }));
    } catch {
      return [];
    }
  },

  async countAvailableSeats(screeningId: string): Promise<number> {
    const seats = await this.getScreeningSeats(screeningId);
    return seats.filter((s) => s.status === 'AVAILABLE').length;
  },
};
