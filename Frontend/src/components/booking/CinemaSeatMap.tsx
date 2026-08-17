'use client';

import React from 'react';
import { Seat } from '@/types/screening';
import { useBookingStore } from '@/store/useBookingStore';
import { toast } from '@/store/useToastStore';
import { Accessibility } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getAisleAfter } from '@/data/seats';

interface CinemaSeatMapProps {
  seats: Seat[];
  /** Seat number after which the center aisle appears, per row label */
  aisleAfterByRow?: Record<string, number>;
}

export function CinemaSeatMap({ seats, aisleAfterByRow }: CinemaSeatMapProps) {
  const { selectedSeats, toggleSeat } = useBookingStore();

  const rows = Array.from(new Set(seats.map((s) => s.row))).sort();

  const handleSeatClick = (seat: Seat) => {
    if (seat.status !== 'AVAILABLE') return;
    const result = toggleSeat(seat);

    if (result === 'limit') return;
    if (result === 'deselected') {
      toast.info(`Seat ${seat.label || seat.id} Deselected`, 'Removed from booking cart');
    } else if (result === 'selected') {
      toast.success(`Seat ${seat.label || seat.id} Selected`, `$${seat.price}`);
    }
  };

  const getSeatColorClass = (seat: Seat, isSelected: boolean) => {
    if (seat.status === 'OCCUPIED') {
      return 'bg-zinc-700 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed border-zinc-700';
    }
    if (seat.status === 'RESERVED') {
      return 'bg-amber-900/40 text-amber-700 dark:text-amber-500 border-amber-600/40 cursor-not-allowed';
    }
    if (seat.status === 'DISABLED') {
      return 'bg-zinc-900 text-zinc-600 opacity-40 cursor-not-allowed border-transparent';
    }
    if (isSelected) {
      return 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/50 ring-2 ring-primary/40';
    }
    return 'bg-secondary text-foreground hover:bg-primary/20 border-border';
  };

  const currentPrice = seats[0]?.price ?? 15;

  return (
    <div className="w-full flex flex-col items-center space-y-6 py-4 overflow-x-auto">
      {/* Screen Indicator — closest to row A */}
      <div className="w-full max-w-3xl flex flex-col items-center space-y-2">
        <div className="w-full h-3 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full shadow-[0_8px_20px_rgba(229,9,20,0.5)] animate-pulse" />
        <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-muted-foreground">
          SCREEN
        </span>
      </div>

      {/* Seat Map Matrix — center aisle layout */}
      <div className="min-w-min space-y-1.5 p-4 bg-card/60 rounded-3xl border border-border backdrop-blur-xs">
        {rows.map((rowLetter) => {
          const rowSeats = seats.filter((s) => s.row === rowLetter).sort((a, b) => a.number - b.number);
          const aisleAfter = aisleAfterByRow?.[rowLetter] ?? getAisleAfter(rowLetter);

          return (
            <div key={rowLetter} className="flex items-center justify-center gap-1.5">
              <span className="w-5 text-center font-extrabold text-[10px] text-muted-foreground shrink-0">
                {rowLetter}
              </span>

              <div className="flex items-center gap-1">
                {rowSeats.map((seat) => {
                  const isSelected = selectedSeats.some((s) => s.id === seat.id);
                  const showAisle = seat.number === aisleAfter;

                  return (
                    <React.Fragment key={seat.id}>
                      <motion.button
                        whileHover={seat.status === 'AVAILABLE' ? { scale: 1.12 } : {}}
                        whileTap={seat.status === 'AVAILABLE' ? { scale: 0.9 } : {}}
                        animate={isSelected ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => handleSeatClick(seat)}
                        disabled={seat.status !== 'AVAILABLE'}
                        title={`${seat.id} - $${seat.price}`}
                        className={cn(
                          'w-6 h-6 sm:w-7 sm:h-7 rounded-md text-[9px] sm:text-[10px] font-extrabold border transition-all flex items-center justify-center shrink-0',
                          getSeatColorClass(seat, isSelected)
                        )}
                      >
                        {seat.number}
                      </motion.button>

                      {showAisle && (
                        <div className="w-5 sm:w-7 flex items-center justify-center shrink-0">
                          <span className="text-[9px] font-extrabold text-muted-foreground/70">
                            {rowLetter}
                          </span>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              <span className="w-5 text-center font-extrabold text-[10px] text-muted-foreground shrink-0">
                {rowLetter}
              </span>
            </div>
          );
        })}
      </div>

      <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-muted-foreground">
        ENTRANCE
      </span>

      {/* Seat Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-xs pt-1">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-secondary border border-border" />
          <span>Available Seat (${currentPrice.toFixed(2)})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary border border-primary shadow-sm" />
          <span className="font-bold text-primary">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-zinc-700 dark:bg-zinc-800 border border-zinc-600" />
          <span className="text-muted-foreground">Occupied / Reserved</span>
        </div>
      </div>
    </div>
  );
}
