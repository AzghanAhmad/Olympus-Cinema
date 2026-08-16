'use client';

import React, { useState } from 'react';
import { MOCK_SCREENINGS } from '@/data/screenings';
import { MOCK_MOVIES } from '@/data/movies';
import { Screening } from '@/types/screening';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { toast } from '@/store/useToastStore';
import { useCinemaLayoutStore } from '@/store/useCinemaLayoutStore';

export default function AdminScreeningsPage() {
  const halls = useCinemaLayoutStore((s) => s.screens);
  const [screenings, setScreenings] = useState<Screening[]>(MOCK_SCREENINGS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScr, setEditingScr] = useState<Screening | null>(null);

  const [movieId, setMovieId] = useState(MOCK_MOVIES[0]?.id || '');
  const [hallId, setHallId] = useState(halls[0]?.id || '');
  const [startTime, setStartTime] = useState('19:30');
  const [date, setDate] = useState('2026-08-15');
  const [price, setPrice] = useState('15.00');

  const openAddModal = () => {
    setEditingScr(null);
    setMovieId(MOCK_MOVIES[0]?.id || '');
    setHallId(halls[0]?.id || '');
    setStartTime('19:30');
    setDate('2026-08-15');
    setPrice('15.00');
    setIsModalOpen(true);
  };

  const openEditModal = (scr: Screening) => {
    setEditingScr(scr);
    setMovieId(scr.movieId);
    setHallId(scr.hallId);
    setStartTime(scr.startTime);
    setDate(scr.date);
    setPrice(String(scr.price || 15.0));
    setIsModalOpen(true);
  };

  const handleSaveScreening = (e: React.FormEvent) => {
    e.preventDefault();
    const movie = MOCK_MOVIES.find((m) => m.id === movieId);
    const hall = halls.find((h) => h.id === hallId);

    if (!movie || !hall) return;

    const totalSeats = hall.rows.reduce((sum, r) => sum + r.left + r.right, 0);
    const numericPrice = Number(price) || 15.0;

    if (editingScr) {
      const updated: Screening = {
        ...editingScr,
        movieId: movie.id,
        hallId: hall.id,
        hallName: hall.name,
        screenType: hall.screenType,
        date,
        startTime,
        totalSeatsCount: totalSeats,
        price: numericPrice,
      };
      setScreenings(screenings.map((s) => (s.id === editingScr.id ? updated : s)));
      toast.success('Screening Updated', `Showtime for "${movie.title}" updated.`);
    } else {
      const newScr: Screening = {
        id: `scr-${Date.now()}`,
        movieId: movie.id,
        hallId: hall.id,
        hallName: hall.name,
        screenType: hall.screenType,
        date,
        startTime,
        endTime: '22:00',
        availableSeatsCount: totalSeats,
        totalSeatsCount: totalSeats,
        price: numericPrice,
      };
      setScreenings([newScr, ...screenings]);
      toast.success('Screening Scheduled', `Showtime for "${movie.title}" created.`);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this screening timetable entry?')) {
      setScreenings(screenings.filter((s) => s.id !== id));
      toast.info('Screening Deleted');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Screening Schedule Manager</h1>
          <p className="text-xs text-muted-foreground mt-1">Schedule Majnoon showtimes and seat ticket prices.</p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Schedule Showtimes
        </button>
      </div>

      {/* Screenings List */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-secondary/40 text-[11px] uppercase font-bold text-muted-foreground">
              <th className="p-4">Movie</th>
              <th className="p-4">Hall & Format</th>
              <th className="p-4">Date & Time</th>
              <th className="p-4">Seat Price</th>
              <th className="p-4">Occupancy</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs font-medium">
            {screenings.map((scr) => {
              const movie = MOCK_MOVIES.find((m) => m.id === scr.movieId);
              return (
                <tr key={scr.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="p-4 font-bold text-foreground">{movie?.title || 'Film'}</td>
                  <td className="p-4 text-muted-foreground">
                    <span className="font-extrabold text-primary block">{scr.screenType}</span>
                    {scr.hallName}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {formatDate(scr.date)} at <strong className="text-foreground">{scr.startTime}</strong>
                  </td>
                  <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">
                    ${(scr.price || 15.0).toFixed(2)}
                  </td>
                  <td className="p-4 font-bold text-foreground">
                    {scr.availableSeatsCount} / {scr.totalSeatsCount} Available
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => openEditModal(scr)} className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors" title="Edit Showtime">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(scr.id)} className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Schedule / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveScreening} className="bg-card border border-border rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-1 rounded-full text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-extrabold">{editingScr ? 'Edit Screening Showtime' : 'Schedule New Screening'}</h3>

            <div>
              <label className="block text-xs font-bold mb-1">Select Film</label>
              <select
                value={movieId}
                onChange={(e) => setMovieId(e.target.value)}
                className="w-full py-2.5 px-3 bg-secondary text-foreground text-xs rounded-xl border border-border"
              >
                {MOCK_MOVIES.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">Select Cinema</label>
              <select
                value={hallId}
                onChange={(e) => setHallId(e.target.value)}
                className="w-full py-2.5 px-3 bg-secondary text-foreground text-xs rounded-xl border border-border"
              >
                {halls.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.screenType})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">Uniform Seat Price ($)</label>
              <input
                type="number"
                step="0.5"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full py-2.5 px-3 bg-secondary text-foreground text-xs rounded-xl border border-border font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">Screening Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full py-2.5 px-3 bg-secondary text-foreground text-xs rounded-xl border border-border"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">Start Time (HH:MM)</label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="19:30"
                className="w-full py-2.5 px-3 bg-secondary text-foreground text-xs rounded-xl border border-border"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-secondary text-xs rounded-xl font-bold">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-primary text-white text-xs rounded-xl font-bold">
                {editingScr ? 'Save Changes' : 'Publish Showtime'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
