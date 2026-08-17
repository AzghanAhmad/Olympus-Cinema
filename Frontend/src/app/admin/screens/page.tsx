'use client';

import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Save, Trash2 } from 'lucide-react';
import { toast } from '@/store/useToastStore';
import { adminApi, AdminSeat } from '@/services/adminApi';

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
    mutationFn: () => adminApi.screens.create({ name: newName || `Hall ${screens.length + 1}`, status: 'ACTIVE' }),
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
      const rows = [...new Set(seats.map((s) => s.row))];
      const row = rows[0] || 'A';
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
    const map = new Map<string, AdminSeat[]>();
    seats.forEach((s) => {
      const list = map.get(s.row) ?? [];
      list.push(s);
      map.set(s.row, list);
    });
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [seats]);

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
          <button onClick={() => addScreen.mutate()} className="px-4 py-2 bg-secondary text-xs font-bold rounded-xl inline-flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> Add screen
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {screens.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedId(s.id)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border ${s.id === screenId ? 'bg-primary text-white border-primary' : 'bg-card border-border'}`}
          >
            {s.name} ({s._count?.seats ?? s.capacity})
          </button>
        ))}
      </div>

      {seatsQ.isLoading && <p className="text-sm text-muted-foreground">Loading seats…</p>}
      {screensQ.error && <p className="text-sm text-rose-500">{(screensQ.error as Error).message}</p>}

      {selected && (
        <div className="p-6 bg-card border border-border rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold">{selected.name}</h2>
              <p className="text-xs text-muted-foreground">{seats.length} seats · {selected.status}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => addSeat.mutate()} className="px-3 py-2 bg-primary text-white text-xs font-bold rounded-xl inline-flex items-center gap-1">
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

          <div className="space-y-2 overflow-x-auto">
            {rows.map(([row, rowSeats]) => (
              <div key={row} className="flex items-center gap-2">
                <span className="w-8 text-[10px] font-extrabold text-muted-foreground">{row}</span>
                <div className="flex flex-wrap gap-1">
                  {rowSeats
                    .sort((a, b) => a.number - b.number)
                    .map((seat) => (
                      <button
                        key={seat.id}
                        title={`${seat.label} · ${seat.status}`}
                        onClick={() => toggleSeat.mutate(seat)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          if (confirm(`Delete seat ${seat.label}?`)) deleteSeat.mutate(seat.id);
                        }}
                        className={`w-7 h-7 rounded text-[9px] font-bold border ${
                          seat.status === 'DISABLED'
                            ? 'bg-zinc-900 text-zinc-500 opacity-40'
                            : seat.seatType === 'VIP'
                              ? 'bg-amber-500/20 border-amber-500/40'
                              : 'bg-secondary border-border'
                        }`}
                      >
                        {seat.number}
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground">Click a seat to enable/disable. Right-click to delete.</p>
        </div>
      )}
    </div>
  );
}
