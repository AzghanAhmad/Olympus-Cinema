'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { modalAnimation } from '@/lib/motion';

interface TrailerModalProps {
  videoUrl: string | null;
  onClose: () => void;
}

export function TrailerModal({ videoUrl, onClose }: TrailerModalProps) {
  return (
    <AnimatePresence>
      {videoUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
          <motion.div
            variants={modalAnimation}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-primary transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative aspect-video w-full">
              <iframe
                src={`${videoUrl}?autoplay=1`}
                title="Movie Trailer"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
