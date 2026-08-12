'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';
import { Film, Search, Menu, X, User, Shield } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const { user } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Movies', href: '/movies' },
    { name: 'Screenings', href: '/screenings' },
    { name: 'News', href: '/news' },
    { name: 'Events', href: '/events' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'glass-panel py-3 shadow-lg'
            : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent py-5 text-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
              <Film className="w-5 h-5 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-wider leading-none text-foreground">
                OLYMPUS<span className="text-primary">CINEMA</span>
              </span>
              <span className="text-[10px] tracking-widest uppercase font-medium text-muted-foreground">
                Olympus Seating
              </span>
            </div>
          </Link>

          {/* Desktop Links */}
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

          {/* Action Tools */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-full text-foreground/80 hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              title="Search movies"
            >
              <Search className="w-5 h-5" />
            </button>

            <ThemeToggle />

            {user ? (
              <div className="flex items-center gap-2">
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
              <Link
                href="/account"
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md shadow-primary/20 hover:scale-[1.02]"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
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

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-panel border-t border-border mt-3 py-4 px-6 space-y-3">
            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 text-base font-medium rounded-lg ${
                    pathname === link.href
                      ? 'text-primary bg-primary/10 font-bold'
                      : 'text-foreground/80 hover:text-primary'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
            <div className="pt-3 border-t border-border flex flex-col space-y-2">
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center font-medium rounded-lg bg-primary text-primary-foreground"
              >
                {user ? 'My Account' : 'Sign In / Register'}
              </Link>
              {user?.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2 text-center font-medium rounded-lg bg-secondary text-secondary-foreground border border-border"
                >
                  Admin Dashboard
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Global Quick Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
          <div className="bg-card text-card-foreground border border-border rounded-2xl w-full max-w-xl shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setSearchOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold mb-4">Search Movies & Events</h3>
            <div className="relative">
              <Search className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Type movie title, actor, or genre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-secondary text-foreground rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
            </div>
            <div className="mt-4 flex justify-between items-center text-xs text-muted-foreground">
              <span>Press ESC to close</span>
              <Link
                href={`/movies${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`}
                onClick={() => setSearchOpen(false)}
                className="text-primary font-semibold hover:underline"
              >
                View all search results →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
