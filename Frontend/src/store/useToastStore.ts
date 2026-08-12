import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastStoreState {
  toasts: ToastItem[];
  addToast: (type: ToastType, title: string, message?: string) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStoreState>((set) => ({
  toasts: [],
  addToast: (type, title, message) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    set((state) => ({ toasts: [...state.toasts, { id, type, title, message }] }));

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (title: string, message?: string) => useToastStore.getState().addToast('success', title, message),
  error: (title: string, message?: string) => useToastStore.getState().addToast('error', title, message),
  warning: (title: string, message?: string) => useToastStore.getState().addToast('warning', title, message),
  info: (title: string, message?: string) => useToastStore.getState().addToast('info', title, message),
};
