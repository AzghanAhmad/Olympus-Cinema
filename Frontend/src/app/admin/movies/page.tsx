'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react';
import { toast } from '@/store/useToastStore';
import { adminApi, AdminMovie } from '@/services/adminApi';
import { ApiError } from '@/lib/api';

export default function AdminMoviesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminMovie | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    synopsis: '',
    durationMinutes: 120,
    releaseDate: new Date().toISOString().slice(0, 10),
    language: 'English',
    ageRating: 'PG-13',
    rating: 8.5,
    posterUrl: '/images/majnoon-poster.jpg',
    backdropUrl: '/images/majnoon-backdrop.jpeg',
    trailerUrl: '',
    status: 'PUBLISHED',
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'movies', search],
    queryFn: () => adminApi.movies.list(search || undefined),
  });

  const movies = data?.data ?? [];

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body = {
        title: formData.title,
        tagline: formData.tagline,
        synopsis: formData.synopsis || formData.title,
        durationMinutes: Number(formData.durationMinutes),
        language: formData.language,
        releaseDate: new Date(formData.releaseDate).toISOString(),
        ageRating: formData.ageRating,
        rating: Number(formData.rating),
        posterUrl: formData.posterUrl,
        backdropUrl: formData.backdropUrl,
        trailerUrl: formData.trailerUrl || undefined,
        status: formData.status,
      };
      if (editing) return adminApi.movies.update(editing.id, body);
      return adminApi.movies.create(body);
    },
    onSuccess: () => {
      toast.success(editing ? 'Movie updated' : 'Movie created');
      qc.invalidateQueries({ queryKey: ['admin', 'movies'] });
      setIsModalOpen(false);
    },
    onError: (e: Error) => toast.error('Save failed', e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.movies.remove(id),
    onSuccess: () => {
      toast.info('Movie deleted');
      qc.invalidateQueries({ queryKey: ['admin', 'movies'] });
    },
    onError: (e: Error) => toast.error('Delete failed', e.message),
  });

  const openAdd = () => {
    setEditing(null);
    setFormData({
      title: '',
      tagline: '',
      synopsis: '',
      durationMinutes: 120,
      releaseDate: new Date().toISOString().slice(0, 10),
      language: 'English',
      ageRating: 'PG-13',
      rating: 8.5,
      posterUrl: '/images/majnoon-poster.jpg',
      backdropUrl: '/images/majnoon-backdrop.jpeg',
      trailerUrl: '',
      status: 'PUBLISHED',
    });
    setIsModalOpen(true);
  };

  const openEdit = (movie: AdminMovie) => {
    setEditing(movie);
    setFormData({
      title: movie.title,
      tagline: movie.tagline || '',
      synopsis: movie.synopsis || '',
      durationMinutes: movie.durationMinutes,
      releaseDate: movie.releaseDate.slice(0, 10),
      language: movie.language,
      ageRating: movie.ageRating,
      rating: movie.rating,
      posterUrl: movie.posterUrl || '',
      backdropUrl: movie.backdropUrl || '',
      trailerUrl: movie.trailerUrl || '',
      status: movie.status,
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Movie Catalog</h1>
          <p className="text-xs text-muted-foreground mt-1">Loaded from the cinema API.</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-bold text-xs rounded-xl"
        >
          <Plus className="w-4 h-4" /> Add Movie
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search movies..."
          className="w-full pl-9 pr-4 py-2 bg-card text-xs rounded-xl border border-border"
        />
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading movies…</p>}
      {error && (
        <p className="text-sm text-rose-500">
          {error instanceof ApiError ? error.message : 'Could not load movies from the API.'}
        </p>
      )}

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-secondary/40 text-[11px] uppercase font-bold text-muted-foreground">
              <th className="p-4">Movie</th>
              <th className="p-4">Status</th>
              <th className="p-4">Language</th>
              <th className="p-4">Rating</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs">
            {movies.map((movie) => (
              <tr key={movie.id} className="hover:bg-secondary/20">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-14 rounded overflow-hidden bg-zinc-900 shrink-0">
                      {movie.posterUrl && (
                        <Image src={movie.posterUrl} alt={movie.title} fill className="object-cover" />
                      )}
                    </div>
                    <div>
                      <strong className="block">{movie.title}</strong>
                      <span className="text-[10px] text-muted-foreground">
                        {movie.durationMinutes} min · {movie.ageRating}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="p-4 font-bold">{movie.status}</td>
                <td className="p-4 text-muted-foreground">{movie.language}</td>
                <td className="p-4 text-amber-400 font-bold">★ {movie.rating}</td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => openEdit(movie)} className="p-1.5 text-primary">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${movie.title}"?`)) deleteMutation.mutate(movie.id);
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
            className="bg-card border border-border rounded-3xl p-6 max-w-2xl w-full space-y-4 relative"
          >
            <button type="button" onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-extrabold">{editing ? 'Edit movie' : 'Add movie'}</h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Title"
                className="col-span-2 py-2 px-3 bg-secondary text-xs rounded-xl border border-border"
              />
              <textarea
                required
                value={formData.synopsis}
                onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
                placeholder="Synopsis"
                className="col-span-2 py-2 px-3 bg-secondary text-xs rounded-xl border border-border"
              />
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="py-2 px-3 bg-secondary text-xs rounded-xl border border-border"
              >
                <option value="DRAFT">DRAFT</option>
                <option value="PUBLISHED">PUBLISHED</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
              <input
                type="date"
                value={formData.releaseDate}
                onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                className="py-2 px-3 bg-secondary text-xs rounded-xl border border-border"
              />
              <input
                type="number"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                className="py-2 px-3 bg-secondary text-xs rounded-xl border border-border"
              />
              <input
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="py-2 px-3 bg-secondary text-xs rounded-xl border border-border"
              />
              <input
                value={formData.posterUrl}
                onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                placeholder="Poster URL"
                className="col-span-2 py-2 px-3 bg-secondary text-xs rounded-xl border border-border"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-secondary text-xs rounded-xl font-bold">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-primary text-white text-xs rounded-xl font-bold">
                {saveMutation.isPending ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
