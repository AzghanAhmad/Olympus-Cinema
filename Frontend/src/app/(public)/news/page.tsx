'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { MOCK_NEWS, MOCK_EVENTS } from '@/data/content';
import { Newspaper, Calendar, Sparkles } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function NewsPage() {
  const featuredArticle = MOCK_NEWS.find((n) => n.isFeatured) || MOCK_NEWS[0];

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        {/* Header */}
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Cinema News & Editorial</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Stay updated with film industry releases, tech upgrades, and exclusive director interviews.
          </p>
        </div>

        {/* Featured News Hero */}
        {featuredArticle && (
          <div className="relative rounded-3xl overflow-hidden bg-card border border-border grid grid-cols-1 lg:grid-cols-2 gap-8 shadow-xl">
            <div className="relative aspect-video lg:aspect-auto w-full min-h-[300px] bg-zinc-900">
              <Image src={featuredArticle.imageUrl} alt={featuredArticle.title} fill className="object-cover" />
            </div>
            <div className="p-8 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <span className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full uppercase tracking-wider">
                  Featured News
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold">{featuredArticle.title}</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">{featuredArticle.summary}</p>
              </div>
              <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span>By {featuredArticle.author} • {formatDate(featuredArticle.publishedAt)}</span>
                <Link
                  href={`/news/${featuredArticle.slug}`}
                  className="px-4 py-2 bg-primary text-white font-bold rounded-xl text-xs hover:bg-primary/90 transition-colors"
                >
                  Read Full Story
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* All Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK_NEWS.map((article) => (
            <div key={article.id} className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm">
              <div className="relative aspect-video w-full">
                <Image src={article.imageUrl} alt={article.title} fill className="object-cover" />
              </div>
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{article.category}</span>
                  <h3 className="font-extrabold text-base line-clamp-2 mt-1">{article.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-2">{article.summary}</p>
                </div>
                <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatDate(article.publishedAt)}</span>
                  <Link href={`/news/${article.slug}`} className="font-bold text-primary hover:underline">
                    Read Article
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}
