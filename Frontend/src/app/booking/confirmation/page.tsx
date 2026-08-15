'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { bookingService } from '@/services/bookingService';
import { Booking } from '@/types/booking';
import { CheckCircle2, Printer, Home, ClipboardList } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

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

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-lg shadow-primary/20">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black tracking-tight">Reservation Submitted</h1>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          Booking will be confirmed once the payment is done.
        </p>
        <p className="text-sm font-semibold text-foreground max-w-lg mx-auto bg-secondary/60 border border-border rounded-2xl px-4 py-3">
          We will contact as soon as the reservation is confirmed.
        </p>
      </div>

      <div id="printable-reservation" className="bg-card border-2 border-border rounded-3xl overflow-hidden shadow-2xl divide-y divide-border">
        <div className="p-6 bg-gradient-to-r from-primary to-rose-700 text-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <ClipboardList className="w-6 h-6 shrink-0" />
            <span className="font-extrabold text-lg tracking-wider truncate">
              {booking.movieTitle.toUpperCase()} RESERVATION
            </span>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 bg-black/30 rounded-full shrink-0">
            {booking.bookingCode}
          </span>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div>
              <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Movie</span>
              <h2 className="text-2xl font-black text-foreground mt-0.5">{booking.movieTitle}</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground block">Cinema</span>
                <strong className="text-foreground text-sm">{booking.hallName}</strong>
              </div>
              <div>
                <span className="text-muted-foreground block">Status</span>
                <strong className="text-amber-600 dark:text-amber-400 text-sm">Unconfirmed · Awaiting payment</strong>
              </div>
              <div>
                <span className="text-muted-foreground block">Date & Time</span>
                <strong className="text-foreground text-sm">
                  {formatDate(booking.date)} at {booking.startTime}
                </strong>
              </div>
              <div>
                <span className="text-muted-foreground block">Selected Seats</span>
                <strong className="text-primary text-sm font-black">
                  {booking.seats.map((s) => s.id).join(', ')}
                </strong>
              </div>
              <div>
                <span className="text-muted-foreground block">Total</span>
                <strong className="text-foreground text-sm">{formatCurrency(booking.totalPrice)}</strong>
              </div>
            </div>

            <div className="pt-2 text-xs border-t border-border">
              <span className="text-muted-foreground">Guest: </span>
              <strong className="text-foreground">{booking.customer.fullName}</strong> ({booking.customer.email})
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              The QR code is a reservation reference only — it is not an entry ticket. Your ticket will be issued once payment is completed.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-zinc-200 space-y-2">
            <QRCodeSVG value={booking.qrCodeValue} size={140} />
            <span className="text-[10px] font-mono text-zinc-600 font-bold tracking-widest uppercase">
              Reservation Ref
            </span>
            <span className="text-[10px] font-mono text-zinc-500">{booking.bookingCode}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground font-bold rounded-xl text-xs hover:bg-secondary/80 transition-colors border border-border"
        >
          <Printer className="w-4 h-4" />
          Reservation
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
