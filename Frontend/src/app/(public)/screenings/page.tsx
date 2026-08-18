'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { movieService } from '@/services/movieService';
import { screeningService } from '@/services/screeningService';
import { Movie } from '@/types/movie';
import { Screening } from '@/types/screening';
import { formatDate } from '@/lib/utils';
import { useSiteSettingsStore } from '@/store/useSiteSettingsStore';
import { Ticket } from 'lucide-react';

export default function ScreeningsPage() {
  const cinemaName = useSiteSettingsStore((s) => s.cinemaName);
  const maxTickets = useSiteSettingsStore((s) => s.maxTicketsPerPerson);
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const majnoon = await movieService.getMovieBySlug('majnoon');
      const moviesList = majnoon ? [majnoon] : await movieService.getNowShowing();
      setMovies(moviesList.length ? moviesList : await movieService.getMovies());

      const shows = majnoon
        ? await screeningService.getScreeningsByMovieId(majnoon.id)
        : await screeningService.getScreenings();
      setScreenings(shows);
      setLoading(false);
    }
    load();
  }, []);

  const defaultMovie = movies[0];

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Majnoon Showtimes</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {cinemaName} · Pick any open Majnoon show and reserve up to {maxTickets} seats. Booking is confirmed after payment.
          </p>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading showtimes…</p>
        ) : screenings.length === 0 ? (
          <div className="p-8 text-center bg-card border border-border rounded-2xl text-sm text-muted-foreground">
            No showtimes scheduled yet. Add screenings in the admin panel to see them here.
          </div>
        ) : (
          <div className="space-y-4">
            {screenings.map((scr) => {
              const movie =
                movies.find((m) => m.id === scr.movieId) || defaultMovie;
              const poster = scr.moviePoster || movie?.posterUrl || '/images/majnoon-poster.jpg';
              const title = scr.movieTitle || movie?.title || 'Now Showing';

              return (
                <div
                  key={scr.id}
                  className="p-6 bg-card border border-border rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm"
                >
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative w-16 h-24 rounded-xl overflow-hidden bg-zinc-900 shrink-0 border border-border">
                      <Image src={poster} alt={title} fill className="object-cover" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg">{title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{scr.hallName || cinemaName}</p>
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
              );
            })}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
