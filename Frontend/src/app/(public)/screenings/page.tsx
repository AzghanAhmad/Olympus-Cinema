'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { MOCK_SCREENINGS } from '@/data/screenings';
import { MAJUNOON } from '@/data/movies';
import { formatDate } from '@/lib/utils';
import { useSiteSettingsStore } from '@/store/useSiteSettingsStore';
import { Ticket } from 'lucide-react';

export default function ScreeningsPage() {
  const cinemaName = useSiteSettingsStore((s) => s.cinemaName);
  const maxTickets = useSiteSettingsStore((s) => s.maxTicketsPerPerson);

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Majunoon Showtimes</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {cinemaName} Cinema · Pick any open show and reserve up to {maxTickets} seats. Booking is confirmed after payment.
          </p>
        </div>

        <div className="space-y-4">
          {MOCK_SCREENINGS.map((scr) => (
            <div
              key={scr.id}
              className="p-6 bg-card border border-border rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm"
            >
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative w-16 h-24 rounded-xl overflow-hidden bg-zinc-900 shrink-0 border border-border">
                  <Image src={MAJUNOON.posterUrl} alt={MAJUNOON.title} fill className="object-cover" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg">{MAJUNOON.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{cinemaName} Cinema</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                    <span>{formatDate(scr.date)}</span>
                    <span className="font-bold text-foreground">{scr.startTime}</span>
                    <span>{scr.availableSeatsCount} available</span>
                  </div>
                </div>
              </div>

              <Link
                href={`/booking/${scr.id}`}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-lg shadow-primary/30 hover:bg-primary/90 shrink-0"
              >
                <Ticket className="w-4 h-4" />
                Reserve seats
              </Link>
            </div>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}
