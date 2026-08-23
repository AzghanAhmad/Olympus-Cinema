'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { useSiteSettingsStore } from '@/store/useSiteSettingsStore';

export default function AboutPage() {
  const brandName = useSiteSettingsStore((s) => s.brandName);

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider">
            {brandName}
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">About Us</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
          <div className="lg:col-span-2 relative aspect-[3/4] rounded-3xl overflow-hidden border border-border bg-zinc-900">
            <Image
              src="/images/majnoon-poster.jpg"
              alt="Crystal Entertainment"
              fill
              className="object-cover"
            />
          </div>

          <div className="lg:col-span-3 space-y-5 text-sm sm:text-base text-muted-foreground leading-relaxed">
            <p>
              Incorporated in 2005, The Crystal Co., Pte. Ltd., is a Maldives-based company engaged in
              Film Making and Entertainment businesses primarily targeted to Maldivian audience.
            </p>
            <p>
              Mrs. Fathimath Nahula, the name behind The Crystal Co. Pte. Ltd., is the founder and
              creative head of the company&apos;s entertainment sector and it is her vision, which has
              catapulted the Crystal Entertainment to where it is today - An illustrious entertainment
              brand that is known to every Maldivian.
            </p>
            <p>
              During the past, Fathimath Nahula has directed over 8 films, all of which have generated
              record breaking and tremendous profits. Films like Sorry, 4426, Yousuf, Zuleykha,
              Kalaayaanulaa, Naaummeedh, Fahuneyva are memorable blockbusters which have a huge fan
              following. The Company had also produced successful films like BOS, Veeraana, Bulhaa
              dhonbe, Heyonuvaane, Mihashin Furaana dhandhen and commercial advertisements for
              businesses. The company also creates TV Drama series and video spots for advocating
              public on social issues and creating awareness. In 2018 again, the creative head of the
              Company Ms Fathimath Nahula has entered to the history by making the first ever web
              series &quot;HUVAA&quot; (14 hours) for the app &quot;baiskoafu&quot;.
            </p>
            <p>
              The Crystal Co. Pte. Ltd., combines more than 2 decades of experience in the Film and
              Television industry and provides a total video production service for the business and
              public sector. Quality and service to our audience is paramount and we are committed to
              working with a diversity of budgets to deliver the very best video production possible.
            </p>
            <p>
              In pursuit of promoting technical and creative excellence, we work only with
              accomplished industry professionals, drawing on their experience as actors, directors
              and skilled technicians.
            </p>
            <p>
              In the years of our existence we have established a unique and strong business network
              within the entertainment industry. Our overall mission is to give our artists, clients
              and audiences a unique experience. We take pride in representing the very best of
              talents and are committed to manage them thereafter.
            </p>
            <Link href="/screenings" className="inline-flex text-primary font-bold text-sm hover:underline pt-2">
              View showtimes →
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
