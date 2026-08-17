import { apiFetch, ApiPaginated, ApiSuccess, qs } from '@/lib/api';

export const adminApi = {
  dashboard: () => apiFetch<ApiSuccess<DashboardStats>>('/admin/dashboard'),

  movies: {
    list: (search?: string) =>
      apiFetch<ApiPaginated<AdminMovie>>(`/admin/movies${qs({ search, limit: 50 })}`),
    create: (body: Record<string, unknown>) =>
      apiFetch<ApiSuccess<AdminMovie>>('/admin/movies', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    update: (id: string, body: Record<string, unknown>) =>
      apiFetch<ApiSuccess<AdminMovie>>(`/admin/movies/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    publish: (id: string) =>
      apiFetch<ApiSuccess<AdminMovie>>(`/admin/movies/${id}/publish`, { method: 'PATCH' }),
    remove: (id: string) =>
      apiFetch<ApiSuccess<{ message: string }>>(`/admin/movies/${id}`, { method: 'DELETE' }),
  },

  screenings: {
    list: () => apiFetch<ApiPaginated<AdminScreening>>(`/admin/screenings${qs({ limit: 100 })}`),
    create: (body: Record<string, unknown>) =>
      apiFetch<ApiSuccess<AdminScreening>>('/admin/screenings', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    update: (id: string, body: Record<string, unknown>) =>
      apiFetch<ApiSuccess<AdminScreening>>(`/admin/screenings/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    cancel: (id: string) =>
      apiFetch<ApiSuccess<AdminScreening>>(`/admin/screenings/${id}/cancel`, { method: 'POST' }),
    remove: (id: string) =>
      apiFetch<ApiSuccess<{ message: string }>>(`/admin/screenings/${id}`, { method: 'DELETE' }),
  },

  screens: {
    list: () => apiFetch<ApiPaginated<AdminScreen>>(`/admin/screens${qs({ limit: 50 })}`),
    get: (id: string) => apiFetch<ApiSuccess<AdminScreenDetail>>(`/admin/screens/${id}`),
    create: (body: Record<string, unknown>) =>
      apiFetch<ApiSuccess<AdminScreen>>('/admin/screens', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    update: (id: string, body: Record<string, unknown>) =>
      apiFetch<ApiSuccess<AdminScreen>>(`/admin/screens/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    remove: (id: string) =>
      apiFetch<ApiSuccess<{ message: string }>>(`/admin/screens/${id}`, { method: 'DELETE' }),
    seats: (screenId: string) =>
      apiFetch<ApiSuccess<AdminSeat[]>>(`/admin/screens/${screenId}/seats`),
    createSeat: (screenId: string, body: Record<string, unknown>) =>
      apiFetch<ApiSuccess<AdminSeat>>(`/admin/screens/${screenId}/seats`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    updateSeat: (screenId: string, seatId: string, body: Record<string, unknown>) =>
      apiFetch<ApiSuccess<AdminSeat>>(`/admin/screens/${screenId}/seats/${seatId}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    deleteSeat: (screenId: string, seatId: string) =>
      apiFetch<ApiSuccess<{ message: string }>>(`/admin/screens/${screenId}/seats/${seatId}`, {
        method: 'DELETE',
      }),
  },

  bookings: {
    list: (search?: string) =>
      apiFetch<ApiPaginated<AdminBooking>>(`/admin/bookings${qs({ search, limit: 50 })}`),
    cancel: (id: string) =>
      apiFetch<ApiSuccess<AdminBooking>>(`/admin/bookings/${id}/cancel`, { method: 'POST' }),
  },

  users: {
    list: (search?: string) =>
      apiFetch<ApiPaginated<AdminUser>>(`/admin/users${qs({ search, limit: 50 })}`),
    updateStatus: (id: string, status: string) =>
      apiFetch<ApiSuccess<AdminUser>>(`/admin/users/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },

  news: {
    list: () => apiFetch<ApiPaginated<AdminNews>>(`/admin/news${qs({ limit: 50 })}`),
    create: (body: Record<string, unknown>) =>
      apiFetch<ApiSuccess<AdminNews>>('/admin/news', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    update: (id: string, body: Record<string, unknown>) =>
      apiFetch<ApiSuccess<AdminNews>>(`/admin/news/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    remove: (id: string) =>
      apiFetch<ApiSuccess<{ message: string }>>(`/admin/news/${id}`, { method: 'DELETE' }),
  },

  events: {
    list: () => apiFetch<ApiPaginated<AdminEvent>>(`/admin/events${qs({ limit: 50 })}`),
    create: (body: Record<string, unknown>) =>
      apiFetch<ApiSuccess<AdminEvent>>('/admin/events', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    update: (id: string, body: Record<string, unknown>) =>
      apiFetch<ApiSuccess<AdminEvent>>(`/admin/events/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    remove: (id: string) =>
      apiFetch<ApiSuccess<{ message: string }>>(`/admin/events/${id}`, { method: 'DELETE' }),
  },

  settings: {
    get: () => apiFetch<ApiSuccess<Record<string, unknown>>>('/admin/settings'),
    update: (settings: Record<string, unknown>) =>
      apiFetch<ApiSuccess<Record<string, unknown>>>('/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify({ settings }),
      }),
  },
};

export interface DashboardStats {
  totals: {
    users: number;
    movies: number;
    publishedMovies: number;
    bookings: number;
    confirmedBookings: number;
    upcomingScreenings: number;
    activeEvents: number;
    publishedNews: number;
  };
  today: { bookings: number; ticketsSold: number };
  bookingsByStatus: Array<{ status: string; count: number }>;
  recentBookings: Array<{
    id: string;
    bookingCode: string;
    customerName: string;
    status: string;
    createdAt: string;
    screening?: { movie?: { title: string }; screen?: { name: string } };
    _count?: { seats: number };
  }>;
  weeklyTrend: Array<{ day: string; bookings: number; tickets: number }>;
  popularMovies: Array<{ name: string; tickets: number }>;
}

export interface AdminMovie {
  id: string;
  title: string;
  slug: string;
  tagline?: string | null;
  synopsis: string;
  durationMinutes: number;
  language: string;
  releaseDate: string;
  ageRating: string;
  rating: number;
  posterUrl?: string | null;
  backdropUrl?: string | null;
  trailerUrl?: string | null;
  status: string;
  isFeatured: boolean;
  genres?: Array<{ id: string; name: string }>;
}

export interface AdminScreening {
  id: string;
  movieId: string;
  screenId: string;
  startTime: string;
  endTime: string;
  status: string;
  movie?: { title: string };
  screen?: { name: string; capacity: number };
}

export interface AdminScreen {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  capacity: number;
  status: string;
  _count?: { seats: number };
}

export interface AdminScreenDetail extends AdminScreen {
  seats: AdminSeat[];
}

export interface AdminSeat {
  id: string;
  screenId: string;
  row: string;
  number: number;
  label: string;
  seatType: string;
  status: string;
}

export interface AdminBooking {
  id: string;
  bookingCode: string;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  createdAt: string;
  screening?: {
    startTime: string;
    movie?: { title: string };
    screen?: { name: string };
  };
  seats?: Array<{ seat?: { label: string } }>;
  tickets?: Array<{ id: string }>;
}

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  role: string;
  status: string;
  createdAt: string;
}

export interface AdminNews {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  status: string;
  publishedAt?: string | null;
  author?: { firstName?: string; lastName?: string } | null;
}

export interface AdminEvent {
  id: string;
  title: string;
  slug: string;
  description: string;
  location?: string | null;
  startTime: string;
  endTime: string;
  status: string;
}
