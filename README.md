# Jochenna Storefront

Modern thrift storefront for kidswear and essentials, built with Next.js App Router, TypeScript, Tailwind CSS, Framer Motion, and Zustand.

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Zustand (cart/wishlist/feedback stores)
- Framer Motion

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
cp .env.example .env.local
```

3. Set backend URL in `.env.local`:

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

4. Run the app:

```bash
npm run dev
```

If port 3000 is busy, use:

```bash
npm run dev -- -p 3002
```

## Scripts

- `npm run dev`: Start development server.
- `npm run build`: Create production build.
- `npm run start`: Start production server.
- `npm run lint`: Run ESLint checks.
- `npm run test`: Run Vitest in watch mode.
- `npm run test:run`: Run Vitest once.
- `npm run typecheck`: Run TypeScript checks.
- `npm run check`: Run lint + typecheck + unit tests + build.

## Routes

- `/`: Home page with hero and featured products.
- `/shop`: Product catalog with filters and sorting.
- `/product/[id]`: Product detail page and related products.
- `/wishlist`: Saved wishlist items.
- `/checkout`: Two-step checkout flow.

## Data and API Contract

Frontend expects a backend at `NEXT_PUBLIC_BACKEND_URL` with these endpoints:

- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products` (admin use)
- `POST /api/products/seed`
- `POST /api/orders` (optional; checkout falls back to demo mode when missing)

Notes:

- Product IDs are normalized to strings in the frontend.
- If `NEXT_PUBLIC_BACKEND_URL` is missing or invalid, app falls back to `http://localhost:5000` and logs a warning.

## Project Structure

- `app/`: Routes, route-level loading states, and error boundaries.
- `components/`: UI building blocks and product/cart components.
- `lib/`: API client and shared types.
- `shore/`: Zustand stores (cart, wishlist, feedback).
- `data/`: Local seed/example product data.

## Current Checkout Behavior

- Validates required fields, email, and postal code format.
- Submits order payload to `POST /api/orders` when available.
- Uses demo-mode success fallback when order endpoint is not implemented.

## Quality Checklist

Run this before shipping:

```bash
npm run check
```

## Deployment

For production deployment, ensure:

- `NEXT_PUBLIC_BACKEND_URL` points to your live backend.
- Backend supports the API routes listed above.
- `npm run check` passes in CI.
