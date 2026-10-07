// index.ts — entry point

import { createProduct, listProducts } from './services/product-service';
import { createOrder, updateOrderStatus, findOrder } from './services/order-service';

function main(): void {
  console.log('=== Product & Order Demo ===\n');

  // Create products
  const laptop = createProduct({
    name: 'Laptop Pro 15',
    price: 1299.99,
    category: 'electronics',
    stock: 10,
    tags: ['laptop', 'pro'],
  });

  const notebook = createProduct({
    name: 'Developer Notebook',
    price: 12.5,
    category: 'books',
    stock: 50,
    tags: ['notebook', 'stationery'],
  });

  console.log('Created products:');
  listProducts().forEach((p) => {
    console.log(`  [${p.category}] ${p.name} — $${p.price} (stock: ${p.stock})`);
  });

  // Place an order
  const order = createOrder({
    customerId: 'customer-abc',
    items: [
      { productId: laptop.id, quantity: 1 },
      { productId: notebook.id, quantity: 2 },
    ],
  });

  console.log(`\nOrder created: ${order.id}`);
  console.log(`  Items: ${order.items.length}, Total: $${order.totalAmount}`);
  console.log(`  Status: ${order.status}`);

  // Advance the order through its lifecycle
  updateOrderStatus(order.id, 'confirmed');
  updateOrderStatus(order.id, 'shipped');

  const shipped = findOrder(order.id);
  console.log(`\nOrder after shipping:`);
  console.log(`  Status: ${shipped?.status}`);

  // Stock was deducted when the order was placed
  console.log('\nProducts after order:');
  listProducts().forEach((p) => {
    console.log(`  ${p.name} — stock: ${p.stock}`);
  });
}

main();
