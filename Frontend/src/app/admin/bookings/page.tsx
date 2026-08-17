'use client';

import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { toast } from '@/store/useToastStore';
import { adminApi } from '@/services/adminApi';
import { formatDate } from '@/lib/utils';

export default function AdminBookingsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'bookings', search],
    queryFn: () => adminApi.bookings.list(search || undefined),
  });
  const bookings = data?.data ?? [];

  const cancelMutation = useMutation({
    mutationFn: (id: string) => adminApi.bookings.cancel(id),
    onSuccess: () => {
      toast.info('Booking cancelled');
      qc.invalidateQueries({ queryKey: ['admin', 'bookings'] });
    },
    onError: (e: Error) => toast.error('Cancel failed', e.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Bookings</h1>
        <p className="text-xs text-muted-foreground mt-1">Live reservations from the API.</p>
      </div>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search code or email..."
          className="w-full pl-9 pr-4 py-2 bg-card text-xs rounded-xl border border-border"
        />
      </div>
      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {error && <p className="text-sm text-rose-500">{(error as Error).message}</p>}

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-secondary/40 text-[11px] uppercase font-bold text-muted-foreground">
              <th className="p-4">Code</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Email</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Movie</th>
              <th className="p-4">Seats</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {bookings.length === 0 && !isLoading && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-muted-foreground">
                  No bookings yet. User reservations appear here as soon as they are submitted.
                </td>
              </tr>
            )}
            {bookings.map((bk) => (
              <tr key={bk.id}>
                <td className="p-4 font-mono font-bold text-primary">{bk.bookingCode}</td>
                <td className="p-4 font-semibold">{bk.customerName}</td>
                <td className="p-4">{bk.customerEmail || '—'}</td>
                <td className="p-4">{bk.customerPhone || '—'}</td>
                <td className="p-4">
                  {bk.screening?.movie?.title}
                  <span className="block text-[10px] text-muted-foreground">
                    {bk.screening?.startTime ? formatDate(bk.screening.startTime) : ''}
                  </span>
                </td>
                <td className="p-4">{bk.seats?.map((s) => s.seat?.label).filter(Boolean).join(', ') || '—'}</td>
                <td className="p-4 font-bold">{bk.status}</td>
                <td className="p-4 text-right">
                  {bk.status !== 'CANCELLED' && bk.status !== 'EXPIRED' && (
                    <button
                      onClick={() => {
                        if (confirm('Cancel this booking?')) cancelMutation.mutate(bk.id);
                      }}
                      className="px-3 py-1.5 bg-secondary text-[11px] font-bold rounded-lg"
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
