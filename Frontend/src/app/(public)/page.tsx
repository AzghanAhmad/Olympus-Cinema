'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { HeroCarousel } from '@/components/movie/HeroCarousel';
import { TrailerModal } from '@/components/movie/TrailerModal';
import { PageTransition } from '@/components/motion/PageTransition';
import { AnimatedButton } from '@/components/motion/AnimatedButton';
import { movieService } from '@/services/movieService';
import { newsService } from '@/services/newsService';
import { screeningService } from '@/services/screeningService';
import { Movie } from '@/types/movie';
import { NewsArticle } from '@/types/content';
import { Screening } from '@/types/screening';
import { Calendar, ChevronRight, Ticket } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useSiteSettingsStore } from '@/store/useSiteSettingsStore';

export default function HomePage() {
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [featuredMovies, setFeaturedMovies] = useState<Movie[]>([]);
  const [openShows, setOpenShows] = useState<Screening[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const cinemaName = useSiteSettingsStore((s) => s.cinemaName);
  const brandName = useSiteSettingsStore((s) => s.brandName);
  const maxTickets = useSiteSettingsStore((s) => s.maxTicketsPerPerson);

  useEffect(() => {
    movieService.getFeatured().then((list) => {
      if (list.length) setFeaturedMovies(list);
      else movieService.getNowShowing().then(setFeaturedMovies);
    });
    screeningService.getScreenings().then((list) => setOpenShows(list.slice(0, 5)));
    newsService.getNews().then((list) => setNews(list.slice(0, 2)));
  }, []);

  const heroMovie = featuredMovies[0];

  return (
    <PublicLayout flushTop>
      <PageTransition>
        {featuredMovies.length > 0 && (
          <HeroCarousel movies={featuredMovies} onWatchTrailer={(url) => setTrailerUrl(url)} />
        )}

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-1">
                <Calendar className="w-4 h-4" />
                <span>Open Showtimes</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Book {heroMovie?.title ?? 'Now Showing'} Now
              </h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-xl">
                {brandName} presents live showtimes from the cinema schedule. Reserve up to {maxTickets} seats.
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
            {openShows.length === 0 ? (
              <p className="text-sm text-muted-foreground">No showtimes scheduled yet. Check back soon.</p>
            ) : (
              openShows.map((scr) => (
                <div
                  key={scr.id}
                  className="p-4 bg-card rounded-xl border border-border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative w-12 h-16 rounded-lg overflow-hidden bg-zinc-900 shrink-0">
                      <Image
                        src={scr.moviePoster || heroMovie?.posterUrl || '/images/majnoon-poster.jpg'}
                        alt={scr.movieTitle || heroMovie?.title || 'Movie'}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm">
                        {scr.movieTitle || heroMovie?.title || 'Now Showing'}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {scr.hallName || cinemaName} · {formatDate(scr.date)}
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
              ))
            )}
          </div>
        </section>

        {news.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-6">
            <h2 className="text-2xl font-extrabold">Latest Updates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {news.map((article) => (
                <article key={article.id} className="p-6 bg-card border border-border rounded-2xl space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    {article.category}
                  </span>
                  <h3 className="font-extrabold text-lg">{article.title}</h3>
                  <p className="text-sm text-muted-foreground">{article.summary}</p>
                  <Link href={`/news/${article.slug}`} className="text-xs font-bold text-primary hover:underline">
                    Read more →
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}

        <TrailerModal
          videoUrl={trailerUrl}
          onClose={() => setTrailerUrl(null)}
          title={heroMovie?.title ?? 'Trailer'}
        />
      </PageTransition>
    </PublicLayout>
  );
}
