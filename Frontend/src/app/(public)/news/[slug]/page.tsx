'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { newsService } from '@/services/newsService';
import { NewsArticle } from '@/types/content';
import { formatDate } from '@/lib/utils';

export default function NewsArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    newsService.getNewsBySlug(slug).then((a) => {
      setArticle(a);
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="max-w-3xl mx-auto px-4 py-24 text-sm text-muted-foreground text-center">
          Loading article…
        </div>
      </PublicLayout>
    );
  }

  if (!article) {
    return (
      <PublicLayout>
        <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4">
          <h1 className="text-2xl font-extrabold">Article not found</h1>
          <Link href="/news" className="text-primary font-bold text-sm hover:underline">
            Back to news
          </Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div className="space-y-3">
          <Link href="/news" className="text-xs font-bold text-primary hover:underline">
            ← All news
          </Link>
          <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{article.category}</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{article.title}</h1>
          <p className="text-xs text-muted-foreground">
            By {article.author} • {formatDate(article.publishedAt)}
          </p>
        </div>

        <div className="relative aspect-video rounded-2xl overflow-hidden border border-border bg-zinc-900">
          <Image src={article.imageUrl} alt={article.title} fill className="object-cover" />
        </div>

        <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {article.content}
        </div>
      </article>
    </PublicLayout>
  );
}
