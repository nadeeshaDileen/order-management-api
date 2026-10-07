// tests/services/order-service.test.ts


import { createOrder, findOrder, getOrdersByCustomer, updateOrderStatus, resetOrderStore } from '../../src/services/order-service';
import { createProduct, resetStore } from '../../src/services/product-service';

// Reset both stores before each test
beforeEach(() => {
  resetStore();
  resetOrderStore();
});

// Helper: create a product and return it (reduces repetition in tests)
function makeProduct(stock = 10) {
  return createProduct({
    name: 'Widget',
    price: 25.0,
    category: 'electronics',
    stock,
  });
}

describe('createOrder()', () => {
  it('creates an order in pending status', () => {
    const p = makeProduct();
    const order = createOrder({
      customerId: 'cust-1',
      items: [{ productId: p.id, quantity: 2 }],
    });

    expect(order.id).toBeDefined();
    expect(order.status).toBe('pending');
    expect(order.customerId).toBe('cust-1');
    expect(order.items).toHaveLength(1);
  });

  it('calculates totalAmount correctly', () => {
    const p = makeProduct(); // price: 25.00
    const order = createOrder({
      customerId: 'cust-1',
      items: [{ productId: p.id, quantity: 3 }],
    });
    expect(order.totalAmount).toBe(75); // 25 × 3
  });

  it('snapshots the unit price', () => {
    const p = makeProduct(); // price: 25
    const order = createOrder({
      customerId: 'cust-1',
      items: [{ productId: p.id, quantity: 1 }],
    });
    expect(order.items[0].unitPrice).toBe(25);
  });

  it('deducts stock from the product', () => {
    const p = makeProduct(10);

    createOrder({
      customerId: 'cust-1',
      items: [{ productId: p.id, quantity: 4 }],
    });

    // findProduct reads from the same in-memory store — no mock needed
    const { findProduct } = require('../../src/services/product-service');
    const updated = findProduct(p.id);
    expect(updated?.stock).toBe(6); // 10 - 4
  });

  it('throws when product does not exist', () => {
    expect(() =>
      createOrder({ customerId: 'cust-1', items: [{ productId: 'ghost', quantity: 1 }] })
    ).toThrow('Product not found');
  });

  it('throws when quantity exceeds stock', () => {
    const p = makeProduct(2);
    expect(() =>
      createOrder({ customerId: 'cust-1', items: [{ productId: p.id, quantity: 5 }] })
    ).toThrow('Insufficient stock');
  });

  it('throws when items array is empty', () => {
    expect(() =>
      createOrder({ customerId: 'cust-1', items: [] })
    ).toThrow('at least one item');
  });

  it('throws when quantity is 0', () => {
    const p = makeProduct();
    expect(() =>
      createOrder({ customerId: 'cust-1', items: [{ productId: p.id, quantity: 0 }] })
    ).toThrow('Quantity must be > 0');
  });
});

describe('findOrder()', () => {
  it('returns an existing order', () => {
    const p = makeProduct();
    const order = createOrder({
      customerId: 'cust-1',
      items: [{ productId: p.id, quantity: 1 }],
    });
    expect(findOrder(order.id)).toEqual(order);
  });

  it('returns undefined for unknown id', () => {
    expect(findOrder('nobody')).toBeUndefined();
  });
});

describe('getOrdersByCustomer()', () => {
  it('returns only the matching customer\'s orders', () => {
    const p = makeProduct(50);
    createOrder({ customerId: 'alice', items: [{ productId: p.id, quantity: 1 }] });
    createOrder({ customerId: 'alice', items: [{ productId: p.id, quantity: 1 }] });
    createOrder({ customerId: 'bob', items: [{ productId: p.id, quantity: 1 }] });

    expect(getOrdersByCustomer('alice')).toHaveLength(2);
    expect(getOrdersByCustomer('bob')).toHaveLength(1);
  });

  it('returns empty array when no orders exist for customer', () => {
    expect(getOrdersByCustomer('nobody')).toEqual([]);
  });
});

describe('updateOrderStatus()', () => {
  it('transitions pending → confirmed', () => {
    const p = makeProduct();
    const order = createOrder({ customerId: 'c', items: [{ productId: p.id, quantity: 1 }] });
    const updated = updateOrderStatus(order.id, 'confirmed');
    expect(updated.status).toBe('confirmed');
  });

  it('transitions confirmed → shipped → delivered', () => {
    const p = makeProduct();
    const order = createOrder({ customerId: 'c', items: [{ productId: p.id, quantity: 1 }] });

    updateOrderStatus(order.id, 'confirmed');
    updateOrderStatus(order.id, 'shipped');
    const delivered = updateOrderStatus(order.id, 'delivered');

    expect(delivered.status).toBe('delivered');
  });

  it('throws on invalid status transition', () => {
    const p = makeProduct();
    const order = createOrder({ customerId: 'c', items: [{ productId: p.id, quantity: 1 }] });
    // pending → delivered is not allowed (must go through confirmed + shipped first)
    expect(() => updateOrderStatus(order.id, 'delivered')).toThrow('Cannot transition');
  });

  it('throws for unknown order id', () => {
    expect(() => updateOrderStatus('ghost', 'confirmed')).toThrow('Order not found');
  });
});
