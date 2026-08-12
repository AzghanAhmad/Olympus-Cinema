'use client';

import React, { useState } from 'react';
import { MOCK_EVENTS } from '@/data/content';
import { CinemaEvent } from '@/types/content';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { toast } from '@/store/useToastStore';

export default function AdminEventsPage() {
  const [events, setEvents] = useState<CinemaEvent[]>(MOCK_EVENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CinemaEvent | null>(null);

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [date, setDate] = useState('2026-08-20');
  const [time, setTime] = useState('23:30');
  const [location, setLocation] = useState('Olympus Grand Hall');
  const [description, setDescription] = useState('');
  const [ctaText, setCtaText] = useState('Reserve Premiere Pass');

  const openAddModal = () => {
    setEditingEvent(null);
    setTitle('');
    setSubtitle('');
    setDate('2026-08-20');
    setTime('23:30');
    setLocation('Olympus Grand Hall');
    setDescription('');
    setCtaText('Reserve Premiere Pass');
    setIsModalOpen(true);
  };

  const openEditModal = (evt: CinemaEvent) => {
    setEditingEvent(evt);
    setTitle(evt.title);
    setSubtitle(evt.subtitle);
    setDate(evt.date);
    setTime(evt.time);
    setLocation(evt.location);
    setDescription(evt.description);
    setCtaText(evt.ctaText);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    if (editingEvent) {
      const updated: CinemaEvent = {
        ...editingEvent,
        title,
        subtitle,
        date,
        time,
        location,
        description,
        ctaText,
      };
      setEvents(events.map((ev) => (ev.id === editingEvent.id ? updated : ev)));
      toast.success('Event Updated', `"${title}" updated.`);
    } else {
      const newEvt: CinemaEvent = {
        id: `e-${Date.now()}`,
        title,
        slug: title.toLowerCase().replace(/\s+/g, '-'),
        subtitle,
        date,
        time,
        location,
        description,
        imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1000&auto=format&fit=crop',
        ctaText,
      };
      setEvents([newEvt, ...events]);
      toast.success('Event Created', `"${title}" published.`);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, eventTitle: string) => {
    if (confirm(`Delete event "${eventTitle}"?`)) {
      setEvents(events.filter((ev) => ev.id !== id));
      toast.info('Event Removed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Special Cinema Events Manager</h1>
          <p className="text-xs text-muted-foreground mt-1">Manage premieres, live orchestra film shows, and director Q&As.</p>
        </div>
        <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-lg shadow-primary/30">
          <Plus className="w-4 h-4" /> Create Event
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-secondary/40 text-[11px] uppercase font-bold text-muted-foreground">
              <th className="p-4">Event Name</th>
              <th className="p-4">Date & Time</th>
              <th className="p-4">Location</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs font-medium">
            {events.map((e) => (
              <tr key={e.id} className="hover:bg-secondary/20 transition-colors">
                <td className="p-4 font-bold text-foreground">{e.title}</td>
                <td className="p-4 text-muted-foreground">{e.date} at {e.time}</td>
                <td className="p-4 text-primary font-semibold">{e.location}</td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => openEditModal(e)} className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Edit Event">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(e.id, e.title)} className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors" title="Delete">
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

            <h3 className="text-lg font-extrabold">{editingEvent ? 'Edit Special Event' : 'Create Special Event'}</h3>

            <div>
              <label className="block text-xs font-bold mb-1">Event Title *</label>
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
              <label className="block text-xs font-bold mb-1">Subtitle</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full py-2.5 px-3 bg-secondary text-foreground text-xs rounded-xl border border-border"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full py-2.5 px-3 bg-secondary text-foreground text-xs rounded-xl border border-border"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Time</label>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full py-2.5 px-3 bg-secondary text-foreground text-xs rounded-xl border border-border"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">Auditorium / Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full py-2.5 px-3 bg-secondary text-foreground text-xs rounded-xl border border-border"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full py-2.5 px-3 bg-secondary text-foreground text-xs rounded-xl border border-border resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-secondary text-xs rounded-xl font-bold">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-primary text-white text-xs rounded-xl font-bold">
                {editingEvent ? 'Save Event' : 'Publish Event'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
