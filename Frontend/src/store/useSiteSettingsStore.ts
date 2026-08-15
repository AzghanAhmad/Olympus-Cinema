import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SiteSettingsState {
  brandName: string;
  cinemaName: string;
  maxTicketsPerPerson: number;
  seatHoldMinutes: number;
  /** Soft cap used when regenerating / displaying seat map size info */
  totalSeats: number;
  setCinemaName: (name: string) => void;
  setMaxTicketsPerPerson: (n: number) => void;
  setSeatHoldMinutes: (n: number) => void;
  setTotalSeats: (n: number) => void;
}

export const useSiteSettingsStore = create<SiteSettingsState>()(
  persist(
    (set) => ({
      brandName: 'Crystal Entertainment',
      cinemaName: 'Olympus',
      maxTicketsPerPerson: 15,
      seatHoldMinutes: 10,
      totalSeats: 438,
      setCinemaName: (cinemaName) => set({ cinemaName }),
      setMaxTicketsPerPerson: (maxTicketsPerPerson) => set({ maxTicketsPerPerson }),
      setSeatHoldMinutes: (seatHoldMinutes) => set({ seatHoldMinutes }),
      setTotalSeats: (totalSeats) => set({ totalSeats }),
    }),
    { name: 'crystal-site-settings' }
  )
);
