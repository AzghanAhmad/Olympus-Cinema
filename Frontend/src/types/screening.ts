export type SeatCategory = 'STANDARD' | 'PREMIUM' | 'VIP' | 'WHEELCHAIR';
export type SeatStatus = 'AVAILABLE' | 'SELECTED' | 'RESERVED' | 'OCCUPIED' | 'DISABLED' | 'USED';

export interface Seat {
  id: string; // e.g. "A-1"
  row: string; // "A"
  number: number; // 1
  category: SeatCategory;
  price: number;
  status: SeatStatus;
}

export interface CinemaHall {
  id: string;
  name: string;
  screenType: 'IMAX 3D' | 'DOLBY ATMOS' | 'STANDARD 4K' | 'VIP SUITE';
  totalSeats: number;
  rows: number;
  seatsPerRow: number;
}

export interface Screening {
  id: string;
  movieId: string;
  hallId: string;
  hallName: string;
  screenType: string;
  date: string; // YYYY-MM-DD
  startTime: string; // "19:30"
  endTime: string; // "22:15"
  availableSeatsCount: number;
  totalSeatsCount: number;
  priceStandard: number;
  priceVIP: number;
}
