export interface HoldMeta {
  holdId: string;
  screeningId: string;
  userId?: string;
  sessionId?: string;
  seatIds: string[];
  expiresAt: string;
}
