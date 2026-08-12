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
import { screeningService } from '@/services/screeningService';
import { movieService } from '@/services/movieService';
import { bookingService } from '@/services/bookingService';
import { Seat, Screening } from '@/types/screening';
import { Movie } from '@/types/movie';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Check, ArrowRight, ArrowLeft, Ticket, Calendar, Clock, MapPin, User, ShieldCheck } from 'lucide-react';

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

  const {
    selectedSeats,
    customer,
    step,
    setStep,
    setCustomer,
    setScreeningAndMovie,
    getTotalPrice,
  } = useBookingStore();

  const {
    register,
    handleSubmit,
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

  if (loading || !screening || !movie) {
    return (
      <PublicLayout>
        <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm font-semibold">Loading Cinema Seat Map & Screening details...</p>
        </div>
      </PublicLayout>
    );
  }

  const handleGuestSubmit = (data: GuestFormData) => {
    setCustomer(data);
    setStep(3);
  };

  const handleConfirmBooking = async () => {
    const newBooking = await bookingService.createBooking({
      screeningId: screening.id,
      movieId: movie.id,
      movieTitle: movie.title,
      moviePoster: movie.posterUrl,
      hallName: screening.hallName,
      screenType: screening.screenType,
      date: screening.date,
      startTime: screening.startTime,
      seats: selectedSeats,
      customer,
      totalPrice: getTotalPrice(),
    });

    router.push(`/booking/confirmation?bookingId=${newBooking.id}`);
  };

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Step Indicator Header */}
        <div className="p-4 bg-card border border-border rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center space-x-2 text-xs font-bold">
            <span className={`px-3 py-1 rounded-full ${step >= 1 ? 'bg-primary text-white' : 'bg-secondary'}`}>
              1. Seat Map
            </span>
            <span>→</span>
            <span className={`px-3 py-1 rounded-full ${step >= 2 ? 'bg-primary text-white' : 'bg-secondary'}`}>
              2. Guest Info
            </span>
            <span>→</span>
            <span className={`px-3 py-1 rounded-full ${step >= 3 ? 'bg-primary text-white' : 'bg-secondary'}`}>
              3. Review & Confirm
            </span>
          </div>

          <SeatHoldTimer />
        </div>

        {/* Booking Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Interactive Container (Steps 1, 2, 3) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* STEP 1: Interactive Seat Map Selection */}
            {step === 1 && (
              <div className="p-6 bg-card border border-border rounded-3xl space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <h2 className="text-xl font-extrabold">Select Your Cinema Seats</h2>
                    <p className="text-xs text-muted-foreground">
                      Click available seats to add them to your reservation summary.
                    </p>
                  </div>
                </div>

                <CinemaSeatMap seats={seats} />

                <div className="flex justify-end pt-4 border-t border-border">
                  <button
                    disabled={selectedSeats.length === 0}
                    onClick={() => setStep(2)}
                    className="flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold text-sm rounded-xl shadow-lg shadow-primary/30 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <span>Proceed to Guest Info ({selectedSeats.length} seats)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Guest Details Form */}
            {step === 2 && (
              <div className="p-8 bg-card border border-border rounded-3xl space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <h2 className="text-xl font-extrabold">Contact & E-Ticket Details</h2>
                    <p className="text-xs text-muted-foreground">
                      Your digital QR ticket will be delivered to this email address.
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
                      placeholder="e.g. Alexander Wright"
                      className="w-full py-2.5 px-3 bg-secondary text-foreground text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {errors.fullName && <p className="text-xs text-primary mt-1">{errors.fullName.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">Email Address</label>
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="alexander@example.com"
                      className="w-full py-2.5 px-3 bg-secondary text-foreground text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {errors.email && <p className="text-xs text-primary mt-1">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">Phone Number</label>
                    <input
                      {...register('phone')}
                      placeholder="+1 (555) 000-0000"
                      className="w-full py-2.5 px-3 bg-secondary text-foreground text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {errors.phone && <p className="text-xs text-primary mt-1">{errors.phone.message}</p>}
                  </div>

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
                      className="flex items-center gap-2 px-8 py-3 bg-primary text-white font-bold text-sm rounded-xl shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all"
                    >
                      <span>Review Booking</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 3: Review & Final Confirmation */}
            {step === 3 && (
              <div className="p-8 bg-card border border-border rounded-3xl space-y-6">
                <div className="border-b border-border pb-4">
                  <h2 className="text-xl font-extrabold">Final Ticket Review</h2>
                  <p className="text-xs text-muted-foreground">
                    Please verify your film showtime, selected seats, and customer details before confirming.
                  </p>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="p-4 bg-secondary/50 rounded-2xl space-y-2">
                    <h4 className="font-extrabold text-base text-primary">{movie.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {screening.hallName} ({screening.screenType}) • {formatDate(screening.date)} at {screening.startTime}
                    </p>
                  </div>

                  <div className="p-4 bg-secondary/50 rounded-2xl space-y-2">
                    <h5 className="font-bold text-xs uppercase text-muted-foreground">Selected Seats</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedSeats.map((seat) => (
                        <span key={seat.id} className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-lg">
                          Seat {seat.id} (${seat.price})
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-secondary/50 rounded-2xl space-y-1 text-xs">
                    <h5 className="font-bold text-muted-foreground uppercase">Customer Details</h5>
                    <p className="font-bold text-foreground">{customer.fullName}</p>
                    <p className="text-muted-foreground">{customer.email} • {customer.phone}</p>
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
                    className="flex items-center gap-2 px-8 py-3.5 bg-primary text-white font-black text-sm rounded-xl shadow-xl shadow-primary/40 hover:bg-primary/90 hover:scale-[1.02] transition-all"
                  >
                    <ShieldCheck className="w-5 h-5" />
                    Confirm Cinema Reservation
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Booking Summary Card Sidebar */}
          <div className="space-y-6">
            <div className="p-6 bg-card border border-border rounded-3xl shadow-lg space-y-6 sticky top-24">
              <h3 className="font-extrabold text-lg border-b border-border pb-3">Booking Summary</h3>

              {/* Movie Mini Card */}
              <div className="flex gap-3">
                <div className="relative w-16 h-24 rounded-xl overflow-hidden bg-zinc-900 shrink-0 border border-border">
                  <Image src={movie.posterUrl} alt={movie.title} fill className="object-cover" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm line-clamp-1">{movie.title}</h4>
                  <p className="text-xs text-muted-foreground">{screening.hallName}</p>
                  <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                    {screening.startTime} • {screening.screenType}
                  </span>
                </div>
              </div>

              {/* Seats Breakdown */}
              <div className="space-y-2 pt-2 border-t border-border text-xs">
                <div className="flex justify-between font-semibold">
                  <span className="text-muted-foreground">Selected Seats</span>
                  <span>{selectedSeats.length > 0 ? selectedSeats.map((s) => s.id).join(', ') : 'None'}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-muted-foreground">Format</span>
                  <span>{screening.screenType}</span>
                </div>
              </div>

              {/* Total Price */}
              <div className="pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground uppercase font-bold">Total Price</span>
                <span className="text-2xl font-black text-primary">
                  {formatCurrency(getTotalPrice())}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
