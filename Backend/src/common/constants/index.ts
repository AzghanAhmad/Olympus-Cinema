export const IS_PUBLIC_KEY = 'isPublic';
export const ROLES_KEY = 'roles';

export const REDIS_KEYS = {
  seatHold: (screeningId: string, seatId: string) =>
    `seat-hold:${screeningId}:${seatId}`,
  holdMeta: (holdId: string) => `hold-meta:${holdId}`,
  holdSeats: (holdId: string) => `hold-seats:${holdId}`,
} as const;

export const BOOKING_CODE_PREFIX = 'CIN';
