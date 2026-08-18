import { apiFetch, ApiPaginated, ApiSuccess } from '@/lib/api';
import { NewsArticle } from '@/types/content';

interface ApiNewsAuthor {
  firstName: string;
  lastName: string;
}

interface ApiNews {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  featuredImageUrl?: string | null;
  publishedAt?: string | null;
  createdAt: string;
  author?: ApiNewsAuthor | null;
}

const FALLBACK_IMAGE = '/images/majnoon-backdrop.jpeg';

function mapNews(article: ApiNews, index = 0): NewsArticle {
  const authorName = article.author
    ? `${article.author.firstName} ${article.author.lastName}`.trim()
    : 'Crystal Entertainment';

  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    category: 'News',
    summary: article.excerpt || '',
    content: article.content,
    author: authorName,
    publishedAt: article.publishedAt || article.createdAt,
    imageUrl: article.featuredImageUrl || FALLBACK_IMAGE,
    isFeatured: index === 0,
  };
}

export const newsService = {
  async getNews(): Promise<NewsArticle[]> {
    try {
      const res = await apiFetch<ApiPaginated<ApiNews>>(`/news?limit=50`);
      return (res.data ?? []).map((a, i) => mapNews(a, i));
    } catch {
      return [];
    }
  },

  async getNewsBySlug(slug: string): Promise<NewsArticle | null> {
    try {
      const res = await apiFetch<ApiSuccess<ApiNews>>(`/news/${slug}`);
      if (res.data) return mapNews(res.data);
    } catch {
      /* ignore */
    }
    return null;
  },
};
