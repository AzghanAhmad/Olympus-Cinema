'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { TrailerModal } from '@/components/movie/TrailerModal';
import { movieService } from '@/services/movieService';
import { screeningService } from '@/services/screeningService';
import { Movie } from '@/types/movie';
import { Screening } from '@/types/screening';
import { Play, Ticket, Star, Clock, User, Image as ImageIcon } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useSiteSettingsStore } from '@/store/useSiteSettingsStore';

export default function MovieDetailsPage() {
  const params = useParams();
  const slug = params.slug as string;
  const cinemaName = useSiteSettingsStore((s) => s.cinemaName);

  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [screenings, setScreenings] = useState<Screening[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const m = await movieService.getMovieBySlug(slug);
      setMovie(m);
      if (m) {
        const shows = await screeningService.getScreeningsByMovieId(m.id);
        setScreenings(shows);
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="max-w-7xl mx-auto px-4 py-32 text-center text-sm text-muted-foreground">
          Loading film details…
        </div>
      </PublicLayout>
    );
  }

  if (!movie) {
    return (
      <PublicLayout>
        <div className="max-w-7xl mx-auto px-4 py-32 text-center space-y-4">
          <h1 className="text-3xl font-extrabold">Movie Not Found</h1>
          <p className="text-muted-foreground">The requested film could not be loaded from the cinema catalog.</p>
          <Link href="/screenings" className="inline-block px-6 py-2.5 bg-primary text-white font-bold rounded-xl">
            View showtimes
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const backdrop = movie.backdropUrl || '/images/majnoon-backdrop.jpeg';
  const poster = movie.posterUrl || '/images/majnoon-poster.jpg';

  return (
    <PublicLayout flushTop>
      <div className="relative w-full h-[65vh] min-h-[450px] bg-black text-white">
        <img
          src={backdrop}
          alt={movie.title}
          className="absolute inset-0 h-full w-full object-cover object-top"
          suppressHydrationWarning
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/25" />

        <div className="relative z-10 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-end pb-12">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-8 w-full">
            <div className="relative w-48 sm:w-56 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10 shrink-0 hidden md:block bg-zinc-900">
              <img src={poster} alt={movie.title} className="absolute inset-0 h-full w-full object-cover object-center" />
            </div>

            <div className="space-y-4 text-center md:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 text-xs">
                <span className="px-3 py-1 bg-primary text-white font-extrabold rounded-full tracking-wider">
                  {movie.status === 'NOW_SHOWING' ? 'Now Showing' : 'Coming Soon'}
                </span>
                <span className="px-2.5 py-0.5 bg-white/20 backdrop-blur-md rounded font-bold">{movie.ageRating}</span>
                <div className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{movie.rating} / 10</span>
                </div>
                <div className="flex items-center gap-1 text-zinc-300">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{movie.durationMinutes} minutes</span>
                </div>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight drop-shadow-md">{movie.title}</h1>

              {movie.tagline && (
                <p className="text-base italic text-zinc-300 font-medium">&ldquo;{movie.tagline}&rdquo;</p>
              )}

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                {movie.trailerUrl && (
                  <button
                    onClick={() => setTrailerUrl(movie.trailerUrl)}
                    className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md text-white font-bold rounded-xl border border-white/20 hover:bg-white/20 transition-all"
                  >
                    <Play className="w-5 h-5 fill-white" />
                    Watch Trailer
                  </button>
                )}
                <a
                  href="#screenings"
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/40 hover:bg-primary/90 transition-all"
                >
                  <Ticket className="w-5 h-5" />
                  Reserve Seats
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-extrabold">Synopsis</h2>
            <p className="text-muted-foreground text-base leading-relaxed">{movie.synopsis}</p>

            {movie.cast.length > 0 && (
              <div className="space-y-4 pt-4">
                <h3 className="text-xl font-extrabold flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  <span>Cast & Characters</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {movie.cast.map((actor) => (
                    <div
                      key={actor.id}
                      className="p-3 bg-card border border-border rounded-xl flex flex-col items-center text-center space-y-2"
                    >
                      <div className="relative w-16 h-16 rounded-full overflow-hidden bg-zinc-800 border border-border">
                        <Image src={actor.image} alt={actor.name} fill className="object-cover" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs line-clamp-1">{actor.name}</h4>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">{actor.character}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {movie.gallery.length > 0 && (
              <div className="space-y-4 pt-4">
                <h3 className="text-xl font-extrabold flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-primary" />
                  <span>Stills & Photo Gallery</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {movie.gallery.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedPhoto(imgUrl)}
                      className="relative aspect-video rounded-xl overflow-hidden border border-border cursor-pointer group bg-zinc-900"
                    >
                      <Image src={imgUrl} alt="Movie still" fill className="object-cover group-hover:scale-105 transition-transform" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-6 bg-card border border-border rounded-2xl space-y-6 h-fit">
            <h3 className="text-lg font-extrabold pb-3 border-b border-border">Film Details</h3>
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-xs text-muted-foreground block">Release Date</span>
                <span className="font-semibold">{formatDate(movie.releaseDate)}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Genre</span>
                <span className="font-semibold">{movie.genre.join(', ')}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Language & Format</span>
                <span className="font-semibold">{movie.language}</span>
              </div>
              {movie.crew.length > 0 && (
                <div>
                  <span className="text-xs text-muted-foreground block">Director & Crew</span>
                  <ul className="space-y-1 mt-1">
                    {movie.crew.map((cr) => (
                      <li key={cr.id} className="text-xs">
                        <strong className="text-foreground">{cr.name}</strong> ({cr.role})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        <section id="screenings" className="p-8 bg-card border border-border rounded-3xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-widest">Reserve Your Seat</span>
              <h2 className="text-2xl font-extrabold mt-1">Open Showtimes</h2>
            </div>
            <span className="text-xs text-muted-foreground">Same schedule as the admin cinema panel</span>
          </div>

          {screenings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {screenings.map((scr) => (
                <div
                  key={scr.id}
                  className="p-5 bg-secondary/50 border border-border rounded-2xl flex flex-col justify-between space-y-4 hover:border-primary transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-extrabold text-base">{scr.hallName || cinemaName}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatDate(scr.date)}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-foreground">{scr.startTime}</span>
                      <span className="text-[10px] text-muted-foreground block">Ends {scr.endTime}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border/50 text-xs">
                    <span className="text-muted-foreground">
                      <strong>{scr.availableSeatsCount}</strong> seats available
                    </span>
                    <Link
                      href={`/booking/${scr.id}`}
                      className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
                    >
                      Reserve
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <p className="text-sm">No active showtimes currently scheduled.</p>
            </div>
          )}
        </section>
      </div>

      <TrailerModal videoUrl={trailerUrl} onClose={() => setTrailerUrl(null)} title={movie.title} />
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full aspect-video rounded-2xl overflow-hidden border border-white/20">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 px-3 py-1 bg-black/60 text-white rounded-full text-xs font-bold"
            >
              Close ✕
            </button>
            <Image src={selectedPhoto} alt="Enlarged film still" fill className="object-contain" />
          </div>
        </div>
      )}
    </PublicLayout>
  );
}
