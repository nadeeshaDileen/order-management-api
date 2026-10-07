// tests/services/product-service.test.ts

import {
  createProduct,
  listProducts,
  findProduct,
  updateProduct,
  deleteProduct,
  resetStore,
} from '../../src/services/product-service';
import { ValidationError } from '../../src/utils/validator';

// Clean store before every test so tests don't bleed into each other
beforeEach(() => {
  resetStore();
});

describe('createProduct()', () => {
  it('creates a product with correct fields', () => {
    const p = createProduct({
      name: 'Test Laptop',
      price: 999.99,
      category: 'electronics',
      stock: 5,
    });

    expect(p.id).toBeDefined();
    expect(p.name).toBe('Test Laptop');
    expect(p.price).toBe(999.99);
    expect(p.category).toBe('electronics');
    expect(p.stock).toBe(5);
    expect(p.tags).toEqual([]);
    expect(p.createdAt).toBeInstanceOf(Date);
  });

  it('trims whitespace from name', () => {
    const p = createProduct({ name: '  Trimmed  ', price: 10, category: 'books', stock: 1 });
    expect(p.name).toBe('Trimmed');
  });

  it('rounds price to 2 decimal places', () => {
    const p = createProduct({ name: 'Pricy', price: 9.999, category: 'food', stock: 1 });
    expect(p.price).toBe(10); // 9.999 rounds to 10.00
  });

  it('accepts optional tags', () => {
    const p = createProduct({
      name: 'Tagged',
      price: 5,
      category: 'clothing',
      stock: 10,
      tags: ['sale', 'new'],
    });
    expect(p.tags).toEqual(['sale', 'new']);
  });

  it('throws ValidationError for empty name', () => {
    expect(() =>
      createProduct({ name: '', price: 10, category: 'books', stock: 1 })
    ).toThrow(ValidationError);
  });

  it('throws ValidationError for zero price', () => {
    expect(() =>
      createProduct({ name: 'Free?', price: 0, category: 'books', stock: 1 })
    ).toThrow(ValidationError);
  });

  it('throws ValidationError for negative stock', () => {
    expect(() =>
      createProduct({ name: 'Item', price: 10, category: 'food', stock: -1 })
    ).toThrow(ValidationError);
  });
});

describe('listProducts()', () => {
  it('returns all products when no filter is given', () => {
    createProduct({ name: 'A', price: 1, category: 'books', stock: 1 });
    createProduct({ name: 'B', price: 2, category: 'electronics', stock: 1 });
    expect(listProducts()).toHaveLength(2);
  });

  it('filters by category', () => {
    createProduct({ name: 'A', price: 1, category: 'books', stock: 1 });
    createProduct({ name: 'B', price: 2, category: 'electronics', stock: 1 });
    const books = listProducts('books');
    expect(books).toHaveLength(1);
    expect(books[0].name).toBe('A');
  });

  it('returns empty array when store is empty', () => {
    expect(listProducts()).toEqual([]);
  });
});

describe('findProduct()', () => {
  it('returns the product when it exists', () => {
    const p = createProduct({ name: 'Find Me', price: 5, category: 'food', stock: 2 });
    expect(findProduct(p.id)).toEqual(p);
  });

  it('returns undefined for a missing id', () => {
    expect(findProduct('non-existent-id')).toBeUndefined();
  });
});

describe('updateProduct()', () => {
  it('updates only the provided fields', () => {
    const p = createProduct({ name: 'Original', price: 10, category: 'books', stock: 5 });
    const updated = updateProduct(p.id, { price: 15 });

    expect(updated.price).toBe(15);
    expect(updated.name).toBe('Original'); // unchanged
    expect(updated.stock).toBe(5);         // unchanged
  });

  it('throws when product does not exist', () => {
    expect(() => updateProduct('ghost-id', { price: 5 })).toThrow('not found');
  });
});

describe('deleteProduct()', () => {
  it('deletes a product and returns true', () => {
    const p = createProduct({ name: 'Delete Me', price: 1, category: 'food', stock: 1 });
    expect(deleteProduct(p.id)).toBe(true);
    expect(findProduct(p.id)).toBeUndefined();
  });

  it('returns false when product does not exist', () => {
    expect(deleteProduct('ghost-id')).toBe(false);
  });
});

describe('edge cases', () => {
  it('stock reaches zero after selling all units', () => {
    const p = createProduct({ name: 'Last One', price: 50, category: 'electronics', stock: 3 });
    const updated = updateProduct(p.id, { stock: 0 });
    expect(updated.stock).toBe(0);
  });
});
