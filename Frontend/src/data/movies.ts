import { Movie } from '@/types/movie';

/** Single-film site: Majnoon only (2024) */
export const MAJNOON_ID = 'm1';

const POSTER = '/images/majnoon-poster.jpg';
const BACKDROP = '/images/majnoon-backdrop.jpeg';
const CAST_GROUP = '/images/majnoon-cast.jpg';

export const MOCK_MOVIES: Movie[] = [
  {
    id: MAJNOON_ID,
    title: 'Majunoon',
    slug: 'majnoon',
    tagline: 'Love can save you or destroy you',
    synopsis:
      'Fifteen years after a tragic incident shattered two young lives, Laana returns the the life where ghosts of her past still linger. There, she comes face to face with Aayan—a man who never stopped loving her.\n\nOnce gentle and full of promise, Aayan has spent years haunted by childhood trauma, wrongful imprisonment, and devastating loss. Unable to escape his painful memories, he retreats into a fractured reality where love and obsession become impossible to separate. In his mind, Laana is no longer just the woman he lost—she is the only thing keeping him alive.',
    genre: ['Romance Thriller'],
    durationMinutes: 175,
    releaseDate: '2026-10-26',
    language: 'Dhivehi',
    ageRating: '18+',
    rating: 0,
    posterUrl: POSTER,
    backdropUrl: BACKDROP,
    trailerUrl: 'https://www.youtube.com/embed/sWE0jjKHQXo',
    status: 'NOW_SHOWING',
    isFeatured: true,
    cast: [
      { id: 'c1', name: 'AHMED SHARIF', character: 'Lead Cast', image: POSTER },
      { id: 'c2', name: 'MARIYAM SHIFA', character: 'Lead Cast', image: CAST_GROUP },
      { id: 'c3', name: 'AHMED EASA', character: 'Cast', image: CAST_GROUP },
      { id: 'c4', name: 'WASHIYA MOHAMED', character: 'Cast', image: CAST_GROUP },
      { id: 'c5', name: 'AYESHA LAYALI SINAN', character: 'Cast', image: CAST_GROUP },
      { id: 'c6', name: 'EVELIN LIVY FIRASH', character: 'Cast', image: CAST_GROUP },
      { id: 'c7', name: 'SAAMEE HUSSAIN DIDI', character: 'Cast', image: CAST_GROUP },
      { id: 'c8', name: 'ALI AZIM', character: 'Cast', image: CAST_GROUP },
    ],
    crew: [
      { id: 'cr1', name: 'Mohamed Faisal', role: 'Director' },
      { id: 'cr2', name: 'Fathimath Nahula', role: 'Writer' },
      { id: 'cr3', name: 'Crystal Entertainment', role: 'Presented By' },
    ],
    gallery: [BACKDROP, CAST_GROUP, POSTER],
  },
];

export const MAJNOON = MOCK_MOVIES[0];
