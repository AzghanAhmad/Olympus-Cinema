'use client';

import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { toast } from '@/store/useToastStore';
import { adminApi, AdminNews } from '@/services/adminApi';

export default function AdminNewsPage() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'news'],
    queryFn: () => adminApi.news.list(),
  });
  const news = data?.data ?? [];
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminNews | null>(null);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('PUBLISHED');

  const saveMutation = useMutation({
    mutationFn: () => {
      const body = { title, excerpt, content: content || excerpt || title, status };
      if (editing) return adminApi.news.update(editing.id, body);
      return adminApi.news.create({ ...body, publishedAt: new Date().toISOString() });
    },
    onSuccess: () => {
      toast.success(editing ? 'Article updated' : 'Article published');
      qc.invalidateQueries({ queryKey: ['admin', 'news'] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error('Save failed', e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.news.remove(id),
    onSuccess: () => {
      toast.info('Article deleted');
      qc.invalidateQueries({ queryKey: ['admin', 'news'] });
    },
    onError: (e: Error) => toast.error('Delete failed', e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">News</h1>
          <p className="text-xs text-muted-foreground mt-1">Articles stored in the database.</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setTitle('');
            setExcerpt('');
            setContent('');
            setStatus('PUBLISHED');
            setOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl"
        >
          <Plus className="w-4 h-4" /> Publish
        </button>
      </div>
      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {error && <p className="text-sm text-rose-500">{(error as Error).message}</p>}

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-secondary/40 text-[11px] uppercase font-bold text-muted-foreground">
              <th className="p-4">Title</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {news.map((n) => (
              <tr key={n.id}>
                <td className="p-4 font-bold">{n.title}</td>
                <td className="p-4">{n.status}</td>
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => {
                      setEditing(n);
                      setTitle(n.title);
                      setExcerpt(n.excerpt || '');
                      setContent(n.content);
                      setStatus(n.status);
                      setOpen(true);
                    }}
                    className="p-1.5 text-primary"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete article?')) deleteMutation.mutate(n.id);
                    }}
                    className="p-1.5 text-rose-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveMutation.mutate();
            }}
            className="bg-card border border-border rounded-3xl p-6 max-w-md w-full space-y-3 relative"
          >
            <button type="button" onClick={() => setOpen(false)} className="absolute top-6 right-6"><X className="w-5 h-5" /></button>
            <h3 className="font-extrabold">{editing ? 'Edit article' : 'New article'}</h3>
            <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full py-2 px-3 bg-secondary text-xs rounded-xl border border-border" />
            <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Excerpt" className="w-full py-2 px-3 bg-secondary text-xs rounded-xl border border-border" />
            <textarea required value={content} onChange={(e) => setContent(e.target.value)} placeholder="Content" className="w-full py-2 px-3 bg-secondary text-xs rounded-xl border border-border" />
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full py-2 px-3 bg-secondary text-xs rounded-xl border border-border">
              <option value="DRAFT">DRAFT</option>
              <option value="PUBLISHED">PUBLISHED</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 bg-secondary text-xs rounded-xl font-bold">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-primary text-white text-xs rounded-xl font-bold">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
