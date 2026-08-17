'use client';

import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { toast } from '@/store/useToastStore';
import { adminApi, AdminScreening } from '@/services/adminApi';
import { formatDate } from '@/lib/utils';

export default function AdminScreeningsPage() {
  const qc = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminScreening | null>(null);
  const [movieId, setMovieId] = useState('');
  const [screenId, setScreenId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const screeningsQ = useQuery({
    queryKey: ['admin', 'screenings'],
    queryFn: () => adminApi.screenings.list(),
  });
  const moviesQ = useQuery({
    queryKey: ['admin', 'movies'],
    queryFn: () => adminApi.movies.list(),
  });
  const screensQ = useQuery({
    queryKey: ['admin', 'screens'],
    queryFn: () => adminApi.screens.list(),
  });

  const screenings = screeningsQ.data?.data ?? [];
  const movies = moviesQ.data?.data ?? [];
  const screens = screensQ.data?.data ?? [];

  const saveMutation = useMutation({
    mutationFn: () => {
      const body = { movieId, screenId, startTime: new Date(startTime).toISOString(), endTime: new Date(endTime).toISOString() };
      if (editing) return adminApi.screenings.update(editing.id, body);
      return adminApi.screenings.create(body);
    },
    onSuccess: () => {
      toast.success(editing ? 'Screening updated' : 'Screening created');
      qc.invalidateQueries({ queryKey: ['admin', 'screenings'] });
      setIsModalOpen(false);
    },
    onError: (e: Error) => toast.error('Save failed', e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.screenings.remove(id),
    onSuccess: () => {
      toast.info('Screening deleted');
      qc.invalidateQueries({ queryKey: ['admin', 'screenings'] });
    },
    onError: (e: Error) => toast.error('Delete failed', e.message),
  });

  const openAdd = () => {
    setEditing(null);
    setMovieId(movies[0]?.id || '');
    setScreenId(screens[0]?.id || '');
    const start = new Date();
    start.setHours(19, 30, 0, 0);
    const end = new Date(start.getTime() + 2.5 * 3600000);
    setStartTime(toLocalInput(start));
    setEndTime(toLocalInput(end));
    setIsModalOpen(true);
  };

  const openEdit = (scr: AdminScreening) => {
    setEditing(scr);
    setMovieId(scr.movieId);
    setScreenId(scr.screenId);
    setStartTime(toLocalInput(new Date(scr.startTime)));
    setEndTime(toLocalInput(new Date(scr.endTime)));
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Screenings</h1>
          <p className="text-xs text-muted-foreground mt-1">Showtimes from PostgreSQL. Overlaps are blocked by the API.</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-xl">
          <Plus className="w-4 h-4" /> Schedule showtime
        </button>
      </div>

      {screeningsQ.isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {screeningsQ.error && <p className="text-sm text-rose-500">{(screeningsQ.error as Error).message}</p>}

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-secondary/40 text-[11px] uppercase font-bold text-muted-foreground">
              <th className="p-4">Movie</th>
              <th className="p-4">Screen</th>
              <th className="p-4">Start</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {screenings.map((scr) => (
              <tr key={scr.id}>
                <td className="p-4 font-bold">{scr.movie?.title || scr.movieId}</td>
                <td className="p-4">{scr.screen?.name}</td>
                <td className="p-4">{formatDate(scr.startTime)} · {new Date(scr.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                <td className="p-4 font-bold">{scr.status}</td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => openEdit(scr)} className="p-1.5 text-primary"><Edit2 className="w-4 h-4" /></button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this screening?')) deleteMutation.mutate(scr.id);
                    }}
                    className="p-1.5 text-rose-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveMutation.mutate();
            }}
            className="bg-card border border-border rounded-3xl p-6 max-w-md w-full space-y-4 relative"
          >
            <button type="button" onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-extrabold">{editing ? 'Edit screening' : 'New screening'}</h3>
            <select value={movieId} onChange={(e) => setMovieId(e.target.value)} className="w-full py-2 px-3 bg-secondary text-xs rounded-xl border border-border">
              {movies.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>
            <select value={screenId} onChange={(e) => setScreenId(e.target.value)} className="w-full py-2 px-3 bg-secondary text-xs rounded-xl border border-border">
              {screens.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <label className="block text-xs font-bold">Start
              <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="mt-1 w-full py-2 px-3 bg-secondary text-xs rounded-xl border border-border" />
            </label>
            <label className="block text-xs font-bold">End
              <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="mt-1 w-full py-2 px-3 bg-secondary text-xs rounded-xl border border-border" />
            </label>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-secondary text-xs rounded-xl font-bold">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-primary text-white text-xs rounded-xl font-bold">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function toLocalInput(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
