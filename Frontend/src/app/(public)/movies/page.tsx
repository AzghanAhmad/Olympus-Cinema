'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Single-film site — catalog redirects to Majunoon */
export default function MoviesPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/movies/majunoon');
  }, [router]);
  return (
    <div className="min-h-[40vh] flex items-center justify-center text-sm text-muted-foreground">
      Opening Majunoon…
    </div>
  );
}
