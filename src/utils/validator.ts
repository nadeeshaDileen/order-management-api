// utils/validator.ts
// Practice: Cmd+Shift+F to search for "ValidationError" across all files

export class ValidationError extends Error {
  constructor(
    public readonly field: string,
    message: string
  ) {
    super(`Validation failed for "${field}": ${message}`);
    this.name = 'ValidationError';
  }
}

/**
 * Asserts that a string is non-empty after trimming.
 */
export function requireNonEmpty(value: string, field: string): void {
  if (!value || value.trim().length === 0) {
    throw new ValidationError(field, 'must not be empty');
  }
}

/**
 * Asserts that a number is positive (> 0).
 */
export function requirePositive(value: number, field: string): void {
  if (value <= 0) {
    throw new ValidationError(field, `must be positive, got ${value}`);
  }
}

/**
 * Asserts that a number is >= 0.
 */
export function requireNonNegative(value: number, field: string): void {
  if (value < 0) {
    throw new ValidationError(field, `must be >= 0, got ${value}`);
  }
}
