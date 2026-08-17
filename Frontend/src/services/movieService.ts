import { MOCK_MOVIES } from '@/data/movies';
import { Movie } from '@/types/movie';

export const movieService = {
  async getMovies(): Promise<Movie[]> {
    // Simulate network delay
    await new Promise((res) => setTimeout(res, 200));
    return MOCK_MOVIES;
  },

  async getMovieBySlug(slug: string): Promise<Movie | null> {
    await new Promise((res) => setTimeout(res, 150));
    return MOCK_MOVIES.find((m) => m.slug === slug) || null;
  },

  async getMovieById(id: string): Promise<Movie | null> {
    await new Promise((res) => setTimeout(res, 50));
    return MOCK_MOVIES.find((m) => m.id === id) || MOCK_MOVIES[0] || null;
  },

  async getNowShowing(): Promise<Movie[]> {
    await new Promise((res) => setTimeout(res, 150));
    return MOCK_MOVIES.filter((m) => m.status === 'NOW_SHOWING');
  },

  async getComingSoon(): Promise<Movie[]> {
    await new Promise((res) => setTimeout(res, 150));
    return MOCK_MOVIES.filter((m) => m.status === 'COMING_SOON');
  },
};
