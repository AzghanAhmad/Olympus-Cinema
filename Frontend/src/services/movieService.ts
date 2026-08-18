import { apiFetch, ApiPaginated, ApiSuccess } from '@/lib/api';
import { Movie, MovieStatus } from '@/types/movie';

interface ApiGenre {
  id: string;
  name: string;
  slug?: string;
}

interface ApiMovie {
  id: string;
  title: string;
  slug: string;
  tagline?: string | null;
  synopsis: string;
  durationMinutes: number;
  language: string;
  releaseDate: string;
  ageRating: string;
  rating: number;
  posterUrl?: string | null;
  backdropUrl?: string | null;
  trailerUrl?: string | null;
  isFeatured?: boolean;
  genres?: ApiGenre[];
  cast?: Array<{
    id: string;
    name: string;
    characterName: string;
    imageUrl?: string | null;
  }>;
  crew?: Array<{ id: string; name: string; role: string; imageUrl?: string | null }>;
  gallery?: Array<{ id: string; imageUrl: string; altText?: string | null }>;
}

const DEFAULT_POSTER = '/images/majnoon-poster.jpg';
const DEFAULT_BACKDROP = '/images/majnoon-backdrop.jpeg';

function mapMovie(m: ApiMovie): Movie {
  const release = new Date(m.releaseDate);
  const status: MovieStatus =
    release <= new Date() ? 'NOW_SHOWING' : 'COMING_SOON';

  return {
    id: m.id,
    title: m.title,
    slug: m.slug,
    tagline: m.tagline || '',
    synopsis: m.synopsis,
    genre: (m.genres ?? []).map((g) => g.name),
    durationMinutes: m.durationMinutes,
    releaseDate: m.releaseDate.slice(0, 10),
    language: m.language,
    ageRating: m.ageRating,
    rating: m.rating,
    posterUrl: m.posterUrl || DEFAULT_POSTER,
    backdropUrl: m.backdropUrl || DEFAULT_BACKDROP,
    trailerUrl: m.trailerUrl || '',
    status,
    isFeatured: m.isFeatured,
    cast: (m.cast ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      character: c.characterName,
      image: c.imageUrl || DEFAULT_POSTER,
    })),
    crew: (m.crew ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      role: c.role,
    })),
    gallery: (m.gallery ?? []).map((g) => g.imageUrl),
  };
}

export const movieService = {
  async getMovies(): Promise<Movie[]> {
    try {
      const res = await apiFetch<ApiPaginated<ApiMovie>>(`/movies?limit=50`);
      return (res.data ?? []).map(mapMovie);
    } catch {
      return [];
    }
  },

  async getMovieBySlug(slug: string): Promise<Movie | null> {
    try {
      const res = await apiFetch<ApiSuccess<ApiMovie>>(`/movies/${slug}`);
      if (res.data) return mapMovie(res.data);
    } catch {
      /* ignore */
    }
    return null;
  },

  async getMovieById(id: string): Promise<Movie | null> {
    const movies = await this.getMovies();
    return movies.find((m) => m.id === id) ?? null;
  },

  async getNowShowing(): Promise<Movie[]> {
    try {
      const res = await apiFetch<ApiSuccess<ApiMovie[]>>('/movies/now-showing');
      return (res.data ?? []).map(mapMovie);
    } catch {
      return [];
    }
  },

  async getFeatured(): Promise<Movie[]> {
    try {
      const res = await apiFetch<ApiSuccess<ApiMovie[]>>('/movies/featured');
      return (res.data ?? []).map(mapMovie);
    } catch {
      return [];
    }
  },

  async getComingSoon(): Promise<Movie[]> {
    try {
      const res = await apiFetch<ApiSuccess<ApiMovie[]>>('/movies/coming-soon');
      return (res.data ?? []).map(mapMovie);
    } catch {
      return [];
    }
  },
};
