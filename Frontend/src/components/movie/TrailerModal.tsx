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

function IconYoutube({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8zM9.8 15.5v-7l6.2 3.5-6.2 3.5z" />
    </svg>
  );
}

function IconFacebook({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.3c-1.2 0-1.6.8-1.6 1.5V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z" />
    </svg>
  );
}

function IconInstagram({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm-5 3.5A5.5 5.5 0 1 1 6.5 13 5.5 5.5 0 0 1 12 7.5zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5zM17.5 6.8a1.2 1.2 0 1 1-1.2 1.2 1.2 1.2 0 0 1 1.2-1.2z" />
    </svg>
  );
}

function IconTikTok({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .56.04.82.12v-3.4a6.27 6.27 0 0 0-.82-.05A6.34 6.34 0 0 0 3.15 15.5 6.34 6.34 0 0 0 9.49 21.84a6.34 6.34 0 0 0 6.34-6.34V8.77a8.18 8.18 0 0 0 4.76 1.52V6.84a4.85 4.85 0 0 1-1-.15z" />
    </svg>
  );
}

async function copyTrailerLink(url: string, platform: string) {
  try {
    await navigator.clipboard.writeText(url);
    toast.success('Link copied', `Paste the Majnoon trailer link in ${platform}`);
  } catch {
    toast.info('Trailer link', url);
  }
}

export function TrailerModal({ videoUrl, onClose, title = 'Majnoon' }: TrailerModalProps) {
  const watchUrl = videoUrl ? toWatchUrl(videoUrl) : '';
  const shareText = encodeURIComponent(`Watch the ${title} trailer`);
  const encodedUrl = encodeURIComponent(watchUrl);

  const handleShare = async (platform: 'youtube' | 'tiktok' | 'facebook' | 'instagram') => {
    if (!watchUrl) return;

    if (platform === 'youtube') {
      window.open(watchUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    if (platform === 'facebook') {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${shareText}`,
        '_blank',
        'noopener,noreferrer'
      );
      return;
    }

    if (platform === 'tiktok') {
      await copyTrailerLink(watchUrl, 'TikTok');
      window.open('https://www.tiktok.com/', '_blank', 'noopener,noreferrer');
      return;
    }

    // Instagram has no web share URL for posts — copy then open
    await copyTrailerLink(watchUrl, 'Instagram');
    window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
  };

  const shares = [
    { name: 'YouTube', platform: 'youtube' as const, icon: IconYoutube, className: 'bg-red-600 hover:bg-red-500 text-white' },
    { name: 'TikTok', platform: 'tiktok' as const, icon: IconTikTok, className: 'bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700' },
    { name: 'Facebook', platform: 'facebook' as const, icon: IconFacebook, className: 'bg-[#1877F2] hover:bg-[#166fe5] text-white' },
    { name: 'Instagram', platform: 'instagram' as const, icon: IconInstagram, className: 'bg-gradient-to-r from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white' },
  ];

  const handleNativeShare = async () => {
    if (!watchUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${title} Trailer`, text: `Watch the ${title} trailer`, url: watchUrl });
      } catch {
        /* cancelled */
      }
    } else {
      await copyTrailerLink(watchUrl, 'your app');
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

            <div className="p-4 sm:p-5 border-t border-zinc-800 flex flex-wrap items-center justify-end gap-2">
              {shares.map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => handleShare(s.platform)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${s.className}`}
                    title={`Share on ${s.name}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {s.name}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={handleNativeShare}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white/10 text-white hover:bg-white/20 border border-white/20"
              >
                <Share2 className="w-3.5 h-3.5" />
                More
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
