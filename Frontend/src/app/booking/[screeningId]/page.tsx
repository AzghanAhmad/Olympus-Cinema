'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { CinemaSeatMap } from '@/components/booking/CinemaSeatMap';
import { SeatHoldTimer } from '@/components/booking/SeatHoldTimer';
import { useBookingStore } from '@/store/useBookingStore';
import { useSiteSettingsStore } from '@/store/useSiteSettingsStore';
import { useCinemaLayoutStore } from '@/store/useCinemaLayoutStore';
import { screeningService } from '@/services/screeningService';
import { movieService } from '@/services/movieService';
import { bookingService } from '@/services/bookingService';
import { Seat, Screening } from '@/types/screening';
import { Movie } from '@/types/movie';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from '@/store/useToastStore';
import { aisleAfterByRow } from '@/data/seats';
import { ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';

const guestSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email address is required'),
  phone: z.string().min(7, 'Phone number is required'),
});

type GuestFormData = z.infer<typeof guestSchema>;

export default function BookingPage() {
  const router = useRouter();
  const params = useParams();
  const screeningId = params.screeningId as string;

  const [screening, setScreening] = useState<Screening | null>(null);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');

  const maxTickets = useSiteSettingsStore((s) => s.maxTicketsPerPerson);
  const cinemaName = useSiteSettingsStore((s) => s.cinemaName);
  const layoutUpdatedAt = useCinemaLayoutStore((s) => s.updatedAt);
  const screens = useCinemaLayoutStore((s) => s.screens);
  const layoutScreen = screens.find((s) => s.id === screening?.hallId);

  const {
    selectedSeats,
    customer,
    step,
    setStep,
    setCustomer,
    setScreeningAndMovie,
    getTotalPrice,
    emailVerified,
    phoneVerified,
    emailCodeSent,
    phoneCodeSent,
    pendingEmailCode,
    pendingPhoneCode,
    sendEmailCode,
    sendPhoneCode,
    verifyEmailCode,
    verifyPhoneCode,
  } = useBookingStore();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
    defaultValues: customer,
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const scr = await screeningService.getScreeningById(screeningId);
      if (scr) {
        setScreening(scr);
        const mov = await movieService.getMovieById(scr.movieId);
        setMovie(mov);
        if (mov) setScreeningAndMovie(scr, mov);
        const seatList = await screeningService.getScreeningSeats(scr.id);
        setSeats(seatList);
      }
      setLoading(false);
    }
    loadData();
  }, [screeningId, setScreeningAndMovie]);

  useEffect(() => {
    if (!layoutUpdatedAt || !screeningId) return;
    async function refreshLayout() {
      const scr = await screeningService.getScreeningById(screeningId);
      if (scr) {
        setScreening(scr);
        const seatList = await screeningService.getScreeningSeats(scr.id);
        setSeats(seatList);
      }
    }
    refreshLayout();
  }, [layoutUpdatedAt, screeningId]);

  if (loading || !screening || !movie) {
    return (
      <PublicLayout>
        <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm font-semibold">Loading seat map...</p>
        </div>
      </PublicLayout>
    );
  }

  const handleGuestSubmit = (data: GuestFormData) => {
    setCustomer(data);
    if (!emailVerified && !phoneVerified) {
      toast.warning('Verify contact', 'Confirm your email or phone code before continuing.');
      return;
    }
    setStep(3);
  };

  const handleConfirmBooking = async () => {
    if (!emailVerified && !phoneVerified) {
      toast.error('Verification required', 'Verify email or phone before reserving.');
      setStep(2);
      return;
    }

    try {
      const newBooking = await bookingService.createBooking({
        screeningId: screening.id,
        movieId: movie.id,
        movieTitle: movie.title,
        moviePoster: movie.posterUrl,
        hallName: cinemaName || screening.hallName,
        screenType: screening.screenType,
        date: screening.date,
        startTime: screening.startTime,
        seats: selectedSeats,
        customer,
        totalPrice: getTotalPrice(),
      });
      router.push(`/booking/confirmation?bookingId=${newBooking.id}`);
    } catch (err) {
      toast.error(
        'Reservation failed',
        err instanceof Error ? err.message : 'Could not submit booking. Please try again.',
      );
    }
  };

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="p-4 bg-card border border-border rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center space-x-2 text-xs font-bold">
            <span className={`px-3 py-1 rounded-full ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
              1. Seats
            </span>
            <span>→</span>
            <span className={`px-3 py-1 rounded-full ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
              2. Verify & Details
            </span>
            <span>→</span>
            <span className={`px-3 py-1 rounded-full ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
              3. Reserve
            </span>
          </div>
          <SeatHoldTimer />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {step === 1 && (
              <div className="p-6 bg-card border border-border rounded-3xl space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-4 gap-3">
                  <div>
                    <h2 className="text-xl font-extrabold">Select Your Seats</h2>
                    <p className="text-xs text-muted-foreground">
                      Maximum {maxTickets} tickets per person. {selectedSeats.length}/{maxTickets} selected.
                    </p>
                  </div>
                </div>

                <CinemaSeatMap
                  seats={seats}
                  aisleAfterByRow={
                    layoutScreen ? aisleAfterByRow(layoutScreen.rows) : undefined
                  }
                />

                <div className="flex justify-end pt-4 border-t border-border">
                  <button
                    disabled={selectedSeats.length === 0}
                    onClick={() => setStep(2)}
                    className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground font-bold text-sm rounded-xl shadow-lg shadow-primary/30 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <span>Continue ({selectedSeats.length} seats)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="p-8 bg-card border border-border rounded-3xl space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <h2 className="text-xl font-extrabold">Guest Details & Verification</h2>
                    <p className="text-xs text-muted-foreground">
                      Verify email or phone with a code before your reservation is created.
                    </p>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Seats
                  </button>
                </div>

                <form onSubmit={handleSubmit(handleGuestSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Full Name</label>
                    <input
                      {...register('fullName')}
                      className="w-full py-2.5 px-3 bg-secondary text-foreground text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {errors.fullName && <p className="text-xs text-primary mt-1">{errors.fullName.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold mb-1">Email Address</label>
                    <div className="flex gap-2">
                      <input
                        {...register('email')}
                        type="email"
                        className="flex-1 py-2.5 px-3 bg-secondary text-foreground text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const email = getValues('email');
                          if (!email || !email.includes('@')) {
                            toast.warning('Enter email', 'Add a valid email first.');
                            return;
                          }
                          setCustomer({ ...getValues(), email });
                          sendEmailCode();
                        }}
                        className="px-3 py-2 bg-secondary border border-border rounded-xl text-xs font-bold shrink-0"
                      >
                        Send code
                      </button>
                    </div>
                    {errors.email && <p className="text-xs text-primary mt-1">{errors.email.message}</p>}
                    {emailCodeSent && !emailVerified && (
                      <div className="space-y-2 pt-1">
                        <div className="flex gap-2">
                          <input
                            value={emailOtp}
                            onChange={(e) => setEmailOtp(e.target.value)}
                            placeholder="Enter email code"
                            className="flex-1 py-2 px-3 bg-secondary text-foreground text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <button
                            type="button"
                            onClick={() => verifyEmailCode(emailOtp || pendingEmailCode)}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold shadow hover:bg-primary/90 transition-all shrink-0"
                          >
                            Verify email
                          </button>
                        </div>
                        {pendingEmailCode && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/60 p-2 rounded-xl border border-border">
                            <span>OTP Code:</span>
                            <button
                              type="button"
                              onClick={() => {
                                setEmailOtp(pendingEmailCode);
                                verifyEmailCode(pendingEmailCode);
                              }}
                              className="font-mono font-bold text-primary bg-primary/10 hover:bg-primary/20 px-2 py-0.5 rounded border border-primary/20 transition-all"
                              title="Click to auto-verify"
                            >
                              {pendingEmailCode} (Click to verify)
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    {emailVerified && (
                      <p className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-1">
                        ✓ Email verified successfully
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold mb-1">Phone Number</label>
                    <div className="flex gap-2">
                      <input
                        {...register('phone')}
                        className="flex-1 py-2.5 px-3 bg-secondary text-foreground text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const phone = getValues('phone');
                          if (!phone || phone.length < 7) {
                            toast.warning('Enter phone', 'Add a valid phone first.');
                            return;
                          }
                          setCustomer({ ...getValues(), phone });
                          sendPhoneCode();
                        }}
                        className="px-3 py-2 bg-secondary border border-border rounded-xl text-xs font-bold shrink-0 hover:bg-secondary/80 transition-colors"
                      >
                        Send code
                      </button>
                    </div>
                    {errors.phone && <p className="text-xs text-primary mt-1">{errors.phone.message}</p>}
                    {phoneCodeSent && !phoneVerified && (
                      <div className="space-y-2 pt-1">
                        <div className="flex gap-2">
                          <input
                            value={phoneOtp}
                            onChange={(e) => setPhoneOtp(e.target.value)}
                            placeholder="Enter SMS code"
                            className="flex-1 py-2 px-3 bg-secondary text-foreground text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <button
                            type="button"
                            onClick={() => verifyPhoneCode(phoneOtp || pendingPhoneCode)}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold shadow hover:bg-primary/90 transition-all shrink-0"
                          >
                            Verify phone
                          </button>
                        </div>
                        {pendingPhoneCode && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/60 p-2 rounded-xl border border-border">
                            <span>OTP Code:</span>
                            <button
                              type="button"
                              onClick={() => {
                                setPhoneOtp(pendingPhoneCode);
                                verifyPhoneCode(pendingPhoneCode);
                              }}
                              className="font-mono font-bold text-primary bg-primary/10 hover:bg-primary/20 px-2 py-0.5 rounded border border-primary/20 transition-all"
                              title="Click to auto-verify"
                            >
                              {pendingPhoneCode} (Click to verify)
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    {phoneVerified && (
                      <p className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-1">
                        ✓ Phone verified successfully
                      </p>
                    )}
                  </div>

                  <p className="text-[11px] text-muted-foreground">
                    Verify at least one contact method (email or phone). Demo OTP codes appear in a toast after you send.
                  </p>

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-5 py-2.5 bg-secondary text-secondary-foreground font-semibold rounded-xl text-xs"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground font-bold text-sm rounded-xl shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all"
                    >
                      <span>Review Reservation</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {step === 3 && (
              <div className="p-8 bg-card border border-border rounded-3xl space-y-6">
                <div className="border-b border-border pb-4">
                  <h2 className="text-xl font-extrabold">Confirm Reservation</h2>
                  <p className="text-xs text-muted-foreground">
                    This creates an unconfirmed booking — not a ticket. You will get a ticket once it is paid.
                  </p>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="p-4 bg-secondary/50 rounded-2xl space-y-2">
                    <h4 className="font-extrabold text-base text-primary">{movie.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {cinemaName} • {formatDate(screening.date)} at {screening.startTime}
                    </p>
                  </div>

                  <div className="p-4 bg-secondary/50 rounded-2xl space-y-2">
                    <h5 className="font-bold text-xs uppercase text-muted-foreground">Selected Seats</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedSeats.map((seat) => (
                        <span key={seat.id} className="px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-lg">
                          Seat {seat.id} (${seat.price})
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-secondary/50 rounded-2xl space-y-1 text-xs">
                    <h5 className="font-bold text-muted-foreground uppercase">Customer</h5>
                    <p className="font-bold text-foreground">{customer.fullName}</p>
                    <p className="text-muted-foreground">{customer.email} • {customer.phone}</p>
                    <p className="text-emerald-600 font-semibold">
                      Verified via {[emailVerified && 'email', phoneVerified && 'phone'].filter(Boolean).join(' & ')}
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex justify-between items-center">
                  <button
                    onClick={() => setStep(2)}
                    className="px-5 py-2.5 bg-secondary text-secondary-foreground font-semibold rounded-xl text-xs"
                  >
                    Edit Info
                  </button>

                  <button
                    onClick={handleConfirmBooking}
                    className="flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground font-black text-sm rounded-xl shadow-xl shadow-primary/40 hover:bg-primary/90 hover:scale-[1.02] transition-all"
                  >
                    <ShieldCheck className="w-5 h-5" />
                    Submit Reservation
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-card border border-border rounded-3xl shadow-lg space-y-6 sticky top-24">
              <h3 className="font-extrabold text-lg border-b border-border pb-3">Reservation Summary</h3>

              <div className="flex gap-3">
                <div className="relative w-16 h-24 rounded-xl overflow-hidden bg-zinc-900 shrink-0 border border-border">
                  <Image src={movie.posterUrl} alt={movie.title} fill className="object-cover" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm line-clamp-1">{movie.title}</h4>
                  <p className="text-xs text-muted-foreground">{cinemaName}</p>
                  <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                    {formatDate(screening.date)} • {screening.startTime}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-border text-xs">
                <div className="flex justify-between font-semibold gap-2">
                  <span className="text-muted-foreground shrink-0">Seats ({selectedSeats.length}/{maxTickets})</span>
                  <span className="text-right">{selectedSeats.length > 0 ? selectedSeats.map((s) => s.id).join(', ') : 'None'}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground uppercase font-bold">Total</span>
                <span className="text-2xl font-black text-primary">{formatCurrency(getTotalPrice())}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
