export interface CastMember {
  id: string;
  name: string;
  character: string;
  image: string;
}

export interface CrewMember {
  id: string;
  name: string;
  role: string;
}

export type MovieStatus = 'NOW_SHOWING' | 'COMING_SOON';

export interface Movie {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  synopsis: string;
  genre: string[];
  durationMinutes: number;
  releaseDate: string;
  language: string;
  ageRating: string; // e.g. 'PG-13', 'R', 'G'
  rating: number; // e.g. 8.9
  posterUrl: string;
  backdropUrl: string;
  trailerUrl: string;
  status: MovieStatus;
  isFeatured?: boolean;
  cast: CastMember[];
  crew: CrewMember[];
  gallery: string[];
}
