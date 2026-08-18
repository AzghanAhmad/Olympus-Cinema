import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile } from '@/types/content';
import {
  apiFetch,
  setAccessTokenGetter,
  configureAuthHandlers,
  ApiSuccess,
} from '@/lib/api';

interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  role: string;
  avatarUrl?: string | null;
  createdAt?: string;
}

type AuthTokens = { user: AuthUser; accessToken: string; refreshToken?: string };

interface AuthStoreState {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  setTokens: (accessToken: string, refreshToken?: string) => void;
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  signup: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
  }) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => void;
  isAdmin: () => boolean;
}

function mapUser(u: AuthUser): UserProfile {
  return {
    id: u.id,
    name: `${u.firstName} ${u.lastName}`.trim(),
    email: u.email,
    phone: u.phone || '',
    avatarUrl: u.avatarUrl || '/images/avatar.svg',
    role: u.role === 'ADMIN' ? 'ADMIN' : 'USER',
    joinedDate: u.createdAt ? u.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
    totalBookings: 0,
  };
}

function applySession(
  set: (partial: Partial<AuthStoreState>) => void,
  tokens: AuthTokens,
) {
  set({
    user: mapUser(tokens.user),
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken ?? null,
    isAuthenticated: true,
  });
}

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      hasHydrated: false,
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      setTokens: (accessToken, refreshToken) =>
        set({
          accessToken,
          refreshToken: refreshToken ?? get().refreshToken,
        }),

      login: async (email, password) => {
        try {
          const res = await apiFetch<ApiSuccess<AuthTokens>>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
          });
          applySession(set, res.data);
          return { ok: true };
        } catch (err) {
          return { ok: false, error: err instanceof Error ? err.message : 'Sign in failed' };
        }
      },

      signup: async ({ name, email, phone, password, confirmPassword }) => {
        const parts = name.trim().split(/\s+/);
        const firstName = parts[0] || 'Guest';
        const lastName = parts.slice(1).join(' ') || 'User';
        try {
          const res = await apiFetch<ApiSuccess<AuthTokens>>('/auth/register', {
            method: 'POST',
            body: JSON.stringify({
              firstName,
              lastName,
              email: email.trim().toLowerCase(),
              phone,
              password,
              confirmPassword,
            }),
          });
          applySession(set, res.data);
          return { ok: true };
        } catch (err) {
          return { ok: false, error: err instanceof Error ? err.message : 'Could not create account' };
        }
      },

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),

      isAdmin: () => get().user?.role === 'ADMIN' && Boolean(get().accessToken),
    }),
    {
      name: 'crystal-auth-v3',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && (!state.accessToken || !state.user)) {
          state.logout();
        }
        state?.setHasHydrated(true);
      },
    },
  ),
);

setAccessTokenGetter(() => useAuthStore.getState().accessToken);
configureAuthHandlers({
  getRefreshToken: () => useAuthStore.getState().refreshToken,
  onTokensUpdated: (accessToken, refreshToken) =>
    useAuthStore.getState().setTokens(accessToken, refreshToken),
  onAuthCleared: () => useAuthStore.getState().logout(),
});
