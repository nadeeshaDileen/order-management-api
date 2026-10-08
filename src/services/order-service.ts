// services/order-service.ts

import { Order, CreateOrderInput, OrderStatus } from '../models/order';
import { findProduct, updateProduct } from './product-service';
import { generateId } from '../utils/id';
import { sum, round } from '../utils/math';
import { requireNonEmpty } from '../utils/validator';

const orderStore = new Map<string, Order>();

/**
 * Creates an order.
 * - Validates each product exists and has enough stock.
 * - Deducts stock on confirmation.
 * - Snapshots the unit price at order time (price may change later).
 */
export function createOrder(input: CreateOrderInput): Order {
  requireNonEmpty(input.customerId, 'customerId');

  if (input.items.length === 0) {
    throw new Error('Order must have at least one item');
  }

  // Validate and resolve products
  const resolvedItems = input.items.map((item) => {
    if (item.quantity <= 0) {
      throw new Error(`Quantity must be > 0, got ${item.quantity}`);
    }

    const product = findProduct(item.productId);
    if (!product) {
      throw new Error(`Product not found: ${item.productId}`);
    }

    if (product.stock < item.quantity) {
      throw new Error(
        `Insufficient stock for "${product.name}": requested ${item.quantity}, available ${product.stock}`
      );
    }

    return {
      product,
      quantity: item.quantity,
      unitPrice: product.price, // snapshot
    };
  });

  // Deduct stock
  resolvedItems.forEach(({ product, quantity }) => {
    updateProduct(product.id, { stock: product.stock - quantity });
  });

  const totalAmount = round(sum(resolvedItems.map((i) => i.unitPrice * i.quantity)));

  const order: Order = {
    id: generateId(),
    customerId: input.customerId,
    items: resolvedItems,
    status: 'pending',
    totalAmount,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  orderStore.set(order.id, order);
  return order;
}

/**
 * Returns an order by ID.
 */
export function findOrder(id: string): Order | undefined {
  return orderStore.get(id);
}

/**
 * Returns all orders for a given customer.
 */
export function getOrdersByCustomer(customerId: string): Order[] {
  return Array.from(orderStore.values()).filter((o) => o.customerId === customerId);
}

/**
 * Advances the order status through its lifecycle.
 * Invalid transitions throw an error.
 */
export function updateOrderStatus(id: string, newStatus: OrderStatus): Order {
  const order = orderStore.get(id);
  if (!order) throw new Error(`Order not found: ${id}`);

  const allowed: Record<OrderStatus, OrderStatus[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: [],
  };

  if (!allowed[order.status].includes(newStatus)) {
    throw new Error(`Cannot transition order from "${order.status}" to "${newStatus}"`);
  }

  const updated: Order = { ...order, status: newStatus, updatedAt: new Date() };
  orderStore.set(id, updated);
  return updated;
}

/**
 * Cancels an order and restores stock to each product.
 * Only orders that are pending or confirmed can be cancelled.
 */
export function cancelOrder(orderId: string): Order {
  const order = orderStore.get(orderId);
  if (!order) throw new Error(`Order not found: ${orderId}`);

  if (order.status !== 'pending' && order.status !== 'confirmed') {
    throw new Error(`Cannot cancel an order with status "${order.status}"`);
  }

  // Restore stock for each item
  order.items.forEach((item) => {
    const product = findProduct(item.product.id);
    if (product) {
        updateProduct(product.id, { stock: product.stock + item.quantity });
    }
  });

  const updated: Order = { ...order, status: 'cancelled', updatedAt: new Date() };
  orderStore.set(orderId, updated);
  return updated;
}

/**
 * Resets order store — used in tests.
 */
export function resetOrderStore(): void {
  orderStore.clear();
}
