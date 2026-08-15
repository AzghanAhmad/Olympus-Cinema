import { NewsArticle, CinemaEvent, UserProfile } from '@/types/content';
import { Booking } from '@/types/booking';
import { MAJNOON } from '@/data/movies';

export const MOCK_NEWS: NewsArticle[] = [
  {
    id: 'n1',
    title: 'Majnoon Opens with Crystal Entertainment',
    slug: 'majnoon-opens-crystal',
    category: 'Premiere',
    summary: 'Crystal Entertainment presents Majnoon with multiple daily shows.',
    content:
      'Book your seats for Majnoon with Crystal Entertainment. Choose any of our open showtimes and reserve up to 15 seats per person. Reservations are confirmed after payment.',
    author: 'Crystal Entertainment',
    publishedAt: '2026-08-12',
    imageUrl: MAJNOON.backdropUrl,
    isFeatured: true,
  },
  {
    id: 'n2',
    title: 'How Seat Reservations Work',
    slug: 'how-reservations-work',
    category: 'Booking Guide',
    summary: 'A reservation holds your seats until payment. Your ticket is issued only after payment is complete.',
    content:
      'After you reserve seats, you receive a booking reference (QR). This is not an entry ticket. Our team will contact you as soon as the reservation is confirmed. Tickets are provided once payment is done.',
    author: 'Crystal Entertainment',
    publishedAt: '2026-08-13',
    imageUrl: MAJNOON.posterUrl,
    isFeatured: false,
  },
];

export const MOCK_EVENTS: CinemaEvent[] = [
  {
    id: 'e1',
    title: 'Majnoon Opening Weekend',
    slug: 'majnoon-opening-weekend',
    subtitle: 'Multiple shows daily — reserve your seats now',
    date: '2026-08-15',
    time: '14:00',
    location: 'Crystal Entertainment',
    description:
      'Crystal Entertainment invites you to Majnoon. Pick any open showtime and reserve seats online.',
    imageUrl: MAJNOON.backdropUrl,
    ctaText: 'Reserve Seats',
  },
];

export const MOCK_USER: UserProfile = {
  id: 'usr-8812',
  name: 'Alexander Wright',
  email: 'alexander.wright@cinema.com',
  phone: '+1 (555) 234-5678',
  avatarUrl: '/images/avatar.svg',
  role: 'ADMIN',
  joinedDate: '2025-01-15',
  totalBookings: 14,
};

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'bk-9901',
    bookingCode: 'RES-774219',
    screeningId: 'scr-101',
    movieId: 'm1',
    movieTitle: 'Majnoon',
    moviePoster: MAJNOON.posterUrl,
    hallName: 'Crystal Entertainment',
    screenType: 'STANDARD 4K',
    date: '2026-08-15',
    startTime: '14:00',
    seats: [
      { id: 'E-4', row: 'E', number: 4, category: 'STANDARD', price: 12.0, status: 'OCCUPIED' },
      { id: 'E-5', row: 'E', number: 5, category: 'STANDARD', price: 12.0, status: 'OCCUPIED' },
    ],
    customer: {
      fullName: 'Alexander Wright',
      email: 'alexander.wright@cinema.com',
      phone: '+1 (555) 234-5678',
    },
    totalPrice: 24.0,
    status: 'PENDING',
    createdAt: '2026-08-14T10:15:00Z',
    qrCodeValue: 'RESERVATION|RES-774219|Majnoon|2026-08-15|14:00|E-4,E-5',
  },
];
