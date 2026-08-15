import { MOCK_BOOKINGS } from '@/data/content';
import { Booking, CustomerDetails } from '@/types/booking';
import { Seat } from '@/types/screening';

export const bookingService = {
  async getBookings(): Promise<Booking[]> {
    await new Promise((res) => setTimeout(res, 200));
    return MOCK_BOOKINGS;
  },

  async getBookingById(id: string): Promise<Booking | null> {
    await new Promise((res) => setTimeout(res, 150));
    return MOCK_BOOKINGS.find((b) => b.id === id) || MOCK_BOOKINGS[0] || null;
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
    await new Promise((res) => setTimeout(res, 300));
    const randomCode = `RES-${Math.floor(100000 + Math.random() * 900000)}`;
    const newBooking: Booking = {
      id: `bk-${Date.now()}`,
      bookingCode: randomCode,
      ...data,
      // Unconfirmed until payment — QR is a reservation reference only
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      qrCodeValue: `RESERVATION|${randomCode}|${data.movieTitle}|${data.date}|${data.startTime}|${data.seats.map((s) => s.id).join(',')}`,
    };
    MOCK_BOOKINGS.unshift(newBooking);
    return newBooking;
  },
};
