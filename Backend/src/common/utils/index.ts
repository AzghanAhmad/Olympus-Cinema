import { createHash, randomBytes } from 'crypto';
import { BOOKING_CODE_PREFIX } from '../constants';

export function generateBookingCode(): string {
  const year = new Date().getFullYear();
  const suffix = randomBytes(3).toString('hex').toUpperCase();
  return `${BOOKING_CODE_PREFIX}-${year}-${suffix}`;
}

export function generateTicketCode(): string {
  return `TKT-${randomBytes(4).toString('hex').toUpperCase()}`;
}

export function generateSecureToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function sanitizeUser<T extends { passwordHash?: string }>(
  user: T,
): Omit<T, 'passwordHash'> {
  const { passwordHash: _, ...safe } = user;
  return safe;
}

export function getPagination(page = 1, limit = 20): { skip: number; take: number } {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(100, Math.max(1, limit));
  return { skip: (safePage - 1) * safeLimit, take: safeLimit };
}

export function buildMeta(total: number, page: number, limit: number) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  };
}
