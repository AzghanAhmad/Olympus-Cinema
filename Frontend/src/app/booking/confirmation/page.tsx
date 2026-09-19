'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { bookingService } from '@/services/bookingService';
import { Booking } from '@/types/booking';
import { CheckCircle2, Printer, Home, ClipboardList } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

function BarcodeSvg({ code }: { code: string }) {
  // Generate deterministic barcode bar widths based on code characters
  const bars: { width: number; isGap: boolean }[] = [];
  bars.push({ width: 3, isGap: false });
  bars.push({ width: 2, isGap: true });
  bars.push({ width: 2, isGap: false });
  bars.push({ width: 2, isGap: true });

  for (let i = 0; i < code.length; i++) {
    const charCode = code.charCodeAt(i);
    const w1 = (charCode % 3) + 1.5;
    const g1 = ((charCode >> 1) % 2) + 1.2;
    const w2 = ((charCode >> 2) % 3) + 1.2;
    const g2 = ((charCode >> 3) % 2) + 1.2;
    bars.push({ width: w1, isGap: false });
    bars.push({ width: g1, isGap: true });
    bars.push({ width: w2, isGap: false });
    bars.push({ width: g2, isGap: true });
  }

  bars.push({ width: 2, isGap: false });
  bars.push({ width: 2, isGap: true });
  bars.push({ width: 3, isGap: false });

  let currentX = 10;
  const elements = bars.map((bar, idx) => {
    const x = currentX;
    currentX += bar.width + 1.5;
    if (bar.isGap) return null;
    return (
      <rect
        key={idx}
        x={x}
        y="0"
        width={bar.width}
        height="54"
        fill="#111827"
        rx="0.5"
      />
    );
  });

  return (
    <div className="w-full flex flex-col items-center">
      <svg
        viewBox={`0 0 ${Math.max(currentX + 10, 260)} 56`}
        className="w-full max-w-[260px] h-14"
        preserveAspectRatio="xMidYMid meet"
      >
        {elements}
      </svg>
      <span className="font-mono text-xs sm:text-sm font-black tracking-[0.25em] text-black !text-black dark:text-black mt-1.5 uppercase select-all">
        {code}
      </span>
    </div>
  );
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    async function loadBooking() {
      if (bookingId) {
        const b = await bookingService.getBookingById(bookingId);
        setBooking(b);
      }
    }
    loadBooking();
  }, [bookingId]);

  if (!booking) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground text-sm font-semibold">Preparing your reservation...</p>
      </div>
    );
  }

  const isConfirmed = booking.status === 'CONFIRMED';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Top watermark / branding right-aligned as requested */}
      <div className="flex justify-end items-center text-xs font-bold tracking-wider text-muted-foreground uppercase pb-1 border-b border-border/50">
        <span>Majnoon | Crystal Entertainment</span>
      </div>

      <div className="no-print text-center space-y-3">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-lg ${
          isConfirmed ? 'bg-emerald-500/10 text-emerald-500 shadow-emerald-500/20' : 'bg-primary/10 text-primary shadow-primary/20'
        }`}>
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black tracking-tight">
          {isConfirmed ? 'Booking Confirmed' : 'Reservation Submitted'}
        </h1>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          {isConfirmed
            ? 'Your booking has been confirmed. Your tickets are ready.'
            : 'Booking will be confirmed once the payment is done.'}
        </p>
        {isConfirmed ? (
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 max-w-lg mx-auto bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-4 py-3">
            Payment received — present your ticket barcode at the cinema entrance.
          </p>
        ) : (
          <>
            <p className="text-sm font-semibold text-foreground max-w-lg mx-auto bg-secondary/60 border border-border rounded-2xl px-4 py-3">
              we will contact as soon as the reservation is confirmed
            </p>
            <p className="text-xs text-muted-foreground max-w-lg mx-auto">
              This is an unconfirmed booking — not a ticket. You will get your ticket once it is paid.
            </p>
          </>
        )}
      </div>

      {/* Ticket / Reservation Card */}
      <div
        id="printable-reservation"
        className="bg-card border-2 border-border rounded-3xl overflow-hidden shadow-2xl divide-y divide-border print:border-zinc-300 print:shadow-none"
      >
        {/* Header with Title and Right Brand */}
        <div className={`p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isConfirmed ? 'bg-gradient-to-r from-emerald-600 to-emerald-800' : 'bg-gradient-to-r from-primary to-rose-700'
        }`}>
          <div className="flex items-center gap-2 min-w-0">
            <ClipboardList className="w-6 h-6 shrink-0" />
            <span className="font-extrabold text-lg sm:text-xl tracking-wider truncate uppercase">
              {booking.movieTitle} {isConfirmed ? 'TICKET' : 'RESERVATION'}
            </span>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <span className="text-[11px] font-semibold text-white/80 hidden sm:inline">
              Majnoon | Crystal Entertainment
            </span>
            <span className="text-xs font-mono font-bold px-3 py-1 bg-black/40 text-white rounded-full border border-white/20">
              {booking.bookingCode}
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div>
              <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Movie</span>
              <h2 className="text-2xl font-black text-foreground mt-0.5">{booking.movieTitle}</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-secondary/50 rounded-xl">
                <span className="text-muted-foreground block text-[11px] font-medium">Cinema</span>
                <strong className="text-foreground text-sm font-bold">{booking.hallName}</strong>
              </div>
              <div className="p-3 bg-secondary/50 rounded-xl">
                <span className="text-muted-foreground block text-[11px] font-medium">Status</span>
                {isConfirmed ? (
                  <strong className="text-emerald-600 dark:text-emerald-400 text-sm font-bold">Confirmed</strong>
                ) : (
                  <strong className="text-amber-600 dark:text-amber-400 text-sm font-bold">Unconfirmed booking</strong>
                )}
              </div>
              <div className="p-3 bg-secondary/50 rounded-xl">
                <span className="text-muted-foreground block text-[11px] font-medium">Date & Time</span>
                <strong className="text-foreground text-sm font-bold">
                  {formatDate(booking.date)} at {booking.startTime}
                </strong>
              </div>
              <div className="p-3 bg-secondary/50 rounded-xl">
                <span className="text-muted-foreground block text-[11px] font-medium">Selected Seats</span>
                <strong className="text-primary text-sm font-black">
                  {booking.seats.map((s) => s.label || s.id).join(', ')}
                </strong>
              </div>
            </div>

            <div className="pt-2 text-xs border-t border-border flex flex-col gap-1">
              <div>
                <span className="text-muted-foreground">Guest: </span>
                <strong className="text-foreground font-bold">{booking.customer.fullName}</strong>
                <span className="text-muted-foreground"> ({booking.customer.email}{booking.customer.phone ? ` • ${booking.customer.phone}` : ''})</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
                {isConfirmed
                  ? 'Present this entry barcode at the cinema entrance. Each seat has its own ticket.'
                  : 'This barcode is only an unconfirmed booking reference. It is not a ticket. The person will get a ticket once it is paid.'}
              </p>
            </div>
          </div>

          {/* Barcode side ticket stub */}
          <div className="flex flex-col items-center justify-between p-6 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 space-y-4">
            <div className="text-center w-full">
              <span className="text-[10px] font-extrabold tracking-widest uppercase text-muted-foreground block">
                {isConfirmed ? 'Official Entry Ticket' : 'Booking Reference'}
              </span>
              <span className="text-xs font-bold text-primary block mt-0.5">
                {booking.seats.length} {booking.seats.length === 1 ? 'Seat' : 'Seats'}
              </span>
            </div>

            {/* High fidelity Barcode */}
            <div className="w-full bg-white p-3.5 rounded-xl border border-zinc-200 shadow-inner flex flex-col items-center">
              <BarcodeSvg code={booking.bookingCode} />
            </div>

            <div className="w-full border-t border-zinc-200 dark:border-zinc-800 pt-2 text-center">
              <span className="text-[10px] text-zinc-500 font-medium block">
                Majnoon | Crystal Entertainment
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="no-print flex flex-wrap items-center justify-center gap-4 pt-4">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground font-bold rounded-xl text-xs hover:bg-secondary/80 transition-colors border border-border"
        >
          <Printer className="w-4 h-4" />
          Save / Print E-Ticket
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl text-xs hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <PublicLayout>
      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 py-24 text-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        }
      >
        <ConfirmationContent />
      </Suspense>
    </PublicLayout>
  );
}
