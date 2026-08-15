'use client';

import React from 'react';
import { MOCK_USER } from '@/data/content';
import { Users, Mail, Phone, Calendar } from 'lucide-react';

export default function AdminUsersPage() {
  const users = [
    MOCK_USER,
    {
      id: 'usr-9012',
      name: 'Sophia Martinez',
      email: 'sophia.m@example.com',
      phone: '+1 (555) 987-6543',
      avatarUrl: '/images/avatar.svg',
      role: 'USER',
      joinedDate: '2025-06-10',
      totalBookings: 6,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Registered Customers & Accounts</h1>
        <p className="text-xs text-muted-foreground mt-1">Manage user profiles, membership roles, and cinema history.</p>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-secondary/40 text-[11px] uppercase font-bold text-muted-foreground">
              <th className="p-4">Customer</th>
              <th className="p-4">Role</th>
              <th className="p-4">Total Reservations</th>
              <th className="p-4">Joined Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs font-medium">
            {users.map((usr) => (
              <tr key={usr.id} className="hover:bg-secondary/20 transition-colors">
                <td className="p-4">
                  <strong className="text-foreground block">{usr.name}</strong>
                  <span className="text-[10px] text-muted-foreground">{usr.email} • {usr.phone}</span>
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${usr.role === 'ADMIN' ? 'bg-primary/10 text-primary' : 'bg-secondary text-foreground'}`}>
                    {usr.role}
                  </span>
                </td>
                <td className="p-4 font-bold text-foreground">{usr.totalBookings} Bookings</td>
                <td className="p-4 text-muted-foreground">{usr.joinedDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
