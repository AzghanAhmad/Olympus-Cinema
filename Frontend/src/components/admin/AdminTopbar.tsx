'use client';

import React from 'react';
import Image from 'next/image';
import { useAuthStore } from '@/store/useAuthStore';
import { Search, Bell, Shield } from 'lucide-react';

export function AdminTopbar() {
  const { user } = useAuthStore();

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
      
      {/* Search Input */}
      <div className="relative w-72">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Quick search bookings, movies..."
          className="w-full pl-9 pr-4 py-1.5 bg-secondary text-foreground text-xs rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Admin Profile & Notifications */}
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
        </button>

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
