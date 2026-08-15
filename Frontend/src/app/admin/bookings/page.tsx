'use client';

import React, { useState } from 'react';
import { MOCK_BOOKINGS } from '@/data/content';
import { Booking } from '@/types/booking';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Search, CheckCircle2, XCircle, Ticket } from 'lucide-react';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [search, setSearch] = useState('');

  const filtered = bookings.filter(
    (b) =>
      b.bookingCode.toLowerCase().includes(search.toLowerCase()) ||
      b.customer.fullName.toLowerCase().includes(search.toLowerCase()) ||
      b.movieTitle.toLowerCase().includes(search.toLowerCase())
  );

  const handleStatusChange = (id: string, newStatus: any) => {
    setBookings(
      bookings.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );
  };

  return (
    <div className="space-y-6">
      <div>
<h1 className="text-2xl font-extrabold tracking-tight">Booking Reservations</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Inspect customer reservations. Bookings stay unconfirmed until payment; tickets are issued after payment.
          </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by code (e.g. APX-774219), customer, or movie..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-card text-foreground text-xs rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-secondary/40 text-[11px] uppercase font-bold text-muted-foreground">
              <th className="p-4">Booking Code</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Movie & Hall</th>
              <th className="p-4">Seats</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Check-In Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs font-medium">
            {filtered.map((bk) => (
              <tr key={bk.id} className="hover:bg-secondary/20 transition-colors">
                <td className="p-4 font-mono font-bold text-primary">{bk.bookingCode}</td>
                <td className="p-4">
                  <strong className="text-foreground block">{bk.customer.fullName}</strong>
                  <span className="text-[10px] text-muted-foreground">{bk.customer.email}</span>
                </td>
                <td className="p-4">
                  <strong className="text-foreground block">{bk.movieTitle}</strong>
                  <span className="text-[10px] text-muted-foreground">{bk.hallName} • {bk.startTime}</span>
                </td>
                <td className="p-4 font-extrabold text-foreground">
                  {bk.seats.map((s) => s.id).join(', ')}
                </td>
                <td className="p-4 font-bold text-foreground">{formatCurrency(bk.totalPrice)}</td>
                <td className="p-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                      bk.status === 'CONFIRMED'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : bk.status === 'USED'
                        ? 'bg-blue-500/10 text-blue-500'
                        : 'bg-rose-500/10 text-rose-500'
                    }`}
                  >
                    {bk.status}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  {bk.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleStatusChange(bk.id, 'USED')}
                      className="px-3 py-1.5 bg-emerald-600 text-white font-bold text-[11px] rounded-lg shadow"
                    >
                      Check-In
                    </button>
                  )}
                  {bk.status !== 'CANCELLED' && (
                    <button
                      onClick={() => handleStatusChange(bk.id, 'CANCELLED')}
                      className="px-3 py-1.5 bg-secondary text-secondary-foreground font-bold text-[11px] rounded-lg hover:bg-rose-500 hover:text-white transition-colors"
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
