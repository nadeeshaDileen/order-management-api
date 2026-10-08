// services/product-service.ts

import { Product, CreateProductInput, UpdateProductInput } from '../models/product';
import { generateId } from '../utils/id';
import { round } from '../utils/math';
import { requireNonEmpty, requirePositive, requireNonNegative, ValidationError } from '../utils/validator';

// In-memory store — swap for a DB client when needed
const store = new Map<string, Product>();

/**
 * Creates a new product and persists it in the store.
 * Throws ValidationError for bad inputs.
 */
export function createProduct(input: CreateProductInput): Product {
  requireNonEmpty(input.name, 'name');
  requirePositive(input.price, 'price');
  requireNonNegative(input.stock, 'stock');

  const product: Product = {
    id: generateId(),
    name: input.name.trim(),
    price: round(input.price),
    category: input.category,
    stock: input.stock,
    tags: input.tags ?? [],
    createdAt: new Date(),
  };

  store.set(product.id, product);
  return product;
}

/**
 * Returns all products, optionally filtered by category.
 */
export function listProducts(category?: Product['category']): Product[] {
  const all = Array.from(store.values());
  if (!category) return all;
  return all.filter((p) => p.category === category);
}

/**
 * Finds a product by ID. Returns undefined if not found.
 */
export function findProduct(id: string): Product | undefined {
  return store.get(id);
}

/**
 * Updates a product's mutable fields.
 * Throws if the product doesn't exist or any new value is invalid.
 */
  export function updateProduct(id: string, input: UpdateProductInput): Product {
  const existing = store.get(id);
  if (!existing) {
    throw new Error(`Product not found: ${id}`);
  }

  if (input.name !== undefined) requireNonEmpty(input.name, 'name');
  if (input.price !== undefined) requirePositive(input.price, 'price');
  if (input.stock !== undefined) requireNonNegative(input.stock, 'stock');

  const updated: Product = {
    ...existing,
    name: input.name?.trim() ?? existing.name,
    price: input.price !== undefined ? round(input.price) : existing.price,
    stock: input.stock ?? existing.stock,
    tags: input.tags ?? existing.tags,
  };

  store.set(id, updated);
  return updated;
}

/**
 * Removes a product from the store.
 * Returns true if deleted, false if not found.
 */
export function deleteProduct(id: string): boolean {
  return store.delete(id);
}

/**
 * Resets the in-memory store — useful in tests to start clean.
 */
export function resetStore(): void {
  store.clear();
}
