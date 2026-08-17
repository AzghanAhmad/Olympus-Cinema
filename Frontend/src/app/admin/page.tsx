'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { Film, Ticket, Users, Calendar } from 'lucide-react';
import { adminApi } from '@/services/adminApi';

export default function AdminDashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => adminApi.dashboard(),
    retry: false,
  });

  const stats = data?.data;

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading dashboard…</p>;
  }
  if (error || !stats) {
    return (
      <p className="text-sm text-rose-500">
        Could not load dashboard. Sign in as admin and make sure the API is running on port 4000.
      </p>
    );
  }

  const trend = (stats.weeklyTrend || []).map((d) => ({
    ...d,
    label: d.day.slice(5),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Admin Overview Dashboard</h1>
        <p className="text-xs text-muted-foreground mt-1">Live metrics from the cinema API.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Metric title="Users" value={stats.totals.users} icon={<Users className="w-4 h-4" />} />
        <Metric
          title="Tickets sold today"
          value={stats.today.ticketsSold}
          icon={<Ticket className="w-4 h-4 text-primary" />}
        />
        <Metric
          title="Upcoming screenings"
          value={stats.totals.upcomingScreenings}
          icon={<Calendar className="w-4 h-4 text-indigo-500" />}
        />
        <Metric
          title="Published movies"
          value={stats.totals.publishedMovies}
          hint={`${stats.totals.movies} total`}
          icon={<Film className="w-4 h-4 text-amber-500" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-6 bg-card border border-border rounded-3xl space-y-4 shadow-sm">
          <h3 className="font-extrabold text-base">Bookings (last 7 days)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E50914" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#E50914" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="label" stroke="#888888" fontSize={12} />
                <YAxis stroke="#888888" fontSize={12} />
                <Tooltip />
                <Area type="monotone" dataKey="bookings" stroke="#E50914" fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 bg-card border border-border rounded-3xl space-y-4 shadow-sm">
          <h3 className="font-extrabold text-base">Top films by bookings</h3>
          <div className="h-72 w-full">
            {(stats.popularMovies || []).length === 0 ? (
              <p className="text-xs text-muted-foreground pt-8">No confirmed bookings yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.popularMovies} layout="vertical">
                  <XAxis type="number" stroke="#888888" fontSize={11} />
                  <YAxis dataKey="name" type="category" stroke="#888888" fontSize={11} width={90} />
                  <Tooltip />
                  <Bar dataKey="tickets" fill="#E50914" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 bg-card border border-border rounded-3xl space-y-4">
        <h3 className="font-extrabold text-base">Recent bookings</h3>
        <div className="divide-y divide-border text-xs">
          {(stats.recentBookings || []).length === 0 && (
            <p className="text-muted-foreground py-4">No bookings yet.</p>
          )}
          {(stats.recentBookings || []).map((b) => (
            <div key={b.id} className="py-3 flex items-center justify-between gap-4">
              <div>
                <span className="font-mono font-bold text-primary">{b.bookingCode}</span>
                <p className="text-muted-foreground">
                  {b.customerName} · {b.screening?.movie?.title || 'Film'} · {b.screening?.screen?.name}
                </p>
              </div>
              <span className="font-bold">{b.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Metric({
  title,
  value,
  hint,
  icon,
}: {
  title: string;
  value: number;
  hint?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="p-6 bg-card border border-border rounded-2xl space-y-2 shadow-sm">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs font-semibold uppercase">{title}</span>
        {icon}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-black text-foreground">{value}</span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
    </div>
  );
}
