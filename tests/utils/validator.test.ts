// tests/utils/validator.test.ts

import {
  requireNonEmpty,
  requirePositive,
  requireNonNegative,
  ValidationError,
} from '../../src/utils/validator';

describe('requireNonEmpty()', () => {
  it('does not throw for a valid string', () => {
    expect(() => requireNonEmpty('hello', 'field')).not.toThrow();
  });

  it('throws ValidationError for an empty string', () => {
    expect(() => requireNonEmpty('', 'username')).toThrow(ValidationError);
  });

  it('throws for a whitespace-only string', () => {
    expect(() => requireNonEmpty('   ', 'username')).toThrow(ValidationError);
  });

  it('includes the field name in the error message', () => {
    expect(() => requireNonEmpty('', 'email')).toThrow(/email/);
  });
});

describe('requirePositive()', () => {
  it('does not throw for a positive number', () => {
    expect(() => requirePositive(1, 'price')).not.toThrow();
  });

  it('throws for zero', () => {
    expect(() => requirePositive(0, 'price')).toThrow(ValidationError);
  });

  it('throws for a negative number', () => {
    expect(() => requirePositive(-5, 'price')).toThrow(ValidationError);
  });
});

describe('requireNonNegative()', () => {
  it('does not throw for zero', () => {
    expect(() => requireNonNegative(0, 'stock')).not.toThrow();
  });

  it('does not throw for a positive number', () => {
    expect(() => requireNonNegative(10, 'stock')).not.toThrow();
  });

  it('throws for a negative number', () => {
    expect(() => requireNonNegative(-1, 'stock')).toThrow(ValidationError);
  });
});

describe('ValidationError', () => {
  it('is an instance of Error', () => {
    const err = new ValidationError('field', 'is bad');
    expect(err).toBeInstanceOf(Error);
  });

  it('exposes the field name', () => {
    const err = new ValidationError('email', 'is bad');
    expect(err.field).toBe('email');
  });

  it('has the name "ValidationError"', () => {
    const err = new ValidationError('x', 'msg');
    expect(err.name).toBe('ValidationError');
  });
});
