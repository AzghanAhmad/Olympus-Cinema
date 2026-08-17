'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopbar } from '@/components/admin/AdminTopbar';
import { useAuthStore } from '@/store/useAuthStore';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const isAdmin = hasHydrated && user?.role === 'ADMIN' && Boolean(accessToken);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAdmin) {
      router.replace('/login');
    }
  }, [isAdmin, router, hasHydrated]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-sm text-muted-foreground">
        {hasHydrated ? 'Admin access only. Redirecting to sign in…' : 'Loading…'}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <AdminTopbar />
        <main className="flex-1 p-6 sm:p-8 space-y-8">{children}</main>
      </div>
    </div>
  );
}
