'use client';

import React, { useState } from 'react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { useAuthStore } from '@/store/useAuthStore';
import { User, Save, Lock } from 'lucide-react';

export default function UserProfilePage() {
  const { user } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <PublicLayout>
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Edit Profile & Account</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your contact credentials and password.</p>
        </div>

        {saved && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-500 text-xs font-bold">
            Profile changes updated successfully (Simulated).
          </div>
        )}

        <form onSubmit={handleSave} className="p-8 bg-card border border-border rounded-3xl space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full py-2.5 px-3 bg-secondary text-foreground text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-2.5 px-3 bg-secondary text-foreground text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full py-2.5 px-3 bg-secondary text-foreground text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/30"
            >
              <Save className="w-4 h-4" />
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </PublicLayout>
  );
}
