import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CinemaHall } from '@/types/screening';
import { CinemaScreen, SeatRowLayout } from '@/types/cinemaLayout';
import { OLYMPUS_ROW_LAYOUT, OLYMPUS_ROWS } from '@/data/seats';

export type { CinemaScreen, SeatRowLayout, SeatMeta } from '@/types/cinemaLayout';

export function countSeatsInRows(rows: SeatRowLayout[]): number {
  return rows.reduce((sum, r) => sum + r.left + r.right, 0);
}

function olympusRows(): SeatRowLayout[] {
  return OLYMPUS_ROWS.map((label) => ({
    label,
    left: OLYMPUS_ROW_LAYOUT[label].left,
    right: OLYMPUS_ROW_LAYOUT[label].right,
  }));
}

export function createDefaultScreen(
  id: string,
  name: string,
  screenType: CinemaHall['screenType'] = 'STANDARD 4K'
): CinemaScreen {
  return {
    id,
    name,
    screenType,
    rows: olympusRows(),
    seatMeta: {},
  };
}

const DEFAULT_SCREENS: CinemaScreen[] = [
  createDefaultScreen('hall-olympus', 'Crystal Entertainment', 'STANDARD 4K'),
];

interface CinemaLayoutState {
  screens: CinemaScreen[];
  updatedAt: number;
  saveScreen: (screen: CinemaScreen) => void;
  addScreen: (screen: CinemaScreen) => void;
  removeScreen: (id: string) => void;
  getScreen: (id: string) => CinemaScreen | undefined;
  getHallSummaries: () => CinemaHall[];
}

export const useCinemaLayoutStore = create<CinemaLayoutState>()(
  persist(
    (set, get) => ({
      screens: DEFAULT_SCREENS,
      updatedAt: 0,

      saveScreen: (screen) =>
        set((state) => {
          const exists = state.screens.some((s) => s.id === screen.id);
          return {
            screens: exists
              ? state.screens.map((s) => (s.id === screen.id ? screen : s))
              : [...state.screens, screen],
            updatedAt: Date.now(),
          };
        }),

      addScreen: (screen) =>
        set((state) => ({
          screens: [...state.screens, screen],
          updatedAt: Date.now(),
        })),

      removeScreen: (id) =>
        set((state) => ({
          screens: state.screens.filter((s) => s.id !== id),
          updatedAt: Date.now(),
        })),

      getScreen: (id) => get().screens.find((s) => s.id === id),

      getHallSummaries: () =>
        get().screens.map((s) => ({
          id: s.id,
          name: s.name,
          screenType: s.screenType,
          totalSeats: countSeatsInRows(s.rows),
          rows: s.rows.length,
          seatsPerRow: Math.max(0, ...s.rows.map((r) => r.left + r.right)),
        })),
    }),
    { name: 'crystal-cinema-layout-v1' }
  )
);
