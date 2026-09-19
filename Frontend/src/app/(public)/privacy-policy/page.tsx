'use client';

import React from 'react';
import Link from 'next/link';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { useSiteSettingsStore } from '@/store/useSiteSettingsStore';
import { ShieldCheck, Lock, FileText, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const brandName = useSiteSettingsStore((s) => s.brandName) || 'Crystal Entertainment';

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Legal & Transparency
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-muted-foreground mt-1">Last updated: October 2026</p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-6 sm:p-10 space-y-8 text-sm leading-relaxed text-muted-foreground shadow-sm">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" /> 1. Overview
            </h2>
            <p>
              At <strong>{brandName}</strong>, we respect your personal privacy and are committed
              to safeguarding the information you share with us. This Privacy Policy describes how we
              collect, use, and protect your information when booking cinema tickets, reserving seats,
              or using our digital portals.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> 2. Information We Collect
            </h2>
            <p>When you make reservations or create an account, we may collect:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li><strong>Contact Information:</strong> Full name, email address, and phone number.</li>
              <li><strong>Booking Information:</strong> Selected showtimes, screening dates, seat numbers, and reservation codes.</li>
              <li><strong>Verification Data:</strong> One-time passcode verification timestamps to ensure legitimate bookings.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">3. How Your Information Is Used</h2>
            <p>We use your information exclusively for the following operational purposes:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>Confirming and dispatching your booking reference codes, e-tickets, and barcodes.</li>
              <li>Contacting you with updates regarding showtimes, schedule changes, or reservation status.</li>
              <li>Validating your email address to prevent duplicate holds or fraudulent reservations.</li>
              <li>Providing dedicated concierge support whenever you contact our staff.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">4. Data Security & Storage</h2>
            <p>
              Your reservation records and credentials are saved securely using encrypted database connections
              and industry-standard hashing protocols. We never sell, rent, or trade your personal information
              to third-party advertisers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">5. Contact Us Regarding Privacy</h2>
            <p>
              If you have any questions or requests regarding your personal information, please reach out
              through our{' '}
              <Link href="/contact" className="text-primary font-bold hover:underline">
                Contact Page
              </Link>{' '}
              or email us at <strong>crystalmaldives@gmail.com</strong>.
            </p>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
