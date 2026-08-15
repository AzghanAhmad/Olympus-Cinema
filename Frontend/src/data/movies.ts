import { Movie } from '@/types/movie';

/** Single-film site: Majnoon only (2024) */
export const MAJNOON_ID = 'm1';

const POSTER = '/images/majnoon-poster.jpg';
const BACKDROP = '/images/majnoon-backdrop.jpg';
const CAST_GROUP = '/images/majnoon-cast.jpg';

export const MOCK_MOVIES: Movie[] = [
  {
    id: MAJNOON_ID,
    title: 'Majnoon',
    slug: 'majnoon',
    tagline: 'Brotherhood, faith, and sacrifice on Majnoon Island.',
    synopsis:
      'Directed by Mehdi Shamohammadi, Majnoon centers on the courageous actions of Mehdi Zeinoddin during the Iran–Iraq war, particularly on Majnoon Island during the Khaybar operation. Presented by Crystal Entertainment.',
    genre: ['War', 'Drama', 'Biography'],
    durationMinutes: 101,
    releaseDate: '2024-02-01',
    language: 'Persian (English Subtitles)',
    ageRating: 'PG-13',
    rating: 8.2,
    posterUrl: POSTER,
    backdropUrl: BACKDROP,
    trailerUrl: 'https://www.youtube.com/embed/sWE0jjKHQXo',
    status: 'NOW_SHOWING',
    isFeatured: true,
    cast: [
      {
        id: 'c1',
        name: 'Sajjad Babaei',
        character: 'Mehdi Zeinoddin',
        image: POSTER,
      },
      {
        id: 'c2',
        name: 'Shabnam Ghorbani',
        character: 'Monireh Armaghan',
        image: CAST_GROUP,
      },
      {
        id: 'c3',
        name: 'Behzad Khalaj',
        character: 'Majid Zeinoddin',
        image: CAST_GROUP,
      },
      {
        id: 'c4',
        name: 'Hesam Manzour',
        character: 'Supporting Role',
        image: CAST_GROUP,
      },
      {
        id: 'c5',
        name: 'Mohammad Rashno',
        character: 'Supporting Role',
        image: CAST_GROUP,
      },
      {
        id: 'c6',
        name: 'Seyyed Mehdi Hosseini',
        character: 'Supporting Role',
        image: CAST_GROUP,
      },
    ],
    crew: [
      { id: 'cr1', name: 'Mehdi Shamohammadi', role: 'Director' },
      { id: 'cr2', name: 'Alireza Mohsooli', role: 'Writer' },
      { id: 'cr3', name: 'Abbas Naderan', role: 'Producer' },
      { id: 'cr4', name: 'Majid Entezami', role: 'Music' },
      { id: 'cr5', name: 'Crystal Entertainment', role: 'Presented By' },
    ],
    gallery: [BACKDROP, CAST_GROUP, POSTER],
  },
];

export const MAJNOON = MOCK_MOVIES[0];
