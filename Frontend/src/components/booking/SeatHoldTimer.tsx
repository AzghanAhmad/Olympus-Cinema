'use client';

import React, { useEffect, useState } from 'react';
import { useBookingStore } from '@/store/useBookingStore';
import { Clock, AlertTriangle } from 'lucide-react';

export function SeatHoldTimer() {
  const { holdExpiresAt, resetBooking } = useBookingStore();
  const [timeLeft, setTimeLeft] = useState<string>('10:00');
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    if (!holdExpiresAt) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((holdExpiresAt - Date.now()) / 1000));
      const mins = Math.floor(remaining / 60);
      const secs = remaining % 60;

      setTimeLeft(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      setIsWarning(remaining < 180);

      if (remaining === 0) {
        clearInterval(interval);
        resetBooking();
        alert('Your seat hold session has expired. Please re-select your seats.');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [holdExpiresAt, resetBooking]);

  if (!holdExpiresAt) return null;

  return (
    <div
      className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors ${
        isWarning
          ? 'bg-primary text-white animate-pulse'
          : 'bg-primary/10 text-primary border border-primary/20'
      }`}
    >
      {isWarning ? <AlertTriangle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
      <span>Seats Held: {timeLeft}</span>
    </div>
  );
}
