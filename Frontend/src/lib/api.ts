export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:4000';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type TokenGetter = () => string | null | undefined;

let getAccessToken: TokenGetter = () => null;
let getRefreshToken: TokenGetter = () => null;
let onTokensUpdated: (accessToken: string, refreshToken?: string) => void = () => {};
let onAuthCleared: () => void = () => {};
let refreshInFlight: Promise<string | null> | null = null;

export function setAccessTokenGetter(fn: TokenGetter) {
  getAccessToken = fn;
}

export function configureAuthHandlers(handlers: {
  getRefreshToken: TokenGetter;
  onTokensUpdated: (accessToken: string, refreshToken?: string) => void;
  onAuthCleared: () => void;
}) {
  getRefreshToken = handlers.getRefreshToken;
  onTokensUpdated = handlers.onTokensUpdated;
  onAuthCleared = handlers.onAuthCleared;
}

function isAuthPath(path: string) {
  return path.startsWith('/auth/');
}

async function tryRefreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;

    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const json = (await res.json().catch(() => ({}))) as {
      data?: { accessToken?: string; refreshToken?: string };
    };
    if (!res.ok || !json.data?.accessToken) {
      onAuthCleared();
      return null;
    }
    onTokensUpdated(json.data.accessToken, json.data.refreshToken);
    return json.data.accessToken;
  })().finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const token = getAccessToken();
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401 && retry && !isAuthPath(path)) {
    const nextToken = await tryRefreshAccessToken();
    if (nextToken) {
      return apiFetch<T>(path, options, false);
    }
  }

  const json = (await res.json().catch(() => ({}))) as {
    success?: boolean;
    message?: string;
    data?: T;
    meta?: unknown;
    errors?: unknown;
  };

  if (!res.ok) {
    if (res.status === 401 && !isAuthPath(path)) {
      onAuthCleared();
    }
    const message =
      (Array.isArray(json.message) ? json.message.join(', ') : json.message) ||
      `Request failed (${res.status})`;
    throw new ApiError(res.status, message);
  }

  if (json && typeof json === 'object' && 'data' in json) {
    return json as T;
  }
  return json as T;
}

export interface ApiSuccess<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ApiPaginated<T> {
  success: boolean;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function qs(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') search.set(k, String(v));
  });
  const s = search.toString();
  return s ? `?${s}` : '';
}
