import { Movie } from '@/types/movie';

/** Single-film site: Majunoon only */
export const MAJUNOON_ID = 'm1';

export const MOCK_MOVIES: Movie[] = [
  {
    id: MAJUNOON_ID,
    title: 'Majunoon',
    slug: 'majunoon',
    tagline: 'A story that sets the heart on fire.',
    synopsis:
      'Majunoon is a passionate cinematic journey of love, destiny, and devotion. Experience the film exclusively at Olympus Cinema, presented by Crystal Entertainment.',
    genre: ['Drama', 'Romance'],
    durationMinutes: 155,
    releaseDate: '2026-08-15',
    language: 'Urdu / English Subtitles',
    ageRating: 'PG-13',
    rating: 8.6,
    posterUrl:
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1000&auto=format&fit=crop',
    backdropUrl:
      'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1920&auto=format&fit=crop',
    trailerUrl: 'https://www.youtube.com/embed/Way9Dexny3w',
    status: 'NOW_SHOWING',
    isFeatured: true,
    cast: [
      {
        id: 'c1',
        name: 'Lead Actor',
        character: 'Protagonist',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop',
      },
      {
        id: 'c2',
        name: 'Lead Actress',
        character: 'Love Interest',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&auto=format&fit=crop',
      },
    ],
    crew: [
      { id: 'cr1', name: 'Crystal Entertainment', role: 'Presented By' },
      { id: 'cr2', name: 'Olympus Cinema', role: 'Exclusive Venue' },
    ],
    gallery: [
      'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=1000&auto=format&fit=crop',
    ],
  },
];

export const MAJUNOON = MOCK_MOVIES[0];
