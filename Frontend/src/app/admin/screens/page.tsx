'use client';

import React, { useState } from 'react';
import { MOCK_HALLS } from '@/data/screenings';
import { generateMockSeats, getAisleAfter } from '@/data/seats';
import { Seat, SeatCategory } from '@/types/screening';

export default function AdminScreensPage() {
  const [selectedHallId, setSelectedHallId] = useState(MOCK_HALLS[0].id);
  const [seats, setSeats] = useState<Seat[]>(generateMockSeats(selectedHallId));
  const [selectedSeatCategory, setSelectedSeatCategory] = useState<SeatCategory>('VIP');

  const selectedHall = MOCK_HALLS.find((h) => h.id === selectedHallId) || MOCK_HALLS[0];

  const handleSeatClick = (seatId: string) => {
    setSeats((prev) =>
      prev.map((s) => {
        if (s.id === seatId) {
          const nextStatus = s.status === 'DISABLED' ? 'AVAILABLE' : 'DISABLED';
          return { ...s, status: nextStatus };
        }
        return s;
      })
    );
  };

  const handleApplyCategoryToRow = (rowLetter: string) => {
    setSeats((prev) =>
      prev.map((s) => (s.row === rowLetter ? { ...s, category: selectedSeatCategory } : s))
    );
  };

  const rows = Array.from(new Set(seats.map((s) => s.row))).sort();

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Interactive Seat Map & Hall Editor</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Configure seat categories (VIP, Premium, Standard), enable/disable damaged seats, and edit auditoriums.
          </p>
        </div>

        {/* Hall Selector */}
        <select
          value={selectedHallId}
          onChange={(e) => {
            setSelectedHallId(e.target.value);
            setSeats(generateMockSeats(e.target.value));
          }}
          className="py-2.5 px-4 bg-card text-foreground font-bold text-xs rounded-xl border border-border focus:outline-none"
        >
          {MOCK_HALLS.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name} ({h.screenType})
            </option>
          ))}
        </select>
      </div>

      {/* Editor Main Canvas */}
      <div className="p-8 bg-card border border-border rounded-3xl space-y-8 shadow-sm">
        
        {/* Top Control Tools Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-secondary/40 rounded-2xl border border-border text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-foreground">Active Seat Category Tool:</span>
            <button
              onClick={() => setSelectedSeatCategory('STANDARD')}
              className={`px-3 py-1.5 rounded-lg font-bold ${
                selectedSeatCategory === 'STANDARD' ? 'bg-secondary text-foreground border border-border' : 'text-muted-foreground'
              }`}
            >
              Standard
            </button>
            <button
              onClick={() => setSelectedSeatCategory('PREMIUM')}
              className={`px-3 py-1.5 rounded-lg font-bold ${
                selectedSeatCategory === 'PREMIUM' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40' : 'text-muted-foreground'
              }`}
            >
              Premium
            </button>
            <button
              onClick={() => setSelectedSeatCategory('VIP')}
              className={`px-3 py-1.5 rounded-lg font-bold ${
                selectedSeatCategory === 'VIP' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'text-muted-foreground'
              }`}
            >
              VIP Suite
            </button>
          </div>

          <span className="text-muted-foreground">Click individual seats to toggle <strong>Active / Disabled</strong> maintenance state.</span>
        </div>

        {/* Screen Indicator */}
        <div className="w-full max-w-xl mx-auto flex flex-col items-center space-y-2">
          <div className="w-full h-2.5 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full shadow-[0_4px_15px_rgba(229,9,20,0.5)]" />
          <span className="text-[9px] font-bold tracking-[0.3em] text-muted-foreground">PROJECTION SCREEN</span>
        </div>

        {/* Interactive Editor Matrix — Olympus center-aisle layout */}
        <div className="space-y-1.5 flex flex-col items-center overflow-x-auto pb-2">
          {rows.map((rowLetter) => {
            const rowSeats = seats
              .filter((s) => s.row === rowLetter)
              .sort((a, b) => a.number - b.number);
            const aisleAfter = getAisleAfter(rowLetter);

            return (
              <div key={rowLetter} className="flex items-center gap-2 min-w-min">
                <button
                  onClick={() => handleApplyCategoryToRow(rowLetter)}
                  className="w-14 py-1 bg-secondary hover:bg-primary hover:text-primary-foreground rounded text-[10px] font-bold text-muted-foreground transition-colors shrink-0"
                  title={`Click to convert Row ${rowLetter} to ${selectedSeatCategory}`}
                >
                  Row {rowLetter}
                </button>

                <div className="flex items-center gap-1">
                  {rowSeats.map((seat) => (
                    <React.Fragment key={seat.id}>
                      <button
                        onClick={() => handleSeatClick(seat.id)}
                        className={`w-6 h-6 sm:w-7 sm:h-7 rounded-md text-[9px] font-bold border transition-all ${
                          seat.status === 'DISABLED'
                            ? 'bg-zinc-900 text-zinc-600 border-zinc-800 line-through opacity-40'
                            : seat.category === 'VIP'
                            ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/40'
                            : seat.category === 'PREMIUM'
                            ? 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border-indigo-500/40'
                            : 'bg-secondary text-foreground border-border'
                        }`}
                      >
                        {seat.number}
                      </button>
                      {seat.number === aisleAfter && (
                        <div className="w-5 sm:w-7 flex items-center justify-center shrink-0">
                          <span className="text-[9px] font-extrabold text-muted-foreground/70">
                            {rowLetter}
                          </span>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
