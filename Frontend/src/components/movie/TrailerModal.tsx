'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2 } from 'lucide-react';
import { modalAnimation } from '@/lib/motion';
import { toast } from '@/store/useToastStore';

interface TrailerModalProps {
  videoUrl: string | null;
  onClose: () => void;
  title?: string;
}

function toWatchUrl(embedUrl: string) {
  const id = embedUrl.split('/embed/')[1]?.split('?')[0];
  return id ? `https://www.youtube.com/watch?v=${id}` : embedUrl;
}

async function copyTrailerLink(url: string) {
  try {
    await navigator.clipboard.writeText(url);
    toast.success('Link copied', 'Trailer link copied to clipboard.');
  } catch {
    toast.info('Trailer link', url);
  }
}

export function TrailerModal({ videoUrl, onClose, title = 'Majnoon' }: TrailerModalProps) {
  const watchUrl = videoUrl ? toWatchUrl(videoUrl) : '';

  const handleNativeShare = async () => {
    if (!watchUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${title} Trailer`, text: `Watch the ${title} trailer`, url: watchUrl });
      } catch {
        /* cancelled */
      }
    } else {
      await copyTrailerLink(watchUrl);
    }
  };

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
                title={`${title} Trailer`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="p-4 sm:p-5 border-t border-zinc-800 flex items-center justify-end">
              <button
                type="button"
                onClick={handleNativeShare}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
