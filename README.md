# Order Management API

A TypeScript service that models a product inventory and order lifecycle. Built as a POC to explore clean architecture patterns in Node.js — thin API/controller layer, a pure service layer, shared type models, and input validation.

---

## What it does

- **Product inventory** — create, list (with category filter), update, and delete products. Prices are rounded on write; stock is validated as non-negative.
- **Order lifecycle** — place orders against real inventory, enforce stock availability, snapshot prices at order time, and advance orders through a validated status machine (`pending → confirmed → shipped → delivered`, with cancellation at any pre-delivery stage).
- **Input validation** — a lightweight `ValidationError` class with field-level messages, used consistently across all service boundaries.
- **Automatic stock deduction** — placing an order reduces the product's stock atomically within the same operation.

---

## Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript 5 (strict mode)
- **Testing**: Jest + ts-jest (unit tests, ~61 assertions)
- **Linting**: ESLint with `@typescript-eslint`
- **Formatting**: Prettier

---

## Project Structure

```
src/
├── models/
│   ├── product.ts          # Product, Category, CreateProductInput, UpdateProductInput
│   └── order.ts            # Order, OrderItem, OrderStatus, CreateOrderInput
├── utils/
│   ├── id.ts               # UUID generation and validation
│   ├── math.ts             # round(), clamp(), percentage(), sum()
│   └── validator.ts        # ValidationError + guard functions
├── services/
│   ├── product-service.ts  # CRUD over in-memory product store
│   └── order-service.ts    # Order creation, status transitions, customer queries
└── index.ts                # Demo entry point

tests/
├── utils/
│   ├── math.test.ts
│   └── validator.test.ts
└── services/
    ├── product-service.test.ts
    └── order-service.test.ts
```

---

## Getting Started

```bash
npm install

# Run the demo
npm run dev

# Run all tests
npm test

# Test coverage report
npm run test:coverage
```

---

## Architecture Notes

**Layered design** — API routes (or the `index.ts` entry point) stay thin and only call service functions. All business logic lives in `src/services/`. Utils are pure functions with no side effects.

**In-memory store** — `Map<string, Product>` and `Map<string, Order>` stand in for a database. Each service exposes a `resetStore()` function so tests start with a clean slate without global state leaking between cases.

**Status machine** — `updateOrderStatus` enforces explicit allowed transitions per status. Invalid moves throw with a descriptive message rather than silently failing.

**Validation at the boundary** — every public service function validates its inputs before touching state. The `ValidationError` class carries the field name, making it easy to surface structured errors to an API layer.

---

## Sample Output

```
=== Product & Order Demo ===

Created products:
  [electronics] Laptop Pro 15 — $1299.99 (stock: 10)
  [books] Developer Notebook — $12.5 (stock: 50)

Order created: <uuid>
  Items: 2, Total: $1324.99
  Status: pending

Order after shipping:
  Status: shipped

Products after order:
  Laptop Pro 15 — stock: 9
  Developer Notebook — stock: 48
```
