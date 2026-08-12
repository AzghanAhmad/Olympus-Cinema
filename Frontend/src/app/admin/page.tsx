'use client';

import React from 'react';
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
import { Film, Ticket, Users, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const bookingTrendsData = [
  { day: 'Mon', bookings: 120, revenue: 1980 },
  { day: 'Tue', bookings: 145, revenue: 2390 },
  { day: 'Wed', bookings: 190, revenue: 3100 },
  { day: 'Thu', bookings: 210, revenue: 3460 },
  { day: 'Fri', bookings: 380, revenue: 6270 },
  { day: 'Sat', bookings: 540, revenue: 8910 },
  { day: 'Sun', bookings: 490, revenue: 8085 },
];

const popularMoviesData = [
  { name: 'Dune: Part Two', tickets: 1240 },
  { name: 'Oppenheimer', tickets: 980 },
  { name: 'Interstellar', tickets: 750 },
  { name: 'Gladiator II', tickets: 420 },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight">Admin Overview Dashboard</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Real-time metrics, ticket sales volume, screen occupancy rates, and analytics.
        </p>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="p-6 bg-card border border-border rounded-2xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase">Total Revenue (Weekly)</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-foreground">$34,195.00</span>
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +14.2%
            </span>
          </div>
        </div>

        <div className="p-6 bg-card border border-border rounded-2xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase">Tickets Sold Today</span>
            <Ticket className="w-4 h-4 text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-foreground">490</span>
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +8.5%
            </span>
          </div>
        </div>

        <div className="p-6 bg-card border border-border rounded-2xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase">Screen Occupancy Rate</span>
            <Calendar className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-foreground">84.2%</span>
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +5.1%
            </span>
          </div>
        </div>

        <div className="p-6 bg-card border border-border rounded-2xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase">Active Movies</span>
            <Film className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-foreground">5 Films</span>
            <span className="text-xs font-semibold text-muted-foreground">Across 3 Halls</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Weekly Revenue & Bookings Area Chart */}
        <div className="lg:col-span-2 p-6 bg-card border border-border rounded-3xl space-y-4 shadow-sm">
          <h3 className="font-extrabold text-base">Weekly Revenue Trend ($)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={bookingTrendsData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E50914" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#E50914" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="day" stroke="#888888" fontSize={12} />
                <YAxis stroke="#888888" fontSize={12} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#E50914" fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Movies Bar Chart */}
        <div className="p-6 bg-card border border-border rounded-3xl space-y-4 shadow-sm">
          <h3 className="font-extrabold text-base">Top Performing Films</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={popularMoviesData} layout="vertical">
                <XAxis type="number" stroke="#888888" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#888888" fontSize={11} width={90} />
                <Tooltip />
                <Bar dataKey="tickets" fill="#E50914" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
