'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { HeroCarousel } from '@/components/movie/HeroCarousel';
import { MovieCard } from '@/components/movie/MovieCard';
import { TrailerModal } from '@/components/movie/TrailerModal';
import { StaggerGrid, StaggerItem } from '@/components/motion/StaggerGrid';
import { PageTransition } from '@/components/motion/PageTransition';
import { AnimatedButton } from '@/components/motion/AnimatedButton';
import { MOCK_MOVIES } from '@/data/movies';
import { MOCK_EVENTS, MOCK_NEWS } from '@/data/content';
import { MOCK_SCREENINGS } from '@/data/screenings';
import { Play, Calendar, Sparkles, ChevronRight, Award, Armchair, Flame } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function HomePage() {
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);

  const featuredMovies = MOCK_MOVIES.filter((m) => m.isFeatured);
  const nowShowing = MOCK_MOVIES.filter((m) => m.status === 'NOW_SHOWING');
  const comingSoon = MOCK_MOVIES.filter((m) => m.status === 'COMING_SOON');

  return (
    <PublicLayout flushTop>
      <PageTransition>
        {/* 1. Hero Carousel */}
        <HeroCarousel movies={featuredMovies} onWatchTrailer={(url) => setTrailerUrl(url)} />

        {/* 2. Now Showing Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-1">
                <Flame className="w-4 h-4" />
                <span>In Theaters Today</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Now Showing</h2>
            </div>
            <Link href="/movies">
              <AnimatedButton variant="ghost" size="sm" className="gap-1.5 text-primary">
                <span>View All Movies</span>
                <ChevronRight className="w-4 h-4" />
              </AnimatedButton>
            </Link>
          </div>

          <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {nowShowing.map((movie) => (
              <StaggerItem key={movie.id}>
                <MovieCard movie={movie} onWatchTrailer={(url) => setTrailerUrl(url)} />
              </StaggerItem>
            ))}
          </StaggerGrid>
        </section>

        {/* 3. Upcoming Screenings Matrix Bar */}
        <section className="bg-secondary/40 border-y border-border py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span>Today's Showtime Matrix</span>
              </h3>
              <Link href="/screenings" className="text-xs font-semibold text-primary hover:underline">
                Full Timetable →
              </Link>
            </div>

            <StaggerGrid className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {MOCK_SCREENINGS.slice(0, 3).map((scr) => {
                const movie = MOCK_MOVIES.find((m) => m.id === scr.movieId);
                if (!movie) return null;
                return (
                  <StaggerItem key={scr.id}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="p-4 bg-card rounded-xl border border-border flex items-center justify-between gap-4 shadow-sm hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-16 rounded overflow-hidden shrink-0 bg-zinc-800">
                          <Image src={movie.posterUrl} alt={movie.title} fill className="object-cover" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm line-clamp-1">{movie.title}</h4>
                          <p className="text-xs text-muted-foreground">{scr.hallName}</p>
                          <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                            {scr.startTime} • {scr.screenType}
                          </span>
                        </div>
                      </div>
                      <Link href={`/booking/${scr.id}`}>
                        <AnimatedButton variant="primary" size="sm">
                          Select Seats
                        </AnimatedButton>
                      </Link>
                    </motion.div>
                  </StaggerItem>
                );
              })}
            </StaggerGrid>
          </div>
        </section>

        {/* 4. Coming Soon Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Upcoming Blockbusters
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight mt-1">Coming Soon</h2>
            </div>
            <Link href="/movies?filter=coming-soon" className="text-sm font-bold text-primary hover:underline">
              See Release Calendar →
            </Link>
          </div>

          <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {comingSoon.map((movie) => (
              <StaggerItem key={movie.id}>
                <MovieCard movie={movie} onWatchTrailer={(url) => setTrailerUrl(url)} />
              </StaggerItem>
            ))}
          </StaggerGrid>
        </section>

        {/* 5. Featured Special Event Banner */}
        {MOCK_EVENTS[0] && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8">
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="relative rounded-3xl overflow-hidden bg-black text-white border border-zinc-800 shadow-2xl p-8 sm:p-12"
            >
              <Image
                src={MOCK_EVENTS[0].imageUrl}
                alt={MOCK_EVENTS[0].title}
                fill
                className="object-cover opacity-40"
              />
              <div className="relative z-10 max-w-xl space-y-4">
                <span className="px-3 py-1 bg-primary text-white text-xs font-bold uppercase rounded-full tracking-wider">
                  Special Cinema Event
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold">{MOCK_EVENTS[0].title}</h2>
                <p className="text-zinc-300 text-sm">{MOCK_EVENTS[0].description}</p>
                <div className="flex items-center gap-4 pt-2">
                  <Link href={`/events/${MOCK_EVENTS[0].slug}`}>
                    <AnimatedButton variant="primary" size="lg">
                      {MOCK_EVENTS[0].ctaText}
                    </AnimatedButton>
                  </Link>
                </div>
              </div>
            </motion.div>
          </section>
        )}

        {/* 6. Premium Experience Highlights */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-primary uppercase tracking-widest">
              Unrivaled Presentation
            </span>
            <h2 className="text-3xl font-extrabold">The Olympus Cinema Experience</h2>
            <p className="text-muted-foreground text-sm">
              We combine ultra-crisp laser projection, 360-degree immersive sound, and supreme luxury.
            </p>
          </div>

          <StaggerGrid className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StaggerItem className="h-full">
              <div className="p-8 rounded-3xl bg-card border border-border space-y-4 h-full flex flex-col justify-start shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-xl">IMAX Dual 4K Laser</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Vast crystal-clear pictures with unparalleled brightness, contrast, and color fidelity on 80ft screens.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem className="h-full">
              <div className="p-8 rounded-3xl bg-card border border-border space-y-4 h-full flex flex-col justify-start shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-xl">Dolby Atmos Spatial Audio</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Moving audio that flows all around you with 128 individual audio channels for complete immersion.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem className="h-full">
              <div className="p-8 rounded-3xl bg-card border border-border space-y-4 h-full flex flex-col justify-start shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Armchair className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-xl">Recliner Lounge Seating</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Motorized leather recliners with personal swivel tables, seat heaters, and direct seat-side dining service.
                </p>
              </div>
            </StaggerItem>
          </StaggerGrid>
        </section>

        {/* 7. Latest Cinema News */}
        <section className="bg-secondary/30 py-16 border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-extrabold">Cinema News & Updates</h2>
              <Link href="/news" className="text-sm font-bold text-primary hover:underline">
                Read All News →
              </Link>
            </div>

            <StaggerGrid className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {MOCK_NEWS.map((article) => (
                <StaggerItem key={article.id}>
                  <div className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col justify-between h-full">
                    <div className="relative aspect-video w-full">
                      <Image src={article.imageUrl} alt={article.title} fill className="object-cover" />
                    </div>
                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                          {article.category}
                        </span>
                        <h3 className="font-extrabold text-base line-clamp-2 mt-1">{article.title}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-2">{article.summary}</p>
                      </div>
                      <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatDate(article.publishedAt)}</span>
                        <Link href={`/news/${article.slug}`} className="font-bold text-primary hover:underline">
                          Read Article
                        </Link>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGrid>
          </div>
        </section>

        {/* Trailer Modal */}
        <TrailerModal videoUrl={trailerUrl} onClose={() => setTrailerUrl(null)} />
      </PageTransition>
    </PublicLayout>
  );
}
