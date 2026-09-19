'use client';

import React from 'react';
import Link from 'next/link';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { useSiteSettingsStore } from '@/store/useSiteSettingsStore';
import { FileCheck, AlertCircle, Ticket, ArrowLeft } from 'lucide-react';

export default function TermsPage() {
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
            <FileCheck className="w-6 h-6 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Agreement
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Terms & Conditions</h1>
          <p className="text-xs text-muted-foreground mt-1">Last updated: October 2026</p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-6 sm:p-10 space-y-8 text-sm leading-relaxed text-muted-foreground shadow-sm">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Ticket className="w-4 h-4 text-primary" /> 1. Booking & Reservations
            </h2>
            <p>
              By reserving tickets on the <strong>{brandName}</strong> platform, you acknowledge that initial
              submissions are <em>unconfirmed reservations</em>. Official entry tickets with active admission barcodes
              are granted once payment is confirmed.
            </p>
            <p>
              Guests can reserve up to the allowed maximum tickets per screening as indicated during checkout.
              Duplicate or automated bulk submissions without verification are subject to cancellation.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-primary" /> 2. Cinema Hall Admission & Conduct
            </h2>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>Guests must arrive at least 15 minutes before the scheduled start time of the screening.</li>
              <li>Please present your digital e-ticket or printed barcode ticket at the hall entrance for verification.</li>
              <li>Outside hot food and unauthorized recording equipment are strictly prohibited inside the auditorium.</li>
              <li>Movie age classifications (e.g. 18+ or PG-13) are strictly enforced in accordance with local regulations.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">3. Cancellations & Rescheduling</h2>
            <p>
              Screening schedules are subject to change due to technical or operational requirements. In the rare
              event of a cancellation or rescheduling by Crystal Entertainment, guests will be promptly notified
              via their registered email or phone number.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">4. Intellectual Property</h2>
            <p>
              All promotional media, movie artwork, trademarks, and design elements featured on this website
              belong to Crystal Entertainment, The Crystal Co. Pte. Ltd., or their respective film creators.
              Unauthorized reproduction or recording is strictly prohibited.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">5. Inquiries & Support</h2>
            <p>
              For inquiries regarding group reservations, corporate bookings, or special accommodations,
              please visit our{' '}
              <Link href="/contact" className="text-primary font-bold hover:underline">
                Contact Page
              </Link>{' '}
              or call <strong>7844422</strong>.
            </p>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
