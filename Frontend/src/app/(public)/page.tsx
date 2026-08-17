'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { HeroCarousel } from '@/components/movie/HeroCarousel';
import { TrailerModal } from '@/components/movie/TrailerModal';
import { PageTransition } from '@/components/motion/PageTransition';
import { AnimatedButton } from '@/components/motion/AnimatedButton';
import { MAJNOON } from '@/data/movies';
import { MOCK_NEWS } from '@/data/content';
import { screeningService } from '@/services/screeningService';
import { Screening } from '@/types/screening';
import { Calendar, ChevronRight, Ticket } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useSiteSettingsStore } from '@/store/useSiteSettingsStore';

export default function HomePage() {
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [openShows, setOpenShows] = useState<Screening[]>([]);
  const cinemaName = useSiteSettingsStore((s) => s.cinemaName);
  const brandName = useSiteSettingsStore((s) => s.brandName);
  const maxTickets = useSiteSettingsStore((s) => s.maxTicketsPerPerson);

  useEffect(() => {
    screeningService.getScreenings().then((list) => setOpenShows(list.slice(0, 5)));
  }, []);

  return (
    <PublicLayout flushTop>
      <PageTransition>
        <HeroCarousel movies={[MAJNOON]} onWatchTrailer={(url) => setTrailerUrl(url)} />

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-1">
                <Calendar className="w-4 h-4" />
                <span>Open Showtimes</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Book Majnoon Now</h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-xl">
                {brandName} presents Majnoon. Choose any open show and reserve up to {maxTickets} seats.
                Reservations are confirmed after payment.
              </p>
            </div>
            <Link href="/screenings">
              <AnimatedButton variant="ghost" size="sm" className="gap-1.5 text-primary">
                <span>All showtimes</span>
                <ChevronRight className="w-4 h-4" />
              </AnimatedButton>
            </Link>
          </div>

          <div className="space-y-3">
            {openShows.map((scr) => (
              <div
                key={scr.id}
                className="p-4 bg-card rounded-xl border border-border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="relative w-12 h-16 rounded-lg overflow-hidden bg-zinc-900 shrink-0">
                    <Image src={MAJNOON.posterUrl} alt={MAJNOON.title} fill className="object-cover" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm">{MAJNOON.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {cinemaName} · {formatDate(scr.date)}
                    </p>
                    <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                      {scr.startTime} · {scr.availableSeatsCount} seats left
                    </span>
                  </div>
                </div>
                <Link href={`/booking/${scr.id}`}>
                  <AnimatedButton variant="primary" size="sm" className="gap-1.5">
                    <Ticket className="w-3.5 h-3.5" />
                    Reserve seats
                  </AnimatedButton>
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-6">
          <h2 className="text-2xl font-extrabold">Latest Updates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MOCK_NEWS.map((article) => (
              <article key={article.id} className="p-6 bg-card border border-border rounded-2xl space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{article.category}</span>
                <h3 className="font-extrabold text-lg">{article.title}</h3>
                <p className="text-sm text-muted-foreground">{article.summary}</p>
              </article>
            ))}
          </div>
        </section>

        <TrailerModal videoUrl={trailerUrl} onClose={() => setTrailerUrl(null)} title="Majnoon" />
      </PageTransition>
    </PublicLayout>
  );
}
