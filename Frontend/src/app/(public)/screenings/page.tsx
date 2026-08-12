'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { MOCK_SCREENINGS, MOCK_HALLS } from '@/data/screenings';
import { MOCK_MOVIES } from '@/data/movies';
import { Calendar as CalendarIcon, Clock, Filter, Film } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function ScreeningsPage() {
  const [selectedHall, setSelectedHall] = useState<string>('ALL');

  const filteredScreenings = MOCK_SCREENINGS.filter((scr) => {
    return selectedHall === 'ALL' || scr.hallId === selectedHall;
  });

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">Cinema Screening Timetable</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Select your preferred auditorium, format, and showtime to begin booking.
            </p>
          </div>

          {/* Hall Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={selectedHall}
              onChange={(e) => setSelectedHall(e.target.value)}
              className="py-2 px-3 bg-card text-foreground text-sm font-medium rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="ALL">All Auditoriums & Halls</option>
              {MOCK_HALLS.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.screenType})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Screenings Grid */}
        <div className="space-y-4">
          {filteredScreenings.map((scr) => {
            const movie = MOCK_MOVIES.find((m) => m.id === scr.movieId);
            if (!movie) return null;

            return (
              <div
                key={scr.id}
                className="p-5 bg-card border border-border rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm hover:border-primary/50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-24 rounded-xl overflow-hidden bg-zinc-900 shrink-0 border border-border">
                    <Image src={movie.posterUrl} alt={movie.title} fill className="object-cover" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                      {scr.screenType}
                    </span>
                    <h3 className="font-extrabold text-lg">{movie.title}</h3>
                    <p className="text-xs text-muted-foreground">{scr.hallName}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        {formatDate(scr.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {scr.startTime} - {scr.endTime}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-border">
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground block">Available Seats</span>
                    <span className="font-extrabold text-sm text-foreground">
                      {scr.availableSeatsCount} / {scr.totalSeatsCount}
                    </span>
                  </div>
                  <Link
                    href={`/booking/${scr.id}`}
                    className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                  >
                    Select Seats
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PublicLayout>
  );
}
