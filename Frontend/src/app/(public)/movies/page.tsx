'use client';

import React, { useState } from 'react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { MovieCard } from '@/components/movie/MovieCard';
import { TrailerModal } from '@/components/movie/TrailerModal';
import { MOCK_MOVIES } from '@/data/movies';
import { Search, SlidersHorizontal, Film } from 'lucide-react';

export default function MoviesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'NOW_SHOWING' | 'COMING_SOON'>('ALL');
  const [selectedGenre, setSelectedGenre] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'rating' | 'releaseDate' | 'title'>('rating');
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);

  // Extract unique genres
  const allGenres = Array.from(new Set(MOCK_MOVIES.flatMap((m) => m.genre)));

  // Filter & Sort Logic
  const filteredMovies = MOCK_MOVIES.filter((movie) => {
    const matchesSearch =
      movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.genre.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL' || movie.status === statusFilter;

    const matchesGenre =
      selectedGenre === 'ALL' || movie.genre.includes(selectedGenre);

    return matchesSearch && matchesStatus && matchesGenre;
  }).sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'releaseDate') return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
    return a.title.localeCompare(b.title);
  });

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">Browse Cinema Catalog</h1>
          <p className="text-muted-foreground text-sm">
            Explore now showing releases, IMAX 3D exclusives, and upcoming blockbuster premieres.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 bg-card border border-border rounded-2xl shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Search Input */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by title, genre, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-secondary text-foreground text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full py-2.5 px-3 bg-secondary text-foreground text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="ALL">All Statuses</option>
                <option value="NOW_SHOWING">Now Showing</option>
                <option value="COMING_SOON">Coming Soon</option>
              </select>
            </div>

            {/* Genre Filter */}
            <div>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full py-2.5 px-3 bg-secondary text-foreground text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="ALL">All Genres</option>
                {allGenres.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sub Controls: Sort By */}
          <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50 gap-2">
            <span>Showing <strong>{filteredMovies.length}</strong> movies</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">Sort By:</span>
              <button
                onClick={() => setSortBy('rating')}
                className={`px-2.5 py-1 rounded-lg ${
                  sortBy === 'rating' ? 'bg-primary text-white font-bold' : 'hover:text-foreground'
                }`}
              >
                Top Rated
              </button>
              <button
                onClick={() => setSortBy('releaseDate')}
                className={`px-2.5 py-1 rounded-lg ${
                  sortBy === 'releaseDate' ? 'bg-primary text-white font-bold' : 'hover:text-foreground'
                }`}
              >
                Release Date
              </button>
              <button
                onClick={() => setSortBy('title')}
                className={`px-2.5 py-1 rounded-lg ${
                  sortBy === 'title' ? 'bg-primary text-white font-bold' : 'hover:text-foreground'
                }`}
              >
                Title (A-Z)
              </button>
            </div>
          </div>
        </div>

        {/* Movies Grid */}
        {filteredMovies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onWatchTrailer={(url) => setTrailerUrl(url)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card border border-border rounded-2xl space-y-3">
            <Film className="w-12 h-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-bold">No movies found</h3>
            <p className="text-xs text-muted-foreground">
              Try adjusting your search query or filter selection.
            </p>
          </div>
        )}
      </div>

      <TrailerModal videoUrl={trailerUrl} onClose={() => setTrailerUrl(null)} />
    </PublicLayout>
  );
}
