'use client';

import React from 'react';
import { useAuthStore } from '@/store/useAuthStore';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-sm text-muted-foreground">
        Loading account…
      </div>
    );
  }

  return <>{children}</>;
}
