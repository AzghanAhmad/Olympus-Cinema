'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Single-film site — catalog redirects to Majnoon */
export default function MoviesPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/movies/majnoon');
  }, [router]);
  return (
    <div className="min-h-[40vh] flex items-center justify-center text-sm text-muted-foreground">
      Opening Majnoon…
    </div>
  );
}
