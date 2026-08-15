'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { useSiteSettingsStore } from '@/store/useSiteSettingsStore';

export default function AboutPage() {
  const cinemaName = useSiteSettingsStore((s) => s.cinemaName);
  const brandName = useSiteSettingsStore((s) => s.brandName);

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider">
            {brandName}
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Majunoon at {cinemaName} Cinema
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            {brandName} presents the film Majunoon exclusively at {cinemaName} Cinema. Choose any open showtime,
            reserve your seats (up to 15 per person), and complete payment to receive your ticket.
            A reservation reference is not an entry ticket until payment is confirmed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative aspect-video rounded-3xl overflow-hidden border border-border bg-zinc-900">
            <Image
              src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1000&auto=format&fit=crop"
              alt="Olympus Cinema"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center space-y-4 p-2">
            <h2 className="text-2xl font-extrabold">How booking works</h2>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
              <li>Pick one of the open Majunoon shows</li>
              <li>Select seats (maximum 15 per person)</li>
              <li>Verify email or phone with a code</li>
              <li>Submit reservation — we contact you when confirmed</li>
              <li>Ticket is issued only after payment</li>
            </ul>
            <Link href="/screenings" className="inline-flex text-primary font-bold text-sm hover:underline">
              View showtimes →
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
