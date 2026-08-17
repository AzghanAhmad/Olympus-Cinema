import { MOCK_BOOKINGS } from '@/data/content';
import { apiFetch, ApiSuccess } from '@/lib/api';
import { Booking, CustomerDetails } from '@/types/booking';
import { Seat } from '@/types/screening';
import { MAJNOON } from '@/data/movies';

interface ApiBooking {
  id: string;
  bookingCode: string;
  screeningId: string;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  createdAt: string;
  screening?: {
    startTime: string;
    movie?: { id?: string; title?: string; posterUrl?: string | null };
    screen?: { name?: string };
  };
  seats?: Array<{ seat?: { id?: string; label?: string; row?: string; number?: number } }>;
}

const CACHE_KEY = 'crystal-reservation-cache';

function readCache(): Record<string, Booking> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(sessionStorage.getItem(CACHE_KEY) || '{}') as Record<string, Booking>;
  } catch {
    return {};
  }
}

function writeCache(booking: Booking) {
  if (typeof window === 'undefined') return;
  const cache = readCache();
  cache[booking.id] = booking;
  sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

function mapApiBooking(raw: ApiBooking, fallback?: Partial<Booking>): Booking {
  const start = raw.screening?.startTime ? new Date(raw.screening.startTime) : new Date();
  const seats: Seat[] = (raw.seats || []).map((row) => ({
    id: row.seat?.id || row.seat?.label || '',
    row: row.seat?.row || '',
    number: row.seat?.number || 0,
    label: row.seat?.label,
    category: 'STANDARD',
    price: 0,
    status: 'RESERVED',
  }));
  const code = raw.bookingCode;
  const movieTitle = raw.screening?.movie?.title || fallback?.movieTitle || MAJNOON.title;
  const date = fallback?.date || start.toISOString().slice(0, 10);
  const startTime =
    fallback?.startTime ||
    start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  const seatLabels = seats.map((s) => s.label || s.id).filter(Boolean);

  return {
    id: raw.id,
    bookingCode: code,
    screeningId: raw.screeningId,
    movieId: raw.screening?.movie?.id || fallback?.movieId || MAJNOON.id,
    movieTitle,
    moviePoster: fallback?.moviePoster || MAJNOON.posterUrl,
    hallName: raw.screening?.screen?.name || fallback?.hallName || 'Crystal Entertainment',
    screenType: fallback?.screenType || 'STANDARD 4K',
    date,
    startTime,
    seats: fallback?.seats?.length ? fallback.seats : seats,
    customer: {
      fullName: raw.customerName,
      email: raw.customerEmail,
      phone: raw.customerPhone,
    },
    totalPrice: fallback?.totalPrice || 0,
    status: raw.status === 'CONFIRMED' ? 'CONFIRMED' : raw.status === 'CANCELLED' ? 'CANCELLED' : 'PENDING',
    createdAt: raw.createdAt,
    qrCodeValue: `RESERVATION|${code}|${movieTitle}|${date}|${startTime}|${seatLabels.join(',')}`,
  };
}

export const bookingService = {
  async getBookings(): Promise<Booking[]> {
    return Object.values(readCache());
  },

  async getBookingById(id: string): Promise<Booking | null> {
    const cached = readCache()[id];
    if (cached) return cached;
    try {
      const res = await apiFetch<ApiSuccess<ApiBooking>>(`/bookings/${id}`);
      if (res.data) {
        const mapped = mapApiBooking(res.data);
        writeCache(mapped);
        return mapped;
      }
    } catch {
      /* ignore */
    }
    return MOCK_BOOKINGS.find((b) => b.id === id) || null;
  },

  async createBooking(data: {
    screeningId: string;
    movieId: string;
    movieTitle: string;
    moviePoster: string;
    hallName: string;
    screenType: string;
    date: string;
    startTime: string;
    seats: Seat[];
    customer: CustomerDetails;
    totalPrice: number;
  }): Promise<Booking> {
    const res = await apiFetch<ApiSuccess<ApiBooking>>('/bookings', {
      method: 'POST',
      body: JSON.stringify({
        screeningId: data.screeningId,
        seatIds: data.seats.map((s) => s.id),
        customerName: data.customer.fullName,
        customerEmail: data.customer.email.trim().toLowerCase(),
        customerPhone: data.customer.phone,
      }),
    });
    const mapped = mapApiBooking(res.data, data);
    writeCache(mapped);
    return mapped;
  },
};
