import { NewsArticle, CinemaEvent, UserProfile } from '@/types/content';
import { Booking } from '@/types/booking';
import { MAJUNOON } from '@/data/movies';

export const MOCK_NEWS: NewsArticle[] = [
  {
    id: 'n1',
    title: 'Majunoon Opens Exclusively at Olympus Cinema',
    slug: 'majunoon-opens-olympus',
    category: 'Premiere',
    summary: 'Crystal Entertainment presents Majunoon with multiple daily shows at Olympus Cinema.',
    content:
      'Book your seats for Majunoon at Olympus Cinema. Choose any of our open showtimes and reserve up to 15 seats per person. Reservations are confirmed after payment.',
    author: 'Crystal Entertainment',
    publishedAt: '2026-08-12',
    imageUrl: MAJUNOON.backdropUrl,
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
    author: 'Olympus Cinema',
    publishedAt: '2026-08-13',
    imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1000&auto=format&fit=crop',
    isFeatured: false,
  },
];

export const MOCK_EVENTS: CinemaEvent[] = [
  {
    id: 'e1',
    title: 'Majunoon Opening Weekend',
    slug: 'majunoon-opening-weekend',
    subtitle: 'Multiple shows daily — reserve your seats now',
    date: '2026-08-15',
    time: '14:00',
    location: 'Olympus Cinema',
    description:
      'Crystal Entertainment invites you to Majunoon at Olympus Cinema. Pick any open showtime and reserve seats online.',
    imageUrl: MAJUNOON.backdropUrl,
    ctaText: 'Reserve Seats',
  },
];

export const MOCK_USER: UserProfile = {
  id: 'usr-8812',
  name: 'Alexander Wright',
  email: 'alexander.wright@cinema.com',
  phone: '+1 (555) 234-5678',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop',
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
    movieTitle: 'Majunoon',
    moviePoster: MAJUNOON.posterUrl,
    hallName: 'Olympus Cinema',
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
    qrCodeValue: 'RESERVATION|RES-774219|Majunoon|2026-08-15|14:00|E-4,E-5',
  },
];
