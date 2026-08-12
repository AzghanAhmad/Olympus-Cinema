export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  content: string;
  author: string;
  publishedAt: string;
  imageUrl: string;
  isFeatured?: boolean;
}

export interface CinemaEvent {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  date: string;
  time: string;
  location: string;
  description: string;
  imageUrl: string;
  ctaText: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  role: 'USER' | 'ADMIN';
  joinedDate: string;
  totalBookings: number;
}
