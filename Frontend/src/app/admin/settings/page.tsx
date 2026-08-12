'use client';

import React, { useState } from 'react';
import { Save, Settings2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const [seatHoldTime, setSeatHoldTime] = useState('10');
  const [cinemaName, setCinemaName] = useState('Olympus Cinema Complex');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Cinema System Settings</h1>
        <p className="text-xs text-muted-foreground mt-1">Configure global venue parameters, seat hold timer, and contact defaults.</p>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-500 text-xs font-bold">
          System settings saved (Simulated).
        </div>
      )}

      <form onSubmit={handleSave} className="p-8 bg-card border border-border rounded-3xl space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Cinema Venue Brand Name</label>
            <input
              type="text"
              value={cinemaName}
              onChange={(e) => setCinemaName(e.target.value)}
              className="w-full py-2.5 px-3 bg-secondary text-foreground text-sm rounded-xl border border-border"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Temporary Seat Hold Duration (Minutes)</label>
            <input
              type="number"
              value={seatHoldTime}
              onChange={(e) => setSeatHoldTime(e.target.value)}
              className="w-full py-2.5 px-3 bg-secondary text-foreground text-sm rounded-xl border border-border"
            />
            <span className="text-[11px] text-muted-foreground mt-1 block">
              Time allocated to customers to select seats and complete guest info before releasing hold.
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-border flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold text-xs rounded-xl shadow-lg shadow-primary/30"
          >
            <Save className="w-4 h-4" />
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
