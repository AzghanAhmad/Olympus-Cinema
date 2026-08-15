'use client';

import React, { useState } from 'react';
import { MOCK_NEWS } from '@/data/content';
import { NewsArticle } from '@/types/content';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { toast } from '@/store/useToastStore';

export default function AdminNewsPage() {
  const [news, setNews] = useState<NewsArticle[]>(MOCK_NEWS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Cinema Tech');
  const [summary, setSummary] = useState('');
  const [author, setAuthor] = useState('Cinema Editorial');

  const openAddModal = () => {
    setEditingArticle(null);
    setTitle('');
    setCategory('Cinema Tech');
    setSummary('');
    setAuthor('Cinema Editorial');
    setIsModalOpen(true);
  };

  const openEditModal = (article: NewsArticle) => {
    setEditingArticle(article);
    setTitle(article.title);
    setCategory(article.category);
    setSummary(article.summary);
    setAuthor(article.author);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    if (editingArticle) {
      const updated: NewsArticle = {
        ...editingArticle,
        title,
        category,
        summary,
        author,
      };
      setNews(news.map((n) => (n.id === editingArticle.id ? updated : n)));
      toast.success('Article Updated', `"${title}" updated successfully.`);
    } else {
      const newArticle: NewsArticle = {
        id: `n-${Date.now()}`,
        title,
        slug: title.toLowerCase().replace(/\s+/g, '-'),
        category,
        summary,
        content: summary,
        author,
        publishedAt: new Date().toISOString().split('T')[0],
        imageUrl: '/images/majnoon-poster.jpg',
      };
      setNews([newArticle, ...news]);
      toast.success('Article Published', `"${title}" added to news.`);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, articleTitle: string) => {
    if (confirm(`Delete news article "${articleTitle}"?`)) {
      setNews(news.filter((n) => n.id !== id));
      toast.info('Article Removed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Editorial & News Publisher</h1>
          <p className="text-xs text-muted-foreground mt-1">Publish press releases, tech upgrades, and movie festival news.</p>
        </div>
        <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-lg shadow-primary/30">
          <Plus className="w-4 h-4" /> Publish Article
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-secondary/40 text-[11px] uppercase font-bold text-muted-foreground">
              <th className="p-4">Article Title</th>
              <th className="p-4">Category</th>
              <th className="p-4">Author</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs font-medium">
            {news.map((n) => (
              <tr key={n.id} className="hover:bg-secondary/20 transition-colors">
                <td className="p-4 font-bold text-foreground">{n.title}</td>
                <td className="p-4 text-primary font-semibold">{n.category}</td>
                <td className="p-4 text-muted-foreground">{n.author}</td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => openEditModal(n)} className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Edit Article">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(n.id, n.title)} className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-card border border-border rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-1 rounded-full text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-extrabold">{editingArticle ? 'Edit News Article' : 'Publish News Article'}</h3>

            <div>
              <label className="block text-xs font-bold mb-1">Article Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title..."
                className="w-full py-2.5 px-3 bg-secondary text-foreground text-xs rounded-xl border border-border"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full py-2.5 px-3 bg-secondary text-foreground text-xs rounded-xl border border-border"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">Author</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full py-2.5 px-3 bg-secondary text-foreground text-xs rounded-xl border border-border"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">Summary / Excerpt</label>
              <textarea
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full py-2.5 px-3 bg-secondary text-foreground text-xs rounded-xl border border-border resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-secondary text-xs rounded-xl font-bold">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-primary text-white text-xs rounded-xl font-bold">
                {editingArticle ? 'Save Article' : 'Publish Article'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
