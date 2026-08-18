import { Seat } from '@/types/screening';

/** Derive center-aisle position from live seat numbers (same hall as admin screens). */
export function computeAisleAfterByRow(seats: Seat[]): Record<string, number> {
  const rows = Array.from(new Set(seats.map((s) => s.row))).sort();
  const result: Record<string, number> = {};

  for (const row of rows) {
    const rowSeats = seats
      .filter((s) => s.row === row)
      .sort((a, b) => a.number - b.number);
    if (!rowSeats.length) continue;

    let aisleAfter = rowSeats[0].number;
    for (let i = 0; i < rowSeats.length - 1; i++) {
      if (rowSeats[i + 1].number - rowSeats[i].number > 1) {
        aisleAfter = rowSeats[i].number;
        break;
      }
    }
    if (aisleAfter === rowSeats[0].number && rowSeats.length > 1) {
      const mid =
        Math.floor((rowSeats[0].number + rowSeats[rowSeats.length - 1].number) / 2);
      aisleAfter = mid;
    }
    result[row] = aisleAfter;
  }

  return result;
}
