'use client';

import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { toast } from '@/store/useToastStore';
import { adminApi, AdminEvent } from '@/services/adminApi';
import { formatDate } from '@/lib/utils';

export default function AdminEventsPage() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'events'],
    queryFn: () => adminApi.events.list(),
  });
  const events = data?.data ?? [];
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminEvent | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Crystal Entertainment');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [status, setStatus] = useState('PUBLISHED');

  const saveMutation = useMutation({
    mutationFn: () => {
      const body = {
        title,
        description: description || title,
        location,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        status,
      };
      if (editing) return adminApi.events.update(editing.id, body);
      return adminApi.events.create(body);
    },
    onSuccess: () => {
      toast.success(editing ? 'Event updated' : 'Event created');
      qc.invalidateQueries({ queryKey: ['admin', 'events'] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error('Save failed', e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.events.remove(id),
    onSuccess: () => {
      toast.info('Event deleted');
      qc.invalidateQueries({ queryKey: ['admin', 'events'] });
    },
    onError: (e: Error) => toast.error('Delete failed', e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Events</h1>
          <p className="text-xs text-muted-foreground mt-1">Special events from the API.</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setTitle('');
            setDescription('');
            const start = new Date();
            const end = new Date(start.getTime() + 3 * 3600000);
            setStartTime(toLocal(start));
            setEndTime(toLocal(end));
            setStatus('PUBLISHED');
            setOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl"
        >
          <Plus className="w-4 h-4" /> Create event
        </button>
      </div>
      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {error && <p className="text-sm text-rose-500">{(error as Error).message}</p>}

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-secondary/40 text-[11px] uppercase font-bold text-muted-foreground">
              <th className="p-4">Event</th>
              <th className="p-4">When</th>
              <th className="p-4">Location</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {events.map((e) => (
              <tr key={e.id}>
                <td className="p-4 font-bold">{e.title}</td>
                <td className="p-4">{formatDate(e.startTime)}</td>
                <td className="p-4">{e.location}</td>
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => {
                      setEditing(e);
                      setTitle(e.title);
                      setDescription(e.description);
                      setLocation(e.location || '');
                      setStartTime(toLocal(new Date(e.startTime)));
                      setEndTime(toLocal(new Date(e.endTime)));
                      setStatus(e.status);
                      setOpen(true);
                    }}
                    className="p-1.5 text-primary"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete event?')) deleteMutation.mutate(e.id);
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
            <h3 className="font-extrabold">{editing ? 'Edit event' : 'New event'}</h3>
            <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full py-2 px-3 bg-secondary text-xs rounded-xl border border-border" />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="w-full py-2 px-3 bg-secondary text-xs rounded-xl border border-border" />
            <input value={location} onChange={(e) => setLocation(e.target.value)} className="w-full py-2 px-3 bg-secondary text-xs rounded-xl border border-border" />
            <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full py-2 px-3 bg-secondary text-xs rounded-xl border border-border" />
            <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full py-2 px-3 bg-secondary text-xs rounded-xl border border-border" />
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full py-2 px-3 bg-secondary text-xs rounded-xl border border-border">
              <option value="DRAFT">DRAFT</option>
              <option value="PUBLISHED">PUBLISHED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="COMPLETED">COMPLETED</option>
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

function toLocal(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
