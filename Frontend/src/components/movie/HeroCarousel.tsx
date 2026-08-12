'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Movie } from '@/types/movie';
import { Play, Ticket, ChevronLeft, ChevronRight, Star, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedButton } from '@/components/motion/AnimatedButton';
import { toast } from '@/store/useToastStore';

interface HeroCarouselProps {
  movies: Movie[];
  onWatchTrailer?: (url: string) => void;
}

export function HeroCarousel({ movies, onWatchTrailer }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (movies.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [movies.length]);

  if (!movies || movies.length === 0) return null;

  const current = movies[currentIndex];

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % movies.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);

  return (
    <div className="relative w-full h-[85vh] min-h-[550px] max-h-[820px] overflow-hidden bg-black text-white">
      {/* Background Image Zoom / Ken Burns Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, scale: 1.15 }}
          animate={{ opacity: 1, scale: 1.03 }}
          exit={{ opacity: 0, scale: 1.0 }}
          transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1.0] }}
          className="absolute inset-0"
        >
          <Image
            src={current.backdropUrl}
            alt={current.title}
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 hero-overlay" />
        </motion.div>
      </AnimatePresence>

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-end pb-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { staggerChildren: 0.1, delayChildren: 0.15 },
              },
            }}
            className="max-w-2xl space-y-4"
          >
            {/* Badges & Meta */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              className="flex flex-wrap items-center gap-3 text-xs font-semibold"
            >
              <span className="px-3 py-1 bg-primary text-white rounded-full uppercase tracking-wider shadow-md shadow-primary/40">
                Featured Premiere
              </span>
              <span className="px-2.5 py-0.5 bg-white/20 backdrop-blur-md rounded text-white border border-white/20">
                {current.ageRating}
              </span>
              <div className="flex items-center gap-1 text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
                <span className="font-bold">{current.rating}</span>
              </div>
              <div className="flex items-center gap-1 text-zinc-300">
                <Clock className="w-3.5 h-3.5" />
                <span>{current.durationMinutes} mins</span>
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none drop-shadow-lg"
            >
              {current.title}
            </motion.h1>

            {/* Genre Badges */}
            <motion.div
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
              className="flex flex-wrap gap-2 pt-1"
            >
              {current.genre.map((g) => (
                <span key={g} className="text-xs px-2.5 py-1 rounded bg-zinc-800/80 text-zinc-300 border border-zinc-700">
                  {g}
                </span>
              ))}
            </motion.div>

            {/* Synopsis */}
            <motion.p
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              className="text-sm sm:text-base text-zinc-300 line-clamp-3 leading-relaxed drop-shadow"
            >
              {current.synopsis}
            </motion.p>

            {/* Action CTAs */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}
              className="flex flex-wrap items-center gap-4 pt-4"
            >
              <Link href={`/movies/${current.slug}`}>
                <AnimatedButton variant="primary" size="lg" className="gap-2">
                  <Ticket className="w-5 h-5" />
                  Book Tickets Now
                </AnimatedButton>
              </Link>

              {onWatchTrailer && (
                <AnimatedButton
                  variant="outline"
                  size="lg"
                  onClick={() => onWatchTrailer(current.trailerUrl)}
                  className="gap-2 bg-white/10 text-white border-white/20 hover:bg-white/20"
                >
                  <Play className="w-5 h-5 fill-white" />
                  Watch Trailer
                </AnimatedButton>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls & Slide Indicators */}
      <div className="absolute bottom-6 right-6 z-20 flex items-center space-x-4">
        <div className="flex space-x-1.5">
          {movies.map((m, idx) => (
            <button
              key={m.id}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-8 bg-primary' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handlePrev}
            className="p-2 rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-md text-white border border-white/20 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleNext}
            className="p-2 rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-md text-white border border-white/20 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
