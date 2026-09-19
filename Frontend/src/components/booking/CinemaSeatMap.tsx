'use client';

import React from 'react';
import { Seat } from '@/types/screening';
import { useBookingStore } from '@/store/useBookingStore';
import { toast } from '@/store/useToastStore';
import { Accessibility } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn, formatCurrency } from '@/lib/utils';
import { getAisleAfter } from '@/data/seats';

interface CinemaSeatMapProps {
  seats: Seat[];
  /** Seat number after which the center aisle appears, per row label */
  aisleAfterByRow?: Record<string, number>;
}

export function CinemaSeatMap({ seats, aisleAfterByRow }: CinemaSeatMapProps) {
  const { selectedSeats, toggleSeat } = useBookingStore();
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const isDraggingRef = React.useRef(false);
  const startXRef = React.useRef(0);
  const scrollLeftRef = React.useRef(0);

  // Center the seat map initially on mobile so both wings are accessible
  React.useEffect(() => {
    const el = scrollContainerRef.current;
    if (el && el.scrollWidth > el.clientWidth) {
      el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
    }
  }, [seats]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    isDraggingRef.current = true;
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftRef.current = el.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const el = scrollContainerRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    el.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
  };

  // Display rows from Screen (top) down to Entrance (bottom): U -> A
  const rows = Array.from(new Set(seats.map((s) => s.row)))
    .sort()
    .reverse();

  const handleSeatClick = (seat: Seat) => {
    if (seat.status !== 'AVAILABLE') return;
    const result = toggleSeat(seat);

    if (result === 'limit') return;
    if (result === 'deselected') {
      toast.info(`Seat ${seat.label || seat.id} Deselected`, 'Removed from booking cart');
    } else if (result === 'selected') {
      toast.success(`Seat ${seat.label || seat.id} Selected`, 'Added to booking cart');
    }
  };

  const getSeatColorClass = (seat: Seat, isSelected: boolean) => {
    if (seat.status === 'OCCUPIED') {
      return 'bg-rose-950/80 dark:bg-rose-950/90 text-rose-300/60 cursor-not-allowed border-rose-900/50 shadow-inner';
    }
    if (seat.status === 'RESERVED') {
      return 'bg-amber-950/80 dark:bg-amber-950/90 text-amber-300/60 border-amber-900/50 cursor-not-allowed shadow-inner';
    }
    if (seat.status === 'DISABLED') {
      return 'bg-zinc-900 text-zinc-600 opacity-40 cursor-not-allowed border-transparent';
    }
    if (isSelected) {
      return 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/50 ring-2 ring-primary/40';
    }
    return 'bg-secondary text-foreground hover:bg-primary/20 border-border';
  };

  const getSeatTitle = (seat: Seat, isSelected: boolean) => {
    const seatName = seat.label || seat.id;
    if (seat.status === 'OCCUPIED') {
      return `Seat ${seatName} — OCCUPIED (Cannot be booked)`;
    }
    if (seat.status === 'RESERVED') {
      return `Seat ${seatName} — RESERVED (Unavailable for booking)`;
    }
    if (seat.status === 'DISABLED') {
      return `Seat ${seatName} — DISABLED`;
    }
    if (isSelected) {
      return `Seat ${seatName} — SELECTED`;
    }
    return `Seat ${seatName} — AVAILABLE`;
  };

  const currentPrice = seats[0]?.price ?? 15;

  return (
    <div className="w-full flex flex-col items-center space-y-4 py-2">
      {/* Mobile drag helper instruction */}
      <div className="sm:hidden flex items-center gap-1.5 px-3 py-1 bg-secondary/80 text-muted-foreground text-[11px] font-semibold rounded-full border border-border">
        <span>↔ Drag left & right to view all seats</span>
      </div>

      {/* Screen Indicator — closest to row A */}
      <div className="w-full max-w-3xl flex flex-col items-center space-y-2">
        <div className="w-full h-3 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full shadow-[0_8px_20px_rgba(229,9,20,0.5)] animate-pulse" />
        <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-muted-foreground">
          SCREEN
        </span>
      </div>

      {/* Horizontally draggable container */}
      <div
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        className="w-full overflow-x-auto pb-4 pt-1 cursor-grab active:cursor-grabbing select-none scrollbar-thin"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {/* Seat Map Matrix — center aisle layout */}
        <div className="min-w-max mx-auto space-y-1.5 px-6 py-4 bg-card/60 rounded-3xl border border-border backdrop-blur-xs w-fit">
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
                        whileTap={seat.status === 'AVAILABLE' ? { scale: 0.9 } : { scale: 1 }}
                        animate={isSelected ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => handleSeatClick(seat)}
                        disabled={seat.status !== 'AVAILABLE'}
                        title={getSeatTitle(seat, isSelected)}
                        className={cn(
                          'w-6 h-6 sm:w-7 sm:h-7 rounded-md text-[9px] sm:text-[10px] font-extrabold border transition-all flex items-center justify-center shrink-0 relative group',
                          getSeatColorClass(seat, isSelected)
                        )}
                      >
                        {seat.number}
                      </motion.button>

                      {/* On row A, seats 1-8 are left, then 2 empty spaces matching B-9, B-10, then aisle, then 2 empty spaces matching B-11, B-12, then seats 9-16 */}
                      {rowLetter === 'A' && seat.number === 8 && (
                        <>
                          <div className="w-6 h-6 sm:w-7 sm:h-7 shrink-0 invisible pointer-events-none" aria-hidden="true" />
                          <div className="w-6 h-6 sm:w-7 sm:h-7 shrink-0 invisible pointer-events-none" aria-hidden="true" />
                        </>
                      )}

                      {showAisle && (
                        <div className="w-5 sm:w-7 flex items-center justify-center shrink-0">
                          <span className="text-[9px] font-extrabold text-muted-foreground/70">
                            {rowLetter}
                          </span>
                        </div>
                      )}

                      {rowLetter === 'A' && seat.number === 8 && (
                        <>
                          <div className="w-6 h-6 sm:w-7 sm:h-7 shrink-0 invisible pointer-events-none" aria-hidden="true" />
                          <div className="w-6 h-6 sm:w-7 sm:h-7 shrink-0 invisible pointer-events-none" aria-hidden="true" />
                        </>
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
      </div>

      <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-muted-foreground">
        ENTRANCE
      </span>

      {/* Seat Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-xs pt-1">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-secondary border border-border" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary border border-primary shadow-sm" />
          <span className="font-bold text-primary">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-rose-950/80 border border-rose-900/50" />
          <span className="text-muted-foreground">Occupied (Cannot be booked)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-950/80 border border-amber-900/50" />
          <span className="text-muted-foreground">Reserved</span>
        </div>
      </div>
    </div>
  );
}
