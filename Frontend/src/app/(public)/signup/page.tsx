'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from '@/store/useToastStore';
import { UserPlus } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const signup = useAuthStore((s) => s.signup);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signup({ name, email, phone, password });
    if (!result.ok) {
      toast.error('Could not create account', result.error);
      return;
    }
    toast.success('Account created', 'Welcome to Crystal Entertainment');
    router.push('/account');
  };

  return (
    <PublicLayout>
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="p-8 bg-card border border-border rounded-3xl shadow-sm space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold tracking-tight">Create account</h1>
            <p className="text-sm text-muted-foreground">
              Sign up as a guest to reserve seats. Admin accounts cannot be created here.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1">Full name</label>
              <input
                required
                minLength={2}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Phone</label>
              <input
                required
                minLength={7}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm"
                placeholder="At least 8 characters"
              />
            </div>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground font-bold text-sm rounded-xl"
            >
              <UserPlus className="w-4 h-4" />
              Sign up
            </button>
          </form>

          <p className="text-xs text-muted-foreground text-center">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
