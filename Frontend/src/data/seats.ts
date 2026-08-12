import { Seat, SeatCategory, SeatStatus } from '@/types/screening';

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
export function getAisleAfter(rowLetter: string): number {
  return OLYMPUS_ROW_LAYOUT[rowLetter]?.left ?? 0;
}

export function generateMockSeats(hallId: string, priceStandard = 15, priceVIP = 25): Seat[] {
  const seats: Seat[] = [];

  OLYMPUS_ROWS.forEach((rowLetter, rowIndex) => {
    const { left, right } = OLYMPUS_ROW_LAYOUT[rowLetter];
    const seatsInRow = left + right;

    for (let col = 1; col <= seatsInRow; col++) {
      const id = `${rowLetter}-${col}`;

      let category: SeatCategory = 'STANDARD';
      let price = priceStandard;

      // Front (near screen): standard; mid: premium; rear: VIP
      if (rowIndex >= 5 && rowIndex <= 11) {
        category = 'PREMIUM';
        price = priceStandard * 1.25;
      } else if (rowIndex >= 12) {
        category = 'VIP';
        price = priceVIP;
      }

      // Wheelchair accessible seats at front corners
      if (rowLetter === 'A' && (col === 1 || col === seatsInRow)) {
        category = 'WHEELCHAIR';
        price = priceStandard;
      }

      let status: SeatStatus = 'AVAILABLE';
      const seed = rowIndex * 23 + col;
      if (seed % 7 === 0) {
        status = 'OCCUPIED';
      } else if (seed % 13 === 0) {
        status = 'RESERVED';
      }

      seats.push({
        id,
        row: rowLetter,
        number: col,
        category,
        price: Number(price.toFixed(2)),
        status,
      });
    }
  });

  return seats;
}
