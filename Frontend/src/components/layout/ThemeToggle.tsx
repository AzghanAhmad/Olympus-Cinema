'use client';

import React from 'react';
import { useThemeStore } from '@/store/useThemeStore';
import { Sun, Moon, Laptop } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="flex items-center gap-1 p-1 bg-black/5 dark:bg-white/10 rounded-full border border-black/10 dark:border-white/10">
      <button
        onClick={() => setTheme('light')}
        className={`p-1.5 rounded-full transition-colors ${
          theme === 'light'
            ? 'bg-white text-black shadow-sm'
            : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
        }`}
        title="Light Mode"
      >
        <Sun className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-1.5 rounded-full transition-colors ${
          theme === 'dark'
            ? 'bg-zinc-800 text-white shadow-sm'
            : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
        }`}
        title="Dark Mode"
      >
        <Moon className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`p-1.5 rounded-full transition-colors ${
          theme === 'system'
            ? 'bg-zinc-800 text-white dark:bg-white dark:text-black shadow-sm'
            : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
        }`}
        title="System Preference"
      >
        <Laptop className="w-4 h-4" />
      </button>
    </div>
  );
}
