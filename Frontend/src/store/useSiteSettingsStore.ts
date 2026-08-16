import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SiteSettingsState {
  brandName: string;
  cinemaName: string;
  maxTicketsPerPerson: number;
  seatHoldMinutes: number;
  /** Uniform price for all seats across the cinema */
  ticketPrice: number;
  /** Soft cap used when regenerating / displaying seat map size info */
  totalSeats: number;
  setCinemaName: (name: string) => void;
  setMaxTicketsPerPerson: (n: number) => void;
  setSeatHoldMinutes: (n: number) => void;
  setTicketPrice: (price: number) => void;
  setTotalSeats: (n: number) => void;
}

export const useSiteSettingsStore = create<SiteSettingsState>()(
  persist(
    (set) => ({
      brandName: 'Crystal Entertainment',
      cinemaName: 'Crystal Entertainment',
      maxTicketsPerPerson: 15,
      seatHoldMinutes: 10,
      ticketPrice: 15.0,
      totalSeats: 438,
      setCinemaName: (cinemaName) => set({ cinemaName }),
      setMaxTicketsPerPerson: (maxTicketsPerPerson) => set({ maxTicketsPerPerson }),
      setSeatHoldMinutes: (seatHoldMinutes) => set({ seatHoldMinutes }),
      setTicketPrice: (ticketPrice) => set({ ticketPrice }),
      setTotalSeats: (totalSeats) => set({ totalSeats }),
    }),
    { name: 'crystal-site-settings-v3' }
  )
);
