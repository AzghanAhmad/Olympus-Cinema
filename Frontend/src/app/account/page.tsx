'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { useAuthStore } from '@/store/useAuthStore';
import { MOCK_BOOKINGS } from '@/data/content';
import { User, Ticket, Settings, History, Shield, Calendar, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function UserAccountPage() {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <PublicLayout>
        <div className="max-w-md mx-auto py-24 text-center space-y-4">
          <h1 className="text-2xl font-extrabold">Please Sign In</h1>
          <p className="text-sm text-muted-foreground">Access your cinema bookings and profile preferences.</p>
          <Link href="/" className="inline-block px-6 py-2.5 bg-primary text-white font-bold rounded-xl text-xs">
            Return Home
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const activeBookings = MOCK_BOOKINGS.filter((b) => b.status === 'CONFIRMED');

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        
        {/* Account Header Profile Bar */}
        <div className="p-8 bg-card border border-border rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-zinc-900 border-2 border-primary/40 shrink-0">
              <Image src={user.avatarUrl} alt={user.name} fill className="object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold">{user.name}</h1>
                {user.role === 'ADMIN' && (
                  <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full border border-primary/20">
                    Administrator
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{user.email} • {user.phone}</p>
              <p className="text-[11px] text-muted-foreground mt-1">Member since {formatDate(user.joinedDate)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/account/bookings"
              className="px-4 py-2.5 bg-secondary text-secondary-foreground font-bold text-xs rounded-xl border border-border hover:bg-secondary/80 transition-colors"
            >
              My Bookings ({user.totalBookings})
            </Link>
            <Link
              href="/account/profile"
              className="px-4 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/90 transition-colors shadow-md shadow-primary/30"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Active / Upcoming Bookings */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold flex items-center gap-2">
                <Ticket className="w-5 h-5 text-primary" />
                <span>Upcoming Reservations</span>
              </h2>
              <Link href="/account/bookings" className="text-xs font-bold text-primary hover:underline">
                View History →
              </Link>
            </div>

            {activeBookings.length > 0 ? (
              <div className="space-y-4">
                {activeBookings.map((bk) => (
                  <div key={bk.id} className="p-6 bg-card border border-border rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-24 rounded-xl overflow-hidden bg-zinc-900 shrink-0 border border-border">
                        <Image src={bk.moviePoster} alt={bk.movieTitle} fill className="object-cover" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{bk.bookingCode}</span>
                        <h3 className="font-extrabold text-base">{bk.movieTitle}</h3>
                        <p className="text-xs text-muted-foreground">{bk.hallName} • {bk.screenType}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                          <span>📅 {formatDate(bk.date)}</span>
                          <span>⏰ {bk.startTime}</span>
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/booking/confirmation?bookingId=${bk.id}`}
                      className="px-4 py-2 bg-primary text-white font-bold text-xs rounded-xl shrink-0 hover:bg-primary/90"
                    >
                      View QR Ticket
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-card border border-border rounded-2xl space-y-2">
                <p className="text-sm text-muted-foreground">No upcoming bookings scheduled.</p>
              </div>
            )}
          </div>

          {/* Quick Account Navigation */}
          <div className="p-6 bg-card border border-border rounded-3xl space-y-4 h-fit">
            <h3 className="font-extrabold text-base border-b border-border pb-3">Quick Navigation</h3>
            
            <nav className="flex flex-col space-y-2">
              <Link href="/account/bookings" className="p-3 rounded-xl hover:bg-secondary font-medium text-xs flex items-center gap-2">
                <History className="w-4 h-4 text-primary" />
                <span>My Booking History</span>
              </Link>
              <Link href="/account/profile" className="p-3 rounded-xl hover:bg-secondary font-medium text-xs flex items-center gap-2">
                <Settings className="w-4 h-4 text-primary" />
                <span>Account & Security Settings</span>
              </Link>
              {user.role === 'ADMIN' && (
                <Link href="/admin" className="p-3 rounded-xl bg-primary/10 text-primary font-bold text-xs flex items-center gap-2 border border-primary/20">
                  <Shield className="w-4 h-4" />
                  <span>Open Admin Control Dashboard</span>
                </Link>
              )}
            </nav>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
