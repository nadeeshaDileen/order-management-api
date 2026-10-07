// utils/id.ts

import { randomUUID } from 'crypto';

/**
 * Generates a unique ID.
 * Uses Node's built-in crypto.randomUUID — no external dependency needed.
 */
export function generateId(): string {
  return randomUUID();
}

/**
 * Checks whether a string looks like a valid UUID v4.
 * Good for input validation before hitting the database.
 */
export function isValidId(id: string): boolean {
  const uuidV4Pattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidV4Pattern.test(id);
}
