import { create } from 'zustand';
import { Seat, Screening } from '@/types/screening';
import { Movie } from '@/types/movie';
import { CustomerDetails } from '@/types/booking';

interface BookingStoreState {
  screening: Screening | null;
  movie: Movie | null;
  selectedSeats: Seat[];
  customer: CustomerDetails;
  holdExpiresAt: number | null;
  step: number;
  
  // Actions
  setScreeningAndMovie: (screening: Screening, movie: Movie) => void;
  toggleSeat: (seat: Seat) => void;
  clearSeats: () => void;
  setCustomer: (customer: CustomerDetails) => void;
  setStep: (step: number) => void;
  startHoldTimer: (minutes?: number) => void;
  resetBooking: () => void;
  getTotalPrice: () => number;
}

export const useBookingStore = create<BookingStoreState>((set, get) => ({
  screening: null,
  movie: null,
  selectedSeats: [],
  customer: {
    fullName: '',
    email: '',
    phone: '',
  },
  holdExpiresAt: null,
  step: 1,

  setScreeningAndMovie: (screening, movie) => set({ screening, movie }),

  toggleSeat: (seat) => {
    const { selectedSeats } = get();
    const exists = selectedSeats.some((s) => s.id === seat.id);

    if (exists) {
      set({ selectedSeats: selectedSeats.filter((s) => s.id !== seat.id) });
    } else {
      set({ selectedSeats: [...selectedSeats, { ...seat, status: 'SELECTED' }] });
    }

    if (!get().holdExpiresAt && selectedSeats.length === 0) {
      get().startHoldTimer(10);
    }
  },

  clearSeats: () => set({ selectedSeats: [] }),

  setCustomer: (customer) => set({ customer }),

  setStep: (step) => set({ step }),

  startHoldTimer: (minutes = 10) => {
    const expires = Date.now() + minutes * 60 * 1000;
    set({ holdExpiresAt: expires });
  },

  resetBooking: () =>
    set({
      selectedSeats: [],
      holdExpiresAt: null,
      step: 1,
      customer: { fullName: '', email: '', phone: '' },
    }),

  getTotalPrice: () => {
    return get().selectedSeats.reduce((acc, seat) => acc + seat.price, 0);
  },
}));
