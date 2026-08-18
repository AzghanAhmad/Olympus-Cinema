'use client';

import { useEffect } from 'react';
import { hydrateSiteSettings } from '@/services/settingsService';

/** Loads cinema settings from the API so user and admin panels share the same data. */
export function SiteBootstrap() {
  useEffect(() => {
    hydrateSiteSettings();
  }, []);
  return null;
}
