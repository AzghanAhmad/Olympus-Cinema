'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Movie } from '@/types/movie';
import { Star, Clock, Ticket, Play } from 'lucide-react';
import { motion } from 'framer-motion';

interface MovieCardProps {
  movie: Movie;
  onWatchTrailer?: (url: string) => void;
}

export function MovieCard({ movie, onWatchTrailer }: MovieCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className="group relative bg-card text-card-foreground rounded-2xl overflow-hidden border border-border shadow-md hover:shadow-2xl hover:shadow-primary/15 transition-shadow flex flex-col h-full"
    >
      {/* Poster Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-900">
        <Image
          src={movie.posterUrl}
          alt={movie.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
        />

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-xs flex flex-col items-center justify-center gap-3 p-4 text-center">
          {onWatchTrailer && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.preventDefault();
                onWatchTrailer(movie.trailerUrl);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-full text-xs backdrop-blur-md transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              Watch Trailer
            </motion.button>
          )}

          <Link href={`/movies/${movie.slug}`}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-extrabold rounded-xl text-xs shadow-lg shadow-primary/40 hover:bg-primary/90 transition-colors"
            >
              <Ticket className="w-4 h-4" />
              Book Tickets
            </motion.button>
          </Link>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md text-amber-400 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border border-white/10">
          <Star className="w-3.5 h-3.5 fill-amber-400" />
          <span>{movie.rating}</span>
        </div>

        <div className="absolute top-3 right-3 bg-zinc-900/80 backdrop-blur-md text-zinc-200 px-2 py-0.5 rounded text-[10px] font-bold border border-white/10">
          {movie.ageRating}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 justify-between space-y-2">
        <div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-1">
            <span className="truncate">{movie.genre.join(' • ')}</span>
          </div>
          <Link href={`/movies/${movie.slug}`}>
            <h3 className="font-extrabold text-base line-clamp-1 group-hover:text-primary transition-colors">
              {movie.title}
            </h3>
          </Link>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{movie.durationMinutes} min</span>
          </div>
          <span className="font-semibold text-primary">
            {movie.status === 'NOW_SHOWING' ? 'Now Showing' : 'Coming Soon'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
