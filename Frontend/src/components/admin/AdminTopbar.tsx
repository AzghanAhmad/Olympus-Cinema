'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';
import { adminApi } from '@/services/adminApi';
import { Search, Bell } from 'lucide-react';

type SearchTarget = {
  route: '/admin/bookings' | '/admin/movies' | '/admin/users';
  placeholder: string;
};

function getSearchTarget(pathname: string): SearchTarget {
  if (pathname.startsWith('/admin/bookings')) {
    return { route: '/admin/bookings', placeholder: 'Search booking code, email, or phone...' };
  }
  if (pathname.startsWith('/admin/users')) {
    return { route: '/admin/users', placeholder: 'Search user name or email...' };
  }
  return { route: '/admin/movies', placeholder: 'Search movies, or jump to bookings/users...' };
}

export function AdminTopbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const target = getSearchTarget(pathname);

  const { data } = useQuery({
    queryKey: ['admin', 'topbar', 'dashboard'],
    queryFn: () => adminApi.dashboard(),
    staleTime: 30000,
  });

  const notifications = useMemo(() => {
    const stats = data?.data;
    if (!stats) return [];
    return [
      {
        id: 'pending-bookings',
        title: `${stats.bookingsByStatus.find((s) => s.status === 'PENDING')?.count ?? 0} pending bookings`,
        href: '/admin/bookings',
        detail: 'Reservations waiting for review',
      },
      {
        id: 'upcoming-screenings',
        title: `${stats.totals.upcomingScreenings} upcoming screenings`,
        href: '/admin/screenings',
        detail: 'Active showtimes in the schedule',
      },
      {
        id: 'published-movies',
        title: `${stats.totals.publishedMovies} published movies`,
        href: '/admin/movies',
        detail: `${stats.totals.movies} total movies in catalog`,
      },
      {
        id: 'recent-bookings',
        title: `${stats.recentBookings.length} recent bookings`,
        href: '/admin/bookings',
        detail: 'Latest customer reservations',
      },
    ].filter((item) => !item.title.startsWith('0 '));
  }, [data]);

  const unreadCount = notifications.length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    const lower = trimmed.toLowerCase();
    if (lower.includes('book') || lower.includes('@') || lower.startsWith('cin-')) {
      router.push(`/admin/bookings?q=${encodeURIComponent(trimmed)}`);
      return;
    }
    if (lower.includes('user') || lower.includes('admin') || lower.includes('staff')) {
      router.push(`/admin/users?q=${encodeURIComponent(trimmed)}`);
      return;
    }
    router.push(`${target.route}?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
      <form onSubmit={handleSearch} className="relative w-72">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={target.placeholder}
          className="w-full pl-9 pr-4 py-1.5 bg-secondary text-foreground text-xs rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </form>

      <div className="flex items-center space-x-4">
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary relative"
            aria-label="Open notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                {Math.min(unreadCount, 9)}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-border bg-card shadow-xl p-3 space-y-2">
              <div className="px-2 pt-1 pb-2 border-b border-border">
                <p className="text-xs font-extrabold">Notifications</p>
                <p className="text-[11px] text-muted-foreground">Live updates from the admin dashboard</p>
              </div>
              {notifications.length === 0 ? (
                <p className="px-2 py-3 text-xs text-muted-foreground">No new notifications.</p>
              ) : (
                notifications.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-3 py-2 hover:bg-secondary transition-colors"
                  >
                    <p className="text-xs font-bold">{item.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{item.detail}</p>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>

        {user && (
          <div className="flex items-center gap-3 pl-2 border-l border-border">
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-zinc-800 border border-primary/30">
              <Image src={user.avatarUrl} alt={user.name} fill className="object-cover" />
            </div>
            <div className="text-left text-xs hidden sm:block">
              <span className="font-bold block leading-none">{user.name}</span>
              <span className="text-[10px] text-primary font-semibold">Cinema Manager</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
