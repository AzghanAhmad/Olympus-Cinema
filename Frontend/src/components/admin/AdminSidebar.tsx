'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import {
  Film,
  LayoutDashboard,
  Clapperboard,
  Calendar,
  Armchair,
  Ticket,
  Users,
  Newspaper,
  Sparkles,
  Settings,
  ArrowLeft,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export function AdminSidebar() {
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);
  const [open, setOpen] = useState(false);

  const links = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Movies', href: '/admin/movies', icon: Clapperboard },
    { name: 'Screenings', href: '/admin/screenings', icon: Calendar },
    { name: 'Screens & Seats', href: '/admin/screens', icon: Armchair },
    { name: 'Bookings', href: '/admin/bookings', icon: Ticket },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'News', href: '/admin/news', icon: Newspaper },
    { name: 'Events', href: '/admin/events', icon: Sparkles },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const sidebarContent = (
    <>
      <div className="space-y-6">
        <Link href="/" className="flex items-center gap-2 px-2 pt-2 group">
          <div className="relative w-8 h-8 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Image
              src="/images/Crystal Entertainment Logo-1.png"
              alt="Crystal Entertainment Logo"
              width={32}
              height={32}
              className="w-full h-full object-contain filter drop-shadow"
            />
          </div>
          <span className="font-extrabold text-lg tracking-wider text-foreground">
            CRYSTAL<span className="text-primary">ADMIN</span>
          </span>
        </Link>

        <nav className="space-y-1">
          {links.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-primary-foreground' : ''}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-border space-y-3">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-semibold text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Public Site
        </Link>
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-2 px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 bg-card border border-border rounded-lg shadow-lg lg:hidden"
        aria-label="Open sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col justify-between p-4 transition-transform duration-200 lg:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-secondary"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-card border-r border-border h-screen sticky top-0 flex-col justify-between p-4 shrink-0">
        {sidebarContent}
      </aside>
    </>
  );
}
