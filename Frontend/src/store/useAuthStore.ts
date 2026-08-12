import { create } from 'zustand';
import { MOCK_USER } from '@/data/content';
import { UserProfile } from '@/types/content';

interface AuthStoreState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  user: MOCK_USER,
  isAuthenticated: true,

  login: (email: string) => {
    set({
      user: { ...MOCK_USER, email },
      isAuthenticated: true,
    });
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
}));
