import { Screening, CinemaHall } from '@/types/screening';
import { OLYMPUS_TOTAL_SEATS, OLYMPUS_ROWS } from '@/data/seats';
import { MAJUNOON_ID } from '@/data/movies';

/** Single Olympus cinema — seat count editable via admin settings store */
export const MOCK_HALLS: CinemaHall[] = [
  {
    id: 'hall-olympus',
    name: 'Olympus Cinema',
    screenType: 'STANDARD 4K',
    totalSeats: OLYMPUS_TOTAL_SEATS,
    rows: OLYMPUS_ROWS.length,
    seatsPerRow: 22,
  },
];

/** 3–5 concurrent Majunoon shows open for booking */
export const MOCK_SCREENINGS: Screening[] = [
  {
    id: 'scr-101',
    movieId: MAJUNOON_ID,
    hallId: 'hall-olympus',
    hallName: 'Olympus Cinema',
    screenType: 'STANDARD 4K',
    date: '2026-08-15',
    startTime: '14:00',
    endTime: '16:35',
    availableSeatsCount: 320,
    totalSeatsCount: OLYMPUS_TOTAL_SEATS,
    priceStandard: 12.0,
    priceVIP: 20.0,
  },
  {
    id: 'scr-102',
    movieId: MAJUNOON_ID,
    hallId: 'hall-olympus',
    hallName: 'Olympus Cinema',
    screenType: 'STANDARD 4K',
    date: '2026-08-15',
    startTime: '17:00',
    endTime: '19:35',
    availableSeatsCount: 280,
    totalSeatsCount: OLYMPUS_TOTAL_SEATS,
    priceStandard: 12.0,
    priceVIP: 20.0,
  },
  {
    id: 'scr-103',
    movieId: MAJUNOON_ID,
    hallId: 'hall-olympus',
    hallName: 'Olympus Cinema',
    screenType: 'STANDARD 4K',
    date: '2026-08-15',
    startTime: '19:30',
    endTime: '22:05',
    availableSeatsCount: 350,
    totalSeatsCount: OLYMPUS_TOTAL_SEATS,
    priceStandard: 15.0,
    priceVIP: 22.0,
  },
  {
    id: 'scr-104',
    movieId: MAJUNOON_ID,
    hallId: 'hall-olympus',
    hallName: 'Olympus Cinema',
    screenType: 'STANDARD 4K',
    date: '2026-08-15',
    startTime: '21:45',
    endTime: '00:20',
    availableSeatsCount: 400,
    totalSeatsCount: OLYMPUS_TOTAL_SEATS,
    priceStandard: 15.0,
    priceVIP: 22.0,
  },
  {
    id: 'scr-105',
    movieId: MAJUNOON_ID,
    hallId: 'hall-olympus',
    hallName: 'Olympus Cinema',
    screenType: 'STANDARD 4K',
    date: '2026-08-16',
    startTime: '16:00',
    endTime: '18:35',
    availableSeatsCount: 410,
    totalSeatsCount: OLYMPUS_TOTAL_SEATS,
    priceStandard: 12.0,
    priceVIP: 20.0,
  },
];
