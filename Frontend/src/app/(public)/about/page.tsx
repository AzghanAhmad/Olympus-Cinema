'use client';

import React from 'react';
import Image from 'next/image';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Film, Award, ShieldCheck, Users, Sparkles } from 'lucide-react';

export default function AboutPage() {
  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        
        {/* Hero Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider">
            Our Story & Legacy
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Redefining the Magic of Cinema
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            Olympus Cinema was founded with a singular mission: to restore the breathtaking wonder of theatrical moviegoing. We craft spaces where storytelling, cutting-edge technology, and unmatched luxury converge.
          </p>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative aspect-video rounded-3xl overflow-hidden border border-border bg-zinc-900">
            <Image
              src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1000&auto=format&fit=crop"
              alt="Cinema Auditorium"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative aspect-video rounded-3xl overflow-hidden border border-border bg-zinc-900">
            <Image
              src="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1000&auto=format&fit=crop"
              alt="VIP Lounge"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 bg-card border border-border rounded-3xl text-center">
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-black text-primary">12</span>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">IMAX & Atmos Screenings</p>
          </div>
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-black text-primary">1.2M+</span>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Annual Cinephiles</p>
          </div>
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-black text-primary">100%</span>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Laser Projection</p>
          </div>
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-black text-primary">4.9/5</span>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Audience Rating</p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
