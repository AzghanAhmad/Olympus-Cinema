'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { MOCK_MOVIES } from '@/data/movies';
import { Movie, MovieStatus } from '@/types/movie';
import { Plus, Search, Edit2, Trash2, X, Star } from 'lucide-react';
import { toast } from '@/store/useToastStore';

export default function AdminMoviesPage() {
  const [movies, setMovies] = useState<Movie[]>(MOCK_MOVIES);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);

  // Comprehensive Form State
  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    synopsis: '',
    genreInput: '',
    durationMinutes: 120,
    releaseDate: '2026-09-01',
    language: 'English',
    ageRating: 'PG-13',
    rating: 8.5,
    posterUrl: '',
    backdropUrl: '',
    trailerUrl: '',
    status: 'NOW_SHOWING' as MovieStatus,
  });

  const filtered = movies.filter((m) => m.title.toLowerCase().includes(search.toLowerCase()));

  const openAddModal = () => {
    setEditingMovie(null);
    setFormData({
      title: '',
      tagline: '',
      synopsis: '',
      genreInput: 'Action, Sci-Fi',
      durationMinutes: 120,
      releaseDate: new Date().toISOString().split('T')[0],
      language: 'English',
      ageRating: 'PG-13',
      rating: 8.5,
      posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1000&auto=format&fit=crop',
      backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1920&auto=format&fit=crop',
      trailerUrl: 'https://www.youtube.com/embed/Way9Dexny3w',
      status: 'NOW_SHOWING',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (movie: Movie) => {
    setEditingMovie(movie);
    setFormData({
      title: movie.title,
      tagline: movie.tagline || '',
      synopsis: movie.synopsis || '',
      genreInput: movie.genre.join(', '),
      durationMinutes: movie.durationMinutes || 120,
      releaseDate: movie.releaseDate || '2026-09-01',
      language: movie.language || 'English',
      ageRating: movie.ageRating || 'PG-13',
      rating: movie.rating || 8.0,
      posterUrl: movie.posterUrl || '',
      backdropUrl: movie.backdropUrl || '',
      trailerUrl: movie.trailerUrl || '',
      status: movie.status,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    const genresArr = formData.genreInput.split(',').map((g) => g.trim()).filter(Boolean);

    if (editingMovie) {
      // Update existing movie
      const updatedMovie: Movie = {
        ...editingMovie,
        title: formData.title,
        slug: formData.title.toLowerCase().replace(/\s+/g, '-'),
        tagline: formData.tagline,
        synopsis: formData.synopsis,
        genre: genresArr.length ? genresArr : ['Action'],
        durationMinutes: Number(formData.durationMinutes),
        releaseDate: formData.releaseDate,
        language: formData.language,
        ageRating: formData.ageRating,
        rating: Number(formData.rating),
        posterUrl: formData.posterUrl,
        backdropUrl: formData.backdropUrl,
        trailerUrl: formData.trailerUrl,
        status: formData.status,
      };

      setMovies(movies.map((m) => (m.id === editingMovie.id ? updatedMovie : m)));
      toast.success('Movie Updated', `"${formData.title}" updated successfully.`);
    } else {
      // Create new movie
      const newMovie: Movie = {
        id: `m-${Date.now()}`,
        title: formData.title,
        slug: formData.title.toLowerCase().replace(/\s+/g, '-'),
        tagline: formData.tagline,
        synopsis: formData.synopsis,
        genre: genresArr.length ? genresArr : ['Action'],
        durationMinutes: Number(formData.durationMinutes),
        releaseDate: formData.releaseDate,
        language: formData.language,
        ageRating: formData.ageRating,
        rating: Number(formData.rating),
        posterUrl: formData.posterUrl,
        backdropUrl: formData.backdropUrl,
        trailerUrl: formData.trailerUrl,
        status: formData.status,
        cast: [],
        crew: [],
        gallery: [],
      };

      setMovies([newMovie, ...movies]);
      toast.success('Movie Published', `"${formData.title}" added to catalog.`);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}" from catalog?`)) {
      setMovies(movies.filter((m) => m.id !== id));
      toast.info('Movie Deleted', `"${title}" removed from catalog.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Movie Catalog Management</h1>
          <p className="text-xs text-muted-foreground mt-1">Manage active films, trailers, cast lists, and poster images.</p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-bold text-xs rounded-xl shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Movie
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Filter movies by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-card text-foreground text-xs rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Movies Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-secondary/40 text-[11px] uppercase font-bold text-muted-foreground">
              <th className="p-4">Movie</th>
              <th className="p-4">Status</th>
              <th className="p-4">Genre</th>
              <th className="p-4">Rating</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs font-medium">
            {filtered.map((movie) => (
              <tr key={movie.id} className="hover:bg-secondary/20 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-14 rounded overflow-hidden bg-zinc-900 shrink-0 border border-border">
                      <Image src={movie.posterUrl} alt={movie.title} fill className="object-cover" />
                    </div>
                    <div>
                      <strong className="text-foreground text-sm block">{movie.title}</strong>
                      <span className="text-[10px] text-muted-foreground">{movie.durationMinutes} min • {movie.ageRating}</span>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${movie.status === 'NOW_SHOWING' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                    {movie.status}
                  </span>
                </td>
                <td className="p-4 text-muted-foreground">{movie.genre.join(', ')}</td>
                <td className="p-4 font-bold text-amber-400">★ {movie.rating}</td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => openEditModal(movie)} className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors" title="Edit Movie">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(movie.id, movie.title)} className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Comprehensive Add/Edit Movie Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-2xl w-full my-8 space-y-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-1.5 rounded-full text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-extrabold">{editingMovie ? 'Edit Film Details' : 'Add New Movie to Catalog'}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Fill in all required movie attributes, media links, and classification.</p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold mb-1">Movie Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Dune: Part Two"
                    className="w-full py-2.5 px-3 bg-secondary text-foreground text-xs rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Tagline</label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    placeholder="e.g. Long live the fighters."
                    className="w-full py-2.5 px-3 bg-secondary text-foreground text-xs rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Genres (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.genreInput}
                    onChange={(e) => setFormData({ ...formData, genreInput: e.target.value })}
                    placeholder="Sci-Fi, Action, Adventure"
                    className="w-full py-2.5 px-3 bg-secondary text-foreground text-xs rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold mb-1">Synopsis / Story Description</label>
                  <textarea
                    rows={3}
                    value={formData.synopsis}
                    onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
                    placeholder="Enter movie summary..."
                    className="w-full py-2.5 px-3 bg-secondary text-foreground text-xs rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Release Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as MovieStatus })}
                    className="w-full py-2.5 px-3 bg-secondary text-foreground text-xs rounded-xl border border-border"
                  >
                    <option value="NOW_SHOWING">Now Showing</option>
                    <option value="COMING_SOON">Coming Soon</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Rating (0 - 10)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                    className="w-full py-2.5 px-3 bg-secondary text-foreground text-xs rounded-xl border border-border"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })}
                    className="w-full py-2.5 px-3 bg-secondary text-foreground text-xs rounded-xl border border-border"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Age Rating</label>
                  <select
                    value={formData.ageRating}
                    onChange={(e) => setFormData({ ...formData, ageRating: e.target.value })}
                    className="w-full py-2.5 px-3 bg-secondary text-foreground text-xs rounded-xl border border-border"
                  >
                    <option value="G">G - General Audiences</option>
                    <option value="PG">PG - Parental Guidance</option>
                    <option value="PG-13">PG-13 - Parents Strongly Cautioned</option>
                    <option value="R">R - Restricted</option>
                    <option value="NC-17">NC-17 - Adult Only</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold mb-1">Poster Image URL / Upload Link</label>
                  <input
                    type="url"
                    value={formData.posterUrl}
                    onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full py-2.5 px-3 bg-secondary text-foreground text-xs rounded-xl border border-border"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold mb-1">Backdrop Image URL</label>
                  <input
                    type="url"
                    value={formData.backdropUrl}
                    onChange={(e) => setFormData({ ...formData, backdropUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full py-2.5 px-3 bg-secondary text-foreground text-xs rounded-xl border border-border"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold mb-1">YouTube Trailer Video Embed URL</label>
                  <input
                    type="url"
                    value={formData.trailerUrl}
                    onChange={(e) => setFormData({ ...formData, trailerUrl: e.target.value })}
                    placeholder="https://www.youtube.com/embed/..."
                    className="w-full py-2.5 px-3 bg-secondary text-foreground text-xs rounded-xl border border-border"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-secondary text-secondary-foreground font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary text-white font-bold text-xs rounded-xl shadow-lg shadow-primary/30"
                >
                  {editingMovie ? 'Save Changes' : 'Create & Publish Movie'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
