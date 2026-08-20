'use client';

import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Save, Trash2 } from 'lucide-react';
import { toast } from '@/store/useToastStore';
import { adminApi, AdminSeat } from '@/services/adminApi';
import { getAisleAfter } from '@/data/seats';
import { computeAisleAfterByRow } from '@/lib/seatLayout';
import { cn } from '@/lib/utils';
import { Seat } from '@/types/screening';

export default function AdminScreensPage() {
  const qc = useQueryClient();
  const screensQ = useQuery({
    queryKey: ['admin', 'screens'],
    queryFn: () => adminApi.screens.list(),
  });
  const screens = screensQ.data?.data ?? [];
  const [selectedId, setSelectedId] = useState<string>('');
  const screenId = selectedId || screens[0]?.id || '';

  const seatsQ = useQuery({
    queryKey: ['admin', 'seats', screenId],
    queryFn: () => adminApi.screens.seats(screenId),
    enabled: Boolean(screenId),
  });
  const seats = seatsQ.data?.data ?? [];

  const [newName, setNewName] = useState('');

  const addScreen = useMutation({
    mutationFn: () =>
      adminApi.screens.create({ name: newName || `Hall ${screens.length + 1}`, status: 'ACTIVE' }),
    onSuccess: (res) => {
      toast.success('Screen created');
      qc.invalidateQueries({ queryKey: ['admin', 'screens'] });
      setSelectedId(res.data.id);
      setNewName('');
    },
    onError: (e: Error) => toast.error('Could not add screen', e.message),
  });

  const deleteScreen = useMutation({
    mutationFn: () => adminApi.screens.remove(screenId),
    onSuccess: () => {
      toast.info('Screen deleted');
      setSelectedId('');
      qc.invalidateQueries({ queryKey: ['admin', 'screens'] });
    },
    onError: (e: Error) => toast.error('Delete failed', e.message),
  });

  const toggleSeat = useMutation({
    mutationFn: (seat: AdminSeat) =>
      adminApi.screens.updateSeat(screenId, seat.id, {
        status: seat.status === 'DISABLED' ? 'ACTIVE' : 'DISABLED',
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'seats', screenId] }),
    onError: (e: Error) => toast.error('Seat update failed', e.message),
  });

  const deleteSeat = useMutation({
    mutationFn: (seatId: string) => adminApi.screens.deleteSeat(screenId, seatId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'seats', screenId] }),
    onError: (e: Error) => toast.error('Could not delete seat', e.message),
  });

  const addSeat = useMutation({
    mutationFn: () => {
      const rowLabels = [...new Set(seats.map((s) => s.row))];
      const row = rowLabels[0] || 'A';
      const numbers = seats.filter((s) => s.row === row).map((s) => s.number);
      const number = (numbers.length ? Math.max(...numbers) : 0) + 1;
      return adminApi.screens.createSeat(screenId, {
        row,
        number,
        label: `${row}-${number}`,
        seatType: 'STANDARD',
        status: 'ACTIVE',
      });
    },
    onSuccess: () => {
      toast.success('Seat added');
      qc.invalidateQueries({ queryKey: ['admin', 'seats', screenId] });
      qc.invalidateQueries({ queryKey: ['admin', 'screens'] });
    },
    onError: (e: Error) => toast.error('Could not add seat', e.message),
  });

  const rows = useMemo(() => {
    return Array.from(new Set(seats.map((s) => s.row))).sort();
  }, [seats]);

  const aisleAfterByRow = useMemo(() => {
    const asSeats: Seat[] = seats.map((s) => ({
      id: s.id,
      row: s.row,
      number: s.number,
      category: 'STANDARD',
      price: 0,
      status: s.status === 'DISABLED' ? 'DISABLED' : 'AVAILABLE',
    }));
    const computed = computeAisleAfterByRow(asSeats);
    const result: Record<string, number> = {};
    for (const row of rows) {
      result[row] = getAisleAfter(row) || computed[row] || 0;
    }
    return result;
  }, [seats, rows]);

  const selected = screens.find((s) => s.id === screenId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Screens & Seats</h1>
          <p className="text-xs text-muted-foreground mt-1">Halls and seats stored in PostgreSQL.</p>
        </div>
        <div className="flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New hall name"
            className="px-3 py-2 bg-card text-xs rounded-xl border border-border"
          />
          <button
            onClick={() => addScreen.mutate()}
            className="px-4 py-2 bg-secondary text-xs font-bold rounded-xl inline-flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add screen
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {screens.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedId(s.id)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border ${
              s.id === screenId ? 'bg-primary text-white border-primary' : 'bg-card border-border'
            }`}
          >
            {s.name} ({s._count?.seats ?? s.capacity})
          </button>
        ))}
      </div>

      {seatsQ.isLoading && <p className="text-sm text-muted-foreground">Loading seats…</p>}
      {screensQ.error && (
        <p className="text-sm text-rose-500">{(screensQ.error as Error).message}</p>
      )}

      {selected && (
        <div className="p-6 bg-card border border-border rounded-3xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-extrabold">{selected.name}</h2>
              <p className="text-xs text-muted-foreground">
                {seats.length} seats · {selected.status}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => addSeat.mutate()}
                className="px-3 py-2 bg-primary text-white text-xs font-bold rounded-xl inline-flex items-center gap-1"
              >
                <Save className="w-3.5 h-3.5" /> Add seat
              </button>
              <button
                onClick={() => {
                  if (confirm('Delete this screen?')) deleteScreen.mutate();
                }}
                className="px-3 py-2 text-rose-500 text-xs font-bold rounded-xl inline-flex items-center gap-1 border border-rose-500/30"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete screen
              </button>
            </div>
          </div>

          {/* Same seat-chart format as the user booking panel */}
          <div className="w-full flex flex-col items-center space-y-6 py-4 overflow-x-auto">
            <div className="w-full max-w-3xl flex flex-col items-center space-y-2">
              <div className="w-full h-3 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full shadow-[0_8px_20px_rgba(229,9,20,0.5)]" />
              <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-muted-foreground">
                SCREEN
              </span>
            </div>

            <div className="min-w-min space-y-1.5 p-4 bg-card/60 rounded-3xl border border-border backdrop-blur-xs">
              {rows.map((rowLetter) => {
                const rowSeats = seats
                  .filter((s) => s.row === rowLetter)
                  .sort((a, b) => a.number - b.number);
                const aisleAfter = aisleAfterByRow[rowLetter] ?? getAisleAfter(rowLetter);

                return (
                  <div key={rowLetter} className="flex items-center justify-center gap-1.5">
                    <span className="w-5 text-center font-extrabold text-[10px] text-muted-foreground shrink-0">
                      {rowLetter}
                    </span>

                    <div className="flex items-center gap-1">
                      {rowSeats.map((seat) => {
                        const showAisle = seat.number === aisleAfter;
                        const isDisabled = seat.status === 'DISABLED';
                        const isVip = seat.seatType === 'VIP';

                        return (
                          <React.Fragment key={seat.id}>
                            <button
                              type="button"
                              title={`${seat.label} · ${seat.status} — click to toggle, right-click to delete`}
                              onClick={() => toggleSeat.mutate(seat)}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                if (confirm(`Delete seat ${seat.label}?`)) {
                                  deleteSeat.mutate(seat.id);
                                }
                              }}
                              className={cn(
                                'w-6 h-6 sm:w-7 sm:h-7 rounded-md text-[9px] sm:text-[10px] font-extrabold border transition-all flex items-center justify-center shrink-0',
                                isDisabled
                                  ? 'bg-zinc-900 text-zinc-600 opacity-40 border-transparent'
                                  : isVip
                                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/40 hover:bg-amber-500/30'
                                    : 'bg-secondary text-foreground border-border hover:bg-primary/20'
                              )}
                            >
                              {seat.number}
                            </button>

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

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs pt-1">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-secondary border border-border" />
                <span>Active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-amber-500/20 border border-amber-500/40" />
                <span>VIP</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-zinc-900 border border-zinc-700 opacity-40" />
                <span className="text-muted-foreground">Disabled</span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground text-center">
            Click a seat to enable/disable. Right-click to delete.
          </p>
        </div>
      )}
    </div>
  );
}
