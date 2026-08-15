import { create } from 'zustand';
import { Seat, Screening } from '@/types/screening';
import { Movie } from '@/types/movie';
import { CustomerDetails } from '@/types/booking';
import { toast } from '@/store/useToastStore';
import { useSiteSettingsStore } from '@/store/useSiteSettingsStore';

interface BookingStoreState {
  screening: Screening | null;
  movie: Movie | null;
  selectedSeats: Seat[];
  customer: CustomerDetails;
  holdExpiresAt: number | null;
  step: number;
  emailVerified: boolean;
  phoneVerified: boolean;
  emailCodeSent: boolean;
  phoneCodeSent: boolean;
  /** Demo codes shown after "send" — simulate OTP */
  pendingEmailCode: string;
  pendingPhoneCode: string;

  setScreeningAndMovie: (screening: Screening, movie: Movie) => void;
  toggleSeat: (seat: Seat) => 'selected' | 'deselected' | 'limit';
  clearSeats: () => void;
  setCustomer: (customer: CustomerDetails) => void;
  setStep: (step: number) => void;
  startHoldTimer: (minutes?: number) => void;
  resetBooking: () => void;
  getTotalPrice: () => number;
  sendEmailCode: () => void;
  sendPhoneCode: () => void;
  verifyEmailCode: (code: string) => boolean;
  verifyPhoneCode: (code: string) => boolean;
}

function randomOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
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
  emailVerified: false,
  phoneVerified: false,
  emailCodeSent: false,
  phoneCodeSent: false,
  pendingEmailCode: '',
  pendingPhoneCode: '',

  setScreeningAndMovie: (screening, movie) => set({ screening, movie }),

  toggleSeat: (seat) => {
    const { selectedSeats } = get();
    const exists = selectedSeats.some((s) => s.id === seat.id);
    const maxTickets = useSiteSettingsStore.getState().maxTicketsPerPerson;

    if (exists) {
      set({ selectedSeats: selectedSeats.filter((s) => s.id !== seat.id) });
      return 'deselected' as const;
    }

    if (selectedSeats.length >= maxTickets) {
      toast.warning('Seat limit reached', `Maximum ${maxTickets} tickets per person.`);
      return 'limit' as const;
    }

    set({ selectedSeats: [...selectedSeats, { ...seat, status: 'SELECTED' }] });

    if (!get().holdExpiresAt && get().selectedSeats.length > 0) {
      const minutes = useSiteSettingsStore.getState().seatHoldMinutes;
      get().startHoldTimer(minutes);
    }

    return 'selected' as const;
  },

  clearSeats: () => set({ selectedSeats: [] }),

  setCustomer: (customer) =>
    set({
      customer,
      emailVerified: false,
      phoneVerified: false,
      emailCodeSent: false,
      phoneCodeSent: false,
    }),

  setStep: (step) => set({ step }),

  startHoldTimer: (minutes) => {
    const mins = minutes ?? useSiteSettingsStore.getState().seatHoldMinutes;
    set({ holdExpiresAt: Date.now() + mins * 60 * 1000 });
  },

  resetBooking: () =>
    set({
      selectedSeats: [],
      holdExpiresAt: null,
      step: 1,
      customer: { fullName: '', email: '', phone: '' },
      emailVerified: false,
      phoneVerified: false,
      emailCodeSent: false,
      phoneCodeSent: false,
      pendingEmailCode: '',
      pendingPhoneCode: '',
    }),

  getTotalPrice: () => get().selectedSeats.reduce((acc, seat) => acc + seat.price, 0),

  sendEmailCode: () => {
    const code = randomOtp();
    set({ pendingEmailCode: code, emailCodeSent: true, emailVerified: false });
    toast.info('Email code sent', `Demo code: ${code}`);
  },

  sendPhoneCode: () => {
    const code = randomOtp();
    set({ pendingPhoneCode: code, phoneCodeSent: true, phoneVerified: false });
    toast.info('SMS code sent', `Demo code: ${code}`);
  },

  verifyEmailCode: (code) => {
    const ok = code.trim() === get().pendingEmailCode;
    if (ok) {
      set({ emailVerified: true });
      toast.success('Email verified', 'You can complete your reservation.');
    } else {
      toast.error('Invalid code', 'Check the email verification code and try again.');
    }
    return ok;
  },

  verifyPhoneCode: (code) => {
    const ok = code.trim() === get().pendingPhoneCode;
    if (ok) {
      set({ phoneVerified: true });
      toast.success('Phone verified', 'You can complete your reservation.');
    } else {
      toast.error('Invalid code', 'Check the SMS verification code and try again.');
    }
    return ok;
  },
}));
