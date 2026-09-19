'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Save, Upload, Film, Plus, Trash2 } from 'lucide-react';
import { toast } from '@/store/useToastStore';
import { adminApi, AdminMovie } from '@/services/adminApi';

export default function AdminSettingsPage() {
  const qc = useQueryClient();

  // 1. Site Settings
  const { data: settingsData, isLoading: settingsLoading, error: settingsError } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: () => adminApi.settings.get(),
  });

  // 2. Movie List (fetch featured / active movies to edit)
  const { data: moviesData, isLoading: moviesLoading } = useQuery({
    queryKey: ['admin', 'movies'],
    queryFn: () => adminApi.movies.list(),
  });

  const movies: AdminMovie[] = moviesData?.data ?? [];

  // Settings form states
  const [cinemaName, setCinemaName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [address, setAddress] = useState('');
  const [maxTickets, setMaxTickets] = useState('15');
  const [seatHold, setSeatHold] = useState('10');

  // Movie form states (selected movie to configure name, synopsis, images, genres, cast, crew, etc.)
  const [selectedMovieId, setSelectedMovieId] = useState<string>('');
  const [movieTitle, setMovieTitle] = useState('');
  const [movieTagline, setMovieTagline] = useState('');
  const [movieSynopsis, setMovieSynopsis] = useState('');
  const [movieGenre, setMovieGenre] = useState('');
  const [movieCast, setMovieCast] = useState('');
  const [movieDirector, setMovieDirector] = useState('');
  const [movieWriter, setMovieWriter] = useState('');
  const [moviePresentedBy, setMoviePresentedBy] = useState('');
  const [movieDuration, setMovieDuration] = useState('175');
  const [movieLanguage, setMovieLanguage] = useState('Dhivehi');
  const [movieAgeRating, setMovieAgeRating] = useState('18+');
  const [movieReleaseDate, setMovieReleaseDate] = useState('2026-10-26');
  const [moviePosterUrl, setMoviePosterUrl] = useState('');
  const [movieBackdropUrl, setMovieBackdropUrl] = useState('');
  const [movieTrailerUrl, setMovieTrailerUrl] = useState('');
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [newGalleryUrl, setNewGalleryUrl] = useState('');

  // Uploading states
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [uploadingBackdrop, setUploadingBackdrop] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const posterFileRef = useRef<HTMLInputElement>(null);
  const backdropFileRef = useRef<HTMLInputElement>(null);
  const galleryFileRef = useRef<HTMLInputElement>(null);

  // Initialize settings
  useEffect(() => {
    if (!settingsData?.data) return;
    const s = settingsData.data;
    setCinemaName(String(s.cinemaName ?? s.siteName ?? ''));
    setContactEmail(String(s.contactEmail ?? ''));
    setContactPhone(String(s.contactPhone ?? ''));
    setAddress(String(s.address ?? ''));
    setMaxTickets(String(s.maxTicketsPerPerson ?? 15));
    setSeatHold(String(s.seatHoldDuration ?? 10));
  }, [settingsData]);

  // Initialize selected movie
  useEffect(() => {
    if (movies.length > 0 && !selectedMovieId) {
      const featured = movies.find((m) => m.isFeatured) || movies[0];
      setSelectedMovieId(featured.id);
    }
  }, [movies, selectedMovieId]);

  // Populate movie inputs when selectedMovieId changes (fetch full movie details)
  useEffect(() => {
    if (!selectedMovieId) return;
    adminApi.movies.get(selectedMovieId).then((res) => {
      const target = res.data;
      if (!target) return;
      setMovieTitle(target.title || '');
      setMovieTagline(target.tagline || '');
      setMovieSynopsis(target.synopsis || '');
      setMoviePosterUrl(target.posterUrl || '');
      setMovieBackdropUrl(target.backdropUrl || '');
      setMovieTrailerUrl(target.trailerUrl || '');
      setMovieDuration(String(target.durationMinutes ?? 175));
      setMovieLanguage(target.language || 'Dhivehi');
      setMovieAgeRating(target.ageRating || '18+');
      setMovieReleaseDate(target.releaseDate ? target.releaseDate.slice(0, 10) : '2026-10-26');

      const genreNames = target.genres?.map((g) => g.name).join(', ') || '';
      setMovieGenre(genreNames);

      const castNames = target.cast?.map((c) => c.name).join('\n') || '';
      setMovieCast(castNames);

      const dir = target.crew?.find((cr) => cr.role.toLowerCase() === 'director')?.name || '';
      const wr = target.crew?.find((cr) => cr.role.toLowerCase() === 'writer')?.name || '';
      const pres = target.crew?.find((cr) => cr.role.toLowerCase().includes('present'))?.name || '';
      setMovieDirector(dir);
      setMovieWriter(wr);
      setMoviePresentedBy(pres);

      if (target.gallery && target.gallery.length > 0) {
        setGalleryUrls(target.gallery.map((g) => g.imageUrl));
      }
    }).catch(() => {
      // Fallback to list object if get fails
      const target = movies.find((m) => m.id === selectedMovieId);
      if (!target) return;
      setMovieTitle(target.title || '');
      setMovieTagline(target.tagline || '');
      setMovieSynopsis(target.synopsis || '');
      setMoviePosterUrl(target.posterUrl || '');
      setMovieBackdropUrl(target.backdropUrl || '');
      setMovieTrailerUrl(target.trailerUrl || '');
      setMovieDuration(String(target.durationMinutes ?? 175));
      setMovieLanguage(target.language || 'Dhivehi');
      setMovieAgeRating(target.ageRating || '18+');
      setMovieReleaseDate(target.releaseDate ? target.releaseDate.slice(0, 10) : '2026-10-26');
      if (target.genres) {
        setMovieGenre(target.genres.map((g) => g.name).join(', '));
      }
    });
  }, [selectedMovieId, movies]);

  // Mutation to save settings
  const saveSettingsMutation = useMutation({
    mutationFn: () =>
      adminApi.settings.update({
        cinemaName,
        siteName: cinemaName,
        contactEmail,
        contactPhone,
        address,
        maxTicketsPerPerson: Number(maxTickets),
        seatHoldDuration: Number(seatHold),
      }),
    onSuccess: () => {
      toast.success('Cinema settings saved');
      qc.invalidateQueries({ queryKey: ['admin', 'settings'] });
    },
    onError: (e: Error) => toast.error('Save failed', e.message),
  });

  // Mutation to save movie info and images
  const saveMovieMutation = useMutation({
    mutationFn: async () => {
      if (!selectedMovieId) return;

      const galleryPayload = galleryUrls.map((url, i) => ({
        imageUrl: url,
        displayOrder: i,
      }));

      // Parse genres
      const parsedGenres = movieGenre
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      // Parse cast (each line or comma separated)
      const parsedCast = movieCast
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean)
        .map((name, i) => ({
          name,
          characterName: i < 2 ? 'Lead Cast' : 'Cast',
          displayOrder: i + 1,
        }));

      // Parse crew
      const parsedCrew: Array<{ name: string; role: string; displayOrder: number }> = [];
      if (movieDirector.trim()) {
        parsedCrew.push({ name: movieDirector.trim(), role: 'Director', displayOrder: 1 });
      }
      if (movieWriter.trim()) {
        parsedCrew.push({ name: movieWriter.trim(), role: 'Writer', displayOrder: 2 });
      }
      if (moviePresentedBy.trim()) {
        parsedCrew.push({ name: moviePresentedBy.trim(), role: 'Presented By', displayOrder: 3 });
      }

      await adminApi.movies.update(selectedMovieId, {
        title: movieTitle,
        tagline: movieTagline,
        synopsis: movieSynopsis,
        durationMinutes: Number(movieDuration) || 175,
        language: movieLanguage,
        ageRating: movieAgeRating,
        releaseDate: new Date(movieReleaseDate).toISOString(),
        posterUrl: moviePosterUrl,
        backdropUrl: movieBackdropUrl,
        trailerUrl: movieTrailerUrl || undefined,
        genres: parsedGenres,
        cast: parsedCast,
        crew: parsedCrew,
        gallery: galleryPayload,
      });
    },
    onSuccess: () => {
      toast.success('Movie details & images saved');
      qc.invalidateQueries({ queryKey: ['admin', 'movies'] });
    },
    onError: (e: Error) => toast.error('Movie update failed', e.message),
  });

  // Handle image upload helper
  const handleUpload = async (
    file: File,
    type: 'poster' | 'backdrop' | 'gallery'
  ) => {
    try {
      if (type === 'poster') setUploadingPoster(true);
      if (type === 'backdrop') setUploadingBackdrop(true);
      if (type === 'gallery') setUploadingGallery(true);

      const res = await adminApi.uploads.image(file);
      const uploadedUrl = res.data.url;

      if (type === 'poster') setMoviePosterUrl(uploadedUrl);
      if (type === 'backdrop') setMovieBackdropUrl(uploadedUrl);
      if (type === 'gallery') setGalleryUrls((prev) => [...prev, uploadedUrl]);

      toast.success('Image uploaded successfully');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      toast.error('Upload failed', msg);
    } finally {
      if (type === 'poster') setUploadingPoster(false);
      if (type === 'backdrop') setUploadingBackdrop(false);
      if (type === 'gallery') setUploadingGallery(false);
    }
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await Promise.all([
        saveSettingsMutation.mutateAsync(),
        selectedMovieId ? saveMovieMutation.mutateAsync() : Promise.resolve(),
      ]);
      toast.success('All changes saved successfully');
    } catch {
      // toast shown in mutations
    }
  };

  return (
    <div className="max-w-4xl space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Settings & Customization</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Manage cinema branding, movie title, description, cover & backdrop images, and hall policies.
        </p>
      </div>

      {settingsLoading && <p className="text-sm text-muted-foreground">Loading settings…</p>}
      {settingsError && <p className="text-sm text-rose-500">{(settingsError as Error).message}</p>}

      <form onSubmit={handleSaveAll} className="space-y-8">
        {/* Movie Info & Images Section */}
        <div className="p-8 bg-card border border-border rounded-3xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Film className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-base">Movie Details & Media</h2>
                <p className="text-xs text-muted-foreground">
                  Change movie name, description, poster, and background images across the website.
                </p>
              </div>
            </div>

            {movies.length > 1 && (
              <select
                value={selectedMovieId}
                onChange={(e) => setSelectedMovieId(e.target.value)}
                className="py-1.5 px-3 bg-secondary text-xs rounded-xl border border-border font-bold"
              >
                {movies.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title} {m.isFeatured ? '(Featured)' : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Field
                label="Movie Title (displayed on all pages)"
                value={movieTitle}
                onChange={setMovieTitle}
                placeholder="e.g. Majnoon"
              />
            </div>

            <div className="sm:col-span-2">
              <Field
                label="Movie Tagline"
                value={movieTagline}
                onChange={setMovieTagline}
                placeholder="e.g. Brotherhood, faith, and sacrifice on Majnoon Island."
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold mb-1">Movie Synopsis / Description</label>
              <textarea
                rows={4}
                value={movieSynopsis}
                onChange={(e) => setMovieSynopsis(e.target.value)}
                placeholder="Detailed plot description..."
                className="w-full py-2.5 px-3 bg-secondary text-sm rounded-xl border border-border resize-none"
              />
            </div>

            <div className="sm:col-span-2">
              <Field
                label="Genre (comma-separated, e.g. Romance Thriller, Drama)"
                value={movieGenre}
                onChange={setMovieGenre}
                placeholder="Romance Thriller"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold mb-1">
                Casting / Actors (one actor name per line)
              </label>
              <textarea
                rows={4}
                value={movieCast}
                onChange={(e) => setMovieCast(e.target.value)}
                placeholder="AHMED SHARIF&#10;MARIYAM SHIFA&#10;AHMED EASA&#10;WASHIYA MOHAMED&#10;..."
                className="w-full py-2.5 px-3 bg-secondary text-sm rounded-xl border border-border font-mono text-xs"
              />
            </div>

            <Field
              label="Director"
              value={movieDirector}
              onChange={setMovieDirector}
              placeholder="e.g. Mohamed Faisal"
            />

            <Field
              label="Writer"
              value={movieWriter}
              onChange={setMovieWriter}
              placeholder="e.g. Fathimath Nahula"
            />

            <Field
              label="Presented By"
              value={moviePresentedBy}
              onChange={setMoviePresentedBy}
              placeholder="e.g. Crystal Entertainment"
            />

            <Field
              label="Duration (minutes, e.g. 175)"
              value={movieDuration}
              onChange={setMovieDuration}
              type="number"
              placeholder="175"
            />

            <Field
              label="Language"
              value={movieLanguage}
              onChange={setMovieLanguage}
              placeholder="Dhivehi"
            />

            <Field
              label="Age Rating"
              value={movieAgeRating}
              onChange={setMovieAgeRating}
              placeholder="18+"
            />

            <Field
              label="Release Date"
              value={movieReleaseDate}
              onChange={setMovieReleaseDate}
              type="date"
            />

            <div className="sm:col-span-2">
              <Field
                label="Trailer YouTube / Video URL"
                value={movieTrailerUrl}
                onChange={setMovieTrailerUrl}
                placeholder="https://www.youtube.com/embed/..."
              />
            </div>
          </div>

          {/* Media Images: Poster & Backdrop */}
          <div className="border-t border-border pt-6 space-y-6">
            <h3 className="text-sm font-extrabold tracking-tight">Movie Images & Artwork</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Poster Image */}
              <div className="space-y-3 p-4 rounded-2xl bg-secondary/30 border border-border">
                <label className="block text-xs font-bold">Poster Image (Portrait)</label>
                <div className="flex gap-4 items-start">
                  <div className="relative w-20 h-28 rounded-xl overflow-hidden bg-zinc-900 shrink-0 border border-border">
                    {moviePosterUrl ? (
                      <Image src={moviePosterUrl} alt="Poster preview" fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground text-center p-1">
                        No poster
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={moviePosterUrl}
                      onChange={(e) => setMoviePosterUrl(e.target.value)}
                      placeholder="/images/poster.jpg or https://..."
                      className="w-full py-2 px-3 bg-secondary text-xs rounded-xl border border-border"
                    />
                    <input
                      type="file"
                      ref={posterFileRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(file, 'poster');
                      }}
                    />
                    <button
                      type="button"
                      disabled={uploadingPoster}
                      onClick={() => posterFileRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-card hover:bg-secondary text-xs font-semibold rounded-xl border border-border shadow-xs transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {uploadingPoster ? 'Uploading…' : 'Upload new poster'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Backdrop / Cover Image */}
              <div className="space-y-3 p-4 rounded-2xl bg-secondary/30 border border-border">
                <label className="block text-xs font-bold">Backdrop / Cover Image (Home Banner)</label>
                <div className="flex gap-4 items-start">
                  <div className="relative w-28 h-20 rounded-xl overflow-hidden bg-zinc-900 shrink-0 border border-border">
                    {movieBackdropUrl ? (
                      <Image src={movieBackdropUrl} alt="Backdrop preview" fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground text-center p-1">
                        No backdrop
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={movieBackdropUrl}
                      onChange={(e) => setMovieBackdropUrl(e.target.value)}
                      placeholder="/images/backdrop.jpg or https://..."
                      className="w-full py-2 px-3 bg-secondary text-xs rounded-xl border border-border"
                    />
                    <input
                      type="file"
                      ref={backdropFileRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(file, 'backdrop');
                      }}
                    />
                    <button
                      type="button"
                      disabled={uploadingBackdrop}
                      onClick={() => backdropFileRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-card hover:bg-secondary text-xs font-semibold rounded-xl border border-border shadow-xs transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {uploadingBackdrop ? 'Uploading…' : 'Upload cover / backdrop'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Gallery Images */}
            <div className="space-y-3 p-4 rounded-2xl bg-secondary/30 border border-border">
              <label className="block text-xs font-bold">Gallery & Production Stills</label>
              
              <div className="flex flex-wrap gap-3">
                {galleryUrls.map((url, index) => (
                  <div key={index} className="relative w-24 h-16 rounded-lg overflow-hidden bg-zinc-900 border border-border group">
                    <Image src={url} alt={`Gallery image ${index + 1}`} fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => setGalleryUrls(galleryUrls.filter((_, i) => i !== index))}
                      className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-rose-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <input
                  type="text"
                  value={newGalleryUrl}
                  onChange={(e) => setNewGalleryUrl(e.target.value)}
                  placeholder="Paste additional image URL..."
                  className="flex-1 py-1.5 px-3 bg-secondary text-xs rounded-xl border border-border min-w-[200px]"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newGalleryUrl.trim()) {
                      setGalleryUrls((prev) => [...prev, newGalleryUrl.trim()]);
                      setNewGalleryUrl('');
                    }
                  }}
                  className="px-3 py-1.5 bg-secondary hover:bg-card text-xs font-bold rounded-xl border border-border inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add URL
                </button>
                <input
                  type="file"
                  ref={galleryFileRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(file, 'gallery');
                  }}
                />
                <button
                  type="button"
                  disabled={uploadingGallery}
                  onClick={() => galleryFileRef.current?.click()}
                  className="px-3 py-1.5 bg-card hover:bg-secondary text-xs font-semibold rounded-xl border border-border inline-flex items-center gap-1"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {uploadingGallery ? 'Uploading…' : 'Upload file'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Cinema & Booking Settings Section */}
        <div className="p-8 bg-card border border-border rounded-3xl space-y-4">
          <h2 className="font-extrabold text-base border-b border-border pb-3">Cinema General Settings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Cinema name" value={cinemaName} onChange={setCinemaName} />
            <Field label="Contact email" value={contactEmail} onChange={setContactEmail} />
            <Field label="Contact phone" value={contactPhone} onChange={setContactPhone} />
            <Field label="Address" value={address} onChange={setAddress} />
            <Field label="Max tickets per person" value={maxTickets} onChange={setMaxTickets} type="number" />
            <Field label="Seat hold minutes" value={seatHold} onChange={setSeatHold} type="number" />
          </div>
        </div>

        {/* Global Save Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saveSettingsMutation.isPending || saveMovieMutation.isPending}
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-95 shadow-md shadow-primary/30 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {saveSettingsMutation.isPending || saveMovieMutation.isPending ? 'Saving all…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full py-2.5 px-3 bg-secondary text-sm rounded-xl border border-border"
      />
    </div>
  );
}
