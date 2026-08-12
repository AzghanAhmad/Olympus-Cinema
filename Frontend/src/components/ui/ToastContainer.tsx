'use client';

import React from 'react';
import { useToastStore } from '@/store/useToastStore';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => {
          const isSuccess = t.type === 'success';
          const isError = t.type === 'error';
          const isWarning = t.type === 'warning';

          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={`pointer-events-auto p-4 rounded-2xl border shadow-xl flex items-start gap-3 glass-panel ${
                isSuccess
                  ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  : isError
                  ? 'border-rose-500/30 text-rose-600 dark:text-rose-400'
                  : isWarning
                  ? 'border-amber-500/30 text-amber-600 dark:text-amber-400'
                  : 'border-primary/30 text-primary'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                {isError && <AlertCircle className="w-5 h-5 text-rose-500" />}
                {isWarning && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-primary" />}
              </div>

              <div className="flex-1 space-y-0.5 text-xs">
                <h4 className="font-extrabold text-foreground">{t.title}</h4>
                {t.message && <p className="text-muted-foreground">{t.message}</p>}
              </div>

              <button
                onClick={() => removeToast(t.id)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
