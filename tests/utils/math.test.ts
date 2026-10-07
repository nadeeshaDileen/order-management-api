// tests/utils/math.test.ts

import { round, clamp, percentage, sum } from '../../src/utils/math';

describe('round()', () => {
  it('rounds to 2 decimal places by default', () => {
    expect(round(1.2345)).toBe(1.23);
  });

  it('rounds up correctly', () => {
    expect(round(1.125)).toBe(1.13);
    expect(round(2.5, 0)).toBe(3);
  });

  it('rounds to 0 decimal places', () => {
    expect(round(4.6, 0)).toBe(5);
  });

  it('handles negative numbers', () => {
    expect(round(-3.456, 2)).toBe(-3.46);
  });
});

describe('clamp()', () => {
  it('returns value when within bounds', () => {
    expect(clamp(5, 1, 10)).toBe(5);
  });

  it('clamps to min when value is too low', () => {
    expect(clamp(-5, 0, 100)).toBe(0);
  });

  it('clamps to max when value is too high', () => {
    expect(clamp(200, 0, 100)).toBe(100);
  });

  it('returns min when min === max', () => {
    expect(clamp(50, 10, 10)).toBe(10);
  });
});

describe('percentage()', () => {
  it('calculates a basic percentage', () => {
    expect(percentage(25, 200)).toBe(12.5);
  });

  it('returns 100 when part equals total', () => {
    expect(percentage(50, 50)).toBe(100);
  });

  it('returns 0 when total is 0 (avoids divide-by-zero)', () => {
    expect(percentage(10, 0)).toBe(0);
  });

  it('returns 0 when part is 0', () => {
    expect(percentage(0, 100)).toBe(0);
  });
});

describe('sum()', () => {
  it('sums a list of numbers', () => {
    expect(sum([1, 2, 3, 4])).toBe(10);
  });

  it('returns 0 for an empty array', () => {
    expect(sum([])).toBe(0);
  });

  it('handles negative numbers', () => {
    expect(sum([-1, -2, 3])).toBe(0);
  });
});
