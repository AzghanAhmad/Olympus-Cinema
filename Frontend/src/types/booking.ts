import { Seat } from './screening';

export type BookingStatus = 'CONFIRMED' | 'CANCELLED' | 'USED' | 'PENDING';

export interface CustomerDetails {
  fullName: string;
  email: string;
  phone: string;
}

export interface Booking {
  id: string;
  bookingCode: string; // e.g. "CIN-894210"
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
  status: BookingStatus;
  createdAt: string;
  qrCodeValue: string;
}
