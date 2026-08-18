import { apiFetch, ApiPaginated, ApiSuccess } from '@/lib/api';
import { useSiteSettingsStore } from '@/store/useSiteSettingsStore';
import { Booking, CustomerDetails } from '@/types/booking';
import { Seat } from '@/types/screening';

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
const DEFAULT_POSTER = '/images/majnoon-poster.jpg';

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

function mapStatus(status: string): Booking['status'] {
  if (status === 'CONFIRMED' || status === 'CHECKED_IN') return 'CONFIRMED';
  if (status === 'CANCELLED') return 'CANCELLED';
  if (status === 'USED') return 'USED';
  return 'PENDING';
}

function mapApiBooking(raw: ApiBooking, fallback?: Partial<Booking>): Booking {
  const ticketPrice = useSiteSettingsStore.getState().ticketPrice || 15;
  const start = raw.screening?.startTime ? new Date(raw.screening.startTime) : new Date();
  const seats: Seat[] = (raw.seats ?? []).map((row) => {
    const seatId = row.seat?.id || '';
    const seatRow = row.seat?.row || '';
    const seatNumber = row.seat?.number ?? 0;
    const inferredLabel =
      row.seat?.label ??
      (seatRow && seatNumber ? `${seatRow}-${seatNumber}` : undefined);

    return {
      id: seatId || inferredLabel || '',
      row: seatRow,
      number: seatNumber,
      label: inferredLabel,
      category: 'STANDARD',
      price: ticketPrice,
      status: 'RESERVED',
    };
  });
  const code = raw.bookingCode;
  const movieTitle = raw.screening?.movie?.title || fallback?.movieTitle || 'Majnoon';
  const moviePoster =
    raw.screening?.movie?.posterUrl ||
    fallback?.moviePoster ||
    DEFAULT_POSTER;
  const date = fallback?.date || start.toISOString().slice(0, 10);
  const startTime =
    fallback?.startTime ||
    start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  const seatLabels = seats.map((s) => s.label || s.id).filter(Boolean);
  const seatCount = fallback?.seats?.length || seats.length;
  const totalPrice = fallback?.totalPrice ?? seatCount * ticketPrice;

  return {
    id: raw.id,
    bookingCode: code,
    screeningId: raw.screeningId,
    movieId: raw.screening?.movie?.id || fallback?.movieId || '',
    movieTitle,
    moviePoster,
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
    totalPrice,
    status: mapStatus(raw.status),
    createdAt: raw.createdAt,
    qrCodeValue: `RESERVATION|${code}|${movieTitle}|${date}|${startTime}|${seatLabels.join(',')}`,
  };
}

export const bookingService = {
  async getMyBookings(): Promise<Booking[]> {
    try {
      const res = await apiFetch<ApiPaginated<ApiBooking>>('/bookings/me?limit=50');
      return (res.data ?? []).map((b) => mapApiBooking(b));
    } catch {
      return Object.values(readCache());
    }
  },

  async getBookings(): Promise<Booking[]> {
    return this.getMyBookings();
  },

  async getBookingById(id: string): Promise<Booking | null> {
    try {
      const res = await apiFetch<ApiSuccess<ApiBooking>>(`/bookings/me/${id}`);
      if (res.data) {
        const mapped = mapApiBooking(res.data);
        writeCache(mapped);
        return mapped;
      }
    } catch {
      try {
        const pub = await apiFetch<ApiSuccess<ApiBooking>>(`/bookings/${id}`);
        if (pub.data) {
          const mapped = mapApiBooking(pub.data);
          writeCache(mapped);
          return mapped;
        }
      } catch {
        /* ignore */
      }
    }
    return null;
  },

  async cancelBooking(id: string): Promise<void> {
    await apiFetch<ApiSuccess<unknown>>(`/bookings/me/${id}/cancel`, { method: 'POST' });
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
