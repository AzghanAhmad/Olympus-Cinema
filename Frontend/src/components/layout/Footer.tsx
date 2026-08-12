import React from 'react';
import Link from 'next/link';
import { Film, Mail, Phone, MapPin, Share2, Globe, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-zinc-950 text-zinc-300 border-t border-zinc-900 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30">
                <Film className="w-5 h-5 fill-current" />
              </div>
              <span className="font-extrabold text-2xl tracking-wider text-white">
                OLYMPUS<span className="text-primary">CINEMA</span>
              </span>
            </Link>
            <p className="text-sm text-zinc-400 max-w-sm leading-relaxed">
              Experience movie storytelling at its peak. Featuring IMAX Dual Laser, Dolby Atmos surround sound, luxury lounge seating, and artisanal concessions.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <a href="#" className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-primary transition-colors">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-primary transition-colors">
                <Share2 className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-primary transition-colors">
                <Sparkles className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/movies" className="hover:text-primary transition-colors">Now Showing</Link></li>
              <li><Link href="/movies?filter=coming-soon" className="hover:text-primary transition-colors">Coming Soon</Link></li>
              <li><Link href="/screenings" className="hover:text-primary transition-colors">Screenings Schedule</Link></li>
              <li><Link href="/events" className="hover:text-primary transition-colors">Special Events</Link></li>
              <li><Link href="/news" className="hover:text-primary transition-colors">Cinema News</Link></li>
            </ul>
          </div>

          {/* Col 3: Experience */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">The Experience</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/about" className="hover:text-primary transition-colors">IMAX 3D Laser</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">Dolby Atmos Audio</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">VIP Lounge & Dining</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">Private Screenings</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Gift Cards</Link></li>
            </ul>
          </div>

          {/* Col 4: Contact Info */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">Contact Cinema</h4>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>100 Olympus Boulevard, Grand Cinematic District, CA 90210</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span>+1 (800) 555-OLYM</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span>concierge@olympuscinema.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <p>© {new Date().getFullYear()} OLYMPUS CINEMA PLATFORM. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-zinc-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-zinc-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-zinc-400 transition-colors">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
