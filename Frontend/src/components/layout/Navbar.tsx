'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';
import { Search, Menu, X, User, Shield, Ticket } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useSiteSettingsStore } from '@/store/useSiteSettingsStore';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const { user } = useAuthStore();
  const brandName = useSiteSettingsStore((s) => s.brandName);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Majnoon', href: '/movies/majnoon' },
    { name: 'Showtimes', href: '/screenings' },
    { name: 'News', href: '/news' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <>
      <header
        className={`print:hidden fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'glass-panel py-3 shadow-lg'
            : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent py-5 text-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-10 h-10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Image
                src="/images/Crystal Entertainment Logo-1.png"
                alt="Crystal Entertainment Logo"
                width={40}
                height={40}
                className="w-full h-full object-contain filter drop-shadow"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-wider leading-none text-foreground">
                THE<span className="text-primary">CRYSTALS</span>
              </span>
              <span className="text-[10px] tracking-widest uppercase font-medium text-muted-foreground">
                {brandName}
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'text-primary bg-primary/10 font-semibold'
                      : 'text-foreground/80 hover:text-primary hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-full text-foreground/80 hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              title="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/account/bookings"
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border ${
                    pathname.startsWith('/account/bookings')
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border-border'
                  }`}
                >
                  <Ticket className="w-3.5 h-3.5" />
                  My Reservation
                </Link>
                <Link
                  href="/account"
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors border border-border"
                >
                  <User className="w-3.5 h-3.5" />
                  Account
                </Link>
                {user.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/30"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Admin
                  </Link>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3 py-2 text-sm font-semibold rounded-lg text-foreground/90 hover:text-primary transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-foreground hover:bg-black/5 dark:hover:bg-white/5"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden glass-panel border-t border-border mt-3 py-4 px-6 space-y-3">
            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 text-base font-medium rounded-lg ${
                    pathname === link.href ? 'text-primary bg-primary/10 font-bold' : 'text-foreground/80 hover:text-primary'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              {user ? (
                <>
                  <Link
                    href="/account/bookings"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2 text-base font-medium rounded-lg ${
                      pathname.startsWith('/account/bookings')
                        ? 'text-primary bg-primary/10 font-bold'
                        : 'text-foreground/80 hover:text-primary'
                    }`}
                  >
                    My Reservation
                  </Link>
                  <Link
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-base font-medium rounded-lg text-foreground/80 hover:text-primary"
                  >
                    Account
                  </Link>
                  {user.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 text-base font-medium rounded-lg text-primary font-bold"
                    >
                      Admin
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-base font-medium rounded-lg text-foreground/80 hover:text-primary"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-base font-medium rounded-lg text-primary font-bold"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
          <div className="bg-card text-card-foreground border border-border rounded-2xl w-full max-w-xl shadow-2xl p-6 relative">
            <button
              onClick={() => setSearchOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold mb-4">Search Majnoon</h3>
            <input
              type="text"
              placeholder="Showtimes, news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-secondary text-foreground rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
            <div className="mt-4 flex justify-end">
              <Link
                href="/screenings"
                onClick={() => setSearchOpen(false)}
                className="text-primary font-semibold hover:underline text-sm"
              >
                View showtimes →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
