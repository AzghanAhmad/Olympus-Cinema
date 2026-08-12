'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { MOCK_BOOKINGS } from '@/data/content';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Ticket } from 'lucide-react';

export default function UserBookingsPage() {
  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Booking History</h1>
          <p className="text-muted-foreground text-sm mt-1">
            View all active, past, and completed cinema ticket reservations.
          </p>
        </div>

        <div className="space-y-4">
          {MOCK_BOOKINGS.map((bk) => (
            <div key={bk.id} className="p-6 bg-card border border-border rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-24 rounded-xl overflow-hidden bg-zinc-900 shrink-0 border border-border">
                  <Image src={bk.moviePoster} alt={bk.movieTitle} fill className="object-cover" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{bk.bookingCode}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${bk.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-400'}`}>
                      {bk.status}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base">{bk.movieTitle}</h3>
                  <p className="text-xs text-muted-foreground">{bk.hallName} • {bk.screenType}</p>
                  <p className="text-xs text-muted-foreground">
                    Seats: <strong>{bk.seats.map((s) => s.id).join(', ')}</strong> • Total: <strong>{formatCurrency(bk.totalPrice)}</strong>
                  </p>
                </div>
              </div>

              <Link
                href={`/booking/confirmation?bookingId=${bk.id}`}
                className="px-5 py-2.5 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary/90 transition-colors shrink-0"
              >
                View Digital Ticket
              </Link>
            </div>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}
