// utils/math.ts

/**
 * Rounds a number to a given number of decimal places.
 * Default: 2 (useful for prices).
 */
export function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Clamps a number between a min and max bound (inclusive).
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Returns the percentage of part relative to total.
 * e.g. percentage(25, 200) → 12.5
 */
export function percentage(part: number, total: number): number {
  if (total === 0) return 0;
  return round((part / total) * 100);
}

/**
 * Sums an array of numbers.
 */
export function sum(numbers: number[]): number {
  return numbers.reduce((acc, n) => acc + n, 0);
}
