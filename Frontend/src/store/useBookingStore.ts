import { create } from 'zustand';
import { Seat, Screening } from '@/types/screening';
import { Movie } from '@/types/movie';
import { CustomerDetails } from '@/types/booking';
import { toast } from '@/store/useToastStore';
import { useSiteSettingsStore } from '@/store/useSiteSettingsStore';
import { apiFetch, ApiSuccess } from '@/lib/api';

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
  pendingEmailCode: string;
  pendingPhoneCode: string;
  otpSending: boolean;

  setScreeningAndMovie: (screening: Screening, movie: Movie) => void;
  toggleSeat: (seat: Seat) => 'selected' | 'deselected' | 'limit';
  clearSeats: () => void;
  setCustomer: (customer: CustomerDetails) => void;
  setStep: (step: number) => void;
  startHoldTimer: (minutes?: number) => void;
  resetBooking: () => void;
  getTotalPrice: () => number;
  sendEmailCode: () => Promise<void>;
  sendPhoneCode: () => Promise<void>;
  verifyEmailCode: (code: string) => Promise<boolean>;
  verifyPhoneCode: (code: string) => Promise<boolean>;
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
  otpSending: false,

  setScreeningAndMovie: (screening, movie) => {
    const prev = get().screening;
    if (prev && prev.id !== screening.id) {
      set({ screening, movie, selectedSeats: [], step: 1, holdExpiresAt: null });
    } else {
      set({ screening, movie });
    }
  },

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
    set((state) => ({
      customer,
      emailVerified: state.customer.email === customer.email ? state.emailVerified : false,
      emailCodeSent: state.customer.email === customer.email ? state.emailCodeSent : false,
      phoneVerified: state.customer.phone === customer.phone ? state.phoneVerified : false,
      phoneCodeSent: state.customer.phone === customer.phone ? state.phoneCodeSent : false,
    })),

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
      otpSending: false,
    }),

  getTotalPrice: () => get().selectedSeats.reduce((acc, seat) => acc + seat.price, 0),

  sendEmailCode: async () => {
    const email = get().customer.email.trim().toLowerCase();
    if (!email) {
      toast.warning('Enter email', 'Add a valid email first.');
      return;
    }
    set({ otpSending: true });
    try {
      await apiFetch<ApiSuccess<{ sent: boolean }>>('/otp/send', {
        method: 'POST',
        body: JSON.stringify({ channel: 'email', email }),
      });
      set({ emailCodeSent: true, emailVerified: false, pendingEmailCode: '' });
      toast.success('Code sent', `Check ${email} for your verification code.`);
    } catch (err) {
      toast.error(
        'Could not send code',
        err instanceof Error ? err.message : 'Please try again.',
      );
    } finally {
      set({ otpSending: false });
    }
  },

  sendPhoneCode: async () => {
    const phone = get().customer.phone.trim();
    const email = get().customer.email.trim().toLowerCase();
    if (!phone || phone.length < 7) {
      toast.warning('Enter phone', 'Add a valid phone first.');
      return;
    }
    set({ otpSending: true });
    try {
      await apiFetch<ApiSuccess<{ sent: boolean; deliveredVia?: string }>>('/otp/send', {
        method: 'POST',
        body: JSON.stringify({ channel: 'phone', phone, email: email || undefined }),
      });
      set({ phoneCodeSent: true, phoneVerified: false, pendingPhoneCode: '' });
      toast.success(
        'Code sent',
        email
          ? `Phone verification code was emailed to ${email}.`
          : 'Verification code sent.',
      );
    } catch (err) {
      toast.error(
        'Could not send code',
        err instanceof Error ? err.message : 'Please try again.',
      );
    } finally {
      set({ otpSending: false });
    }
  },

  verifyEmailCode: async (code) => {
    const email = get().customer.email.trim().toLowerCase();
    const clean = code.trim();
    if (!email || !clean) {
      toast.error('Invalid code', 'Enter the code from your email.');
      return false;
    }
    try {
      await apiFetch<ApiSuccess<{ verified: boolean }>>('/otp/verify', {
        method: 'POST',
        body: JSON.stringify({ channel: 'email', email, code: clean }),
      });
      set({ emailVerified: true });
      toast.success('Email verified', 'You can complete your reservation.');
      return true;
    } catch (err) {
      toast.error(
        'Invalid code',
        err instanceof Error ? err.message : 'Check the email verification code and try again.',
      );
      return false;
    }
  },

  verifyPhoneCode: async (code) => {
    const phone = get().customer.phone.trim();
    const clean = code.trim();
    if (!phone || !clean) {
      toast.error('Invalid code', 'Enter the phone verification code.');
      return false;
    }
    try {
      await apiFetch<ApiSuccess<{ verified: boolean }>>('/otp/verify', {
        method: 'POST',
        body: JSON.stringify({ channel: 'phone', phone, code: clean }),
      });
      set({ phoneVerified: true });
      toast.success('Phone verified', 'You can complete your reservation.');
      return true;
    } catch (err) {
      toast.error(
        'Invalid code',
        err instanceof Error ? err.message : 'Check the SMS verification code and try again.',
      );
      return false;
    }
  },
}));
