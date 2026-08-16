'use client';

import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { useSiteSettingsStore } from '@/store/useSiteSettingsStore';

export default function AdminSettingsPage() {
  const {
    brandName,
    cinemaName,
    maxTicketsPerPerson,
    seatHoldMinutes,
    ticketPrice,
    totalSeats,
    setCinemaName,
    setMaxTicketsPerPerson,
    setSeatHoldMinutes,
    setTicketPrice,
    setTotalSeats,
  } = useSiteSettingsStore();

  const [localCinema, setLocalCinema] = useState(cinemaName);
  const [localMax, setLocalMax] = useState(String(maxTicketsPerPerson));
  const [localHold, setLocalHold] = useState(String(seatHoldMinutes));
  const [localPrice, setLocalPrice] = useState(String(ticketPrice));
  const [localSeats, setLocalSeats] = useState(String(totalSeats));
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLocalCinema(cinemaName);
    setLocalMax(String(maxTicketsPerPerson));
    setLocalHold(String(seatHoldMinutes));
    setLocalPrice(String(ticketPrice));
    setLocalSeats(String(totalSeats));
  }, [cinemaName, maxTicketsPerPerson, seatHoldMinutes, ticketPrice, totalSeats]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setCinemaName(localCinema.trim() || 'Crystal Entertainment');
    setMaxTicketsPerPerson(Math.min(50, Math.max(1, Number(localMax) || 15)));
    setSeatHoldMinutes(Math.min(60, Math.max(1, Number(localHold) || 10)));
    setTicketPrice(Math.max(0, Number(localPrice) || 15.0));
    setTotalSeats(Math.max(1, Number(localSeats) || 438));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Cinema System Settings</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Brand: {brandName}. Change cinema name, uniform seat pricing, capacity info, and booking limits.
        </p>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-500 text-xs font-bold">
          Settings saved. Uniform seat price and ticket limits apply immediately.
        </div>
      )}

      <form onSubmit={handleSave} className="p-8 bg-card border border-border rounded-3xl space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Cinema Name</label>
            <input
              type="text"
              value={localCinema}
              onChange={(e) => setLocalCinema(e.target.value)}
              className="w-full py-2.5 px-3 bg-secondary text-foreground text-sm rounded-xl border border-border"
              placeholder="Crystal Entertainment"
            />
            <span className="text-[11px] text-muted-foreground mt-1 block">
              Shown on bookings and public pages.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Uniform Seat Price ($)</label>
            <input
              type="number"
              step="0.5"
              min={0}
              value={localPrice}
              onChange={(e) => setLocalPrice(e.target.value)}
              className="w-full py-2.5 px-3 bg-secondary text-foreground text-sm rounded-xl border border-border font-mono font-bold"
            />
            <span className="text-[11px] text-muted-foreground mt-1 block">
              All seats across every showtime share this uniform ticket price.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Number of Seats (capacity)</label>
            <input
              type="number"
              min={1}
              value={localSeats}
              onChange={(e) => setLocalSeats(e.target.value)}
              className="w-full py-2.5 px-3 bg-secondary text-foreground text-sm rounded-xl border border-border"
            />
            <span className="text-[11px] text-muted-foreground mt-1 block">
              Reference seat capacity. Use Screens admin for seat status.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Max Tickets Per Person</label>
            <input
              type="number"
              min={1}
              max={50}
              value={localMax}
              onChange={(e) => setLocalMax(e.target.value)}
              className="w-full py-2.5 px-3 bg-secondary text-foreground text-sm rounded-xl border border-border"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Seat Hold Duration (Minutes)</label>
            <input
              type="number"
              min={1}
              max={60}
              value={localHold}
              onChange={(e) => setLocalHold(e.target.value)}
              className="w-full py-2.5 px-3 bg-secondary text-foreground text-sm rounded-xl border border-border"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-border flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-lg shadow-primary/30"
          >
            <Save className="w-4 h-4" />
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
