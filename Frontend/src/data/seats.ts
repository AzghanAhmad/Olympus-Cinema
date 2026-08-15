import { Seat, SeatCategory, SeatStatus } from '@/types/screening';
import type { CinemaScreen, SeatRowLayout } from '@/types/cinemaLayout';

/** Olympus hall layout from seating chart: left block | center aisle | right block */
export const OLYMPUS_ROW_LAYOUT: Record<string, { left: number; right: number }> = {
  A: { left: 8, right: 8 },
  B: { left: 10, right: 10 },
  C: { left: 11, right: 11 },
  D: { left: 11, right: 11 },
  E: { left: 11, right: 11 },
  F: { left: 11, right: 11 },
  G: { left: 11, right: 11 },
  H: { left: 11, right: 11 },
  I: { left: 11, right: 11 },
  J: { left: 11, right: 11 },
  K: { left: 11, right: 11 },
  L: { left: 11, right: 11 },
  M: { left: 11, right: 11 },
  N: { left: 11, right: 11 },
  O: { left: 11, right: 11 },
  P: { left: 11, right: 11 },
  Q: { left: 10, right: 10 },
  R: { left: 10, right: 10 },
  S: { left: 10, right: 10 },
  T: { left: 9, right: 9 },
  U: { left: 8, right: 8 },
};

export const OLYMPUS_ROWS = Object.keys(OLYMPUS_ROW_LAYOUT);

export const OLYMPUS_TOTAL_SEATS = OLYMPUS_ROWS.reduce((sum, row) => {
  const { left, right } = OLYMPUS_ROW_LAYOUT[row];
  return sum + left + right;
}, 0);

/** Seat number after which the center aisle gap appears */
export function getAisleAfter(rowLetter: string, rows?: SeatRowLayout[]): number {
  if (rows) {
    return rows.find((r) => r.label === rowLetter)?.left ?? 0;
  }
  return OLYMPUS_ROW_LAYOUT[rowLetter]?.left ?? 0;
}

export function aisleAfterByRow(rows: SeatRowLayout[]): Record<string, number> {
  return Object.fromEntries(rows.map((r) => [r.label, r.left]));
}

function defaultCategory(
  rowIndex: number,
  rowLabel: string,
  col: number,
  seatsInRow: number
): SeatCategory {
  if (rowIndex === 0 && (col === 1 || col === seatsInRow)) return 'WHEELCHAIR';
  if (rowIndex >= 5 && rowIndex <= 11) return 'PREMIUM';
  if (rowIndex >= 12) return 'VIP';
  return 'STANDARD';
}

function priceForCategory(
  category: SeatCategory,
  priceStandard: number,
  priceVIP: number
): number {
  if (category === 'VIP') return priceVIP;
  if (category === 'PREMIUM') return Number((priceStandard * 1.25).toFixed(2));
  return priceStandard;
}

/** Build bookable seats from a saved cinema screen layout */
export function generateSeatsFromScreen(
  screen: CinemaScreen,
  priceStandard = 15,
  priceVIP = 25,
  /** When true, skip demo occupied/reserved so admin map stays editable */
  adminMode = false
): Seat[] {
  const seats: Seat[] = [];

  screen.rows.forEach((row, rowIndex) => {
    const seatsInRow = row.left + row.right;

    for (let col = 1; col <= seatsInRow; col++) {
      const id = `${row.label}-${col}`;
      const meta = screen.seatMeta[id];
      const category =
        meta?.category ?? defaultCategory(rowIndex, row.label, col, seatsInRow);
      const price = priceForCategory(category, priceStandard, priceVIP);

      let status: SeatStatus = meta?.disabled ? 'DISABLED' : 'AVAILABLE';

      if (!adminMode && status === 'AVAILABLE') {
        const seed = rowIndex * 23 + col;
        if (seed % 7 === 0) status = 'OCCUPIED';
        else if (seed % 13 === 0) status = 'RESERVED';
      }

      seats.push({
        id,
        row: row.label,
        number: col,
        category,
        price: Number(price.toFixed(2)),
        status,
      });
    }
  });

  return seats;
}

export function generateMockSeats(hallId: string, priceStandard = 15, priceVIP = 25): Seat[] {
  const fallback: CinemaScreen = {
    id: hallId,
    name: 'Crystal Entertainment',
    screenType: 'STANDARD 4K',
    rows: OLYMPUS_ROWS.map((label) => ({
      label,
      left: OLYMPUS_ROW_LAYOUT[label].left,
      right: OLYMPUS_ROW_LAYOUT[label].right,
    })),
    seatMeta: {},
  };
  return generateSeatsFromScreen(fallback, priceStandard, priceVIP);
}
