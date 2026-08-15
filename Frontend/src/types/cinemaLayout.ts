import { CinemaHall, SeatCategory } from '@/types/screening';

export interface SeatRowLayout {
  /** Row / column label shown on the map (e.g. A, B, AA) */
  label: string;
  left: number;
  right: number;
}

export interface SeatMeta {
  category: SeatCategory;
  disabled: boolean;
}

export interface CinemaScreen {
  id: string;
  name: string;
  screenType: CinemaHall['screenType'];
  rows: SeatRowLayout[];
  /** Keyed by `${rowLabel}-${seatNumber}` */
  seatMeta: Record<string, SeatMeta>;
}
