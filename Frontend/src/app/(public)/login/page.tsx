'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from '@/store/useToastStore';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login(email, password);
    if (!result.ok) {
      toast.error('Sign in failed', result.error);
      return;
    }
    const role = useAuthStore.getState().user?.role;
    toast.success('Welcome back', role === 'ADMIN' ? 'Admin dashboard ready' : 'You are signed in');
    router.push(role === 'ADMIN' ? '/admin' : '/account');
  };

  return (
    <PublicLayout>
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="p-8 bg-card border border-border rounded-3xl shadow-sm space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold tracking-tight">Sign in</h1>
            <p className="text-sm text-muted-foreground">
              Access your reservations. Admin sign-in opens the cinema panel.
            </p>
            <p className="text-[11px] text-muted-foreground">
              Admin: admin@cinema.local / Password123!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm"
                placeholder="you@email.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground font-bold text-sm rounded-xl"
            >
              <LogIn className="w-4 h-4" />
              Sign in
            </button>
          </form>

          <p className="text-xs text-muted-foreground text-center">
            New here?{' '}
            <Link href="/signup" className="text-primary font-bold hover:underline">
              Create a user account
            </Link>
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
