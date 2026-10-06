# Everyday Market

A small, responsive Amazon-inspired storefront built with Next.js App Router, TypeScript, and Tailwind CSS 4. Product data lives in `src/lib/products.json`; cart, saved lists, addresses, mock orders, and demo checkout state live in browser `localStorage`. There is no backend or required environment configuration.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Phase 1 routes

- `/` — a quieter home page with a small set of discovery rows.
- `/search?q=desk+lamp` — search and expandable category, Prime, material, brand, price, rating, and sort controls.
- `/product/desk-lamp` — product details, pointer/tap image zoom, add to cart, and save-to-list modal.
- `/cart` — quantity management, remove/save actions, recommendations, and subtotal.
- `/checkout` — delivery details and a local-only mock card payment form.
- `/order-confirmation` — details of the most recently placed local demo order.

All catalog product IDs are also available as static product routes. Images use Unsplash's public image CDN and require an internet connection in the browser.

## Validation

```bash
npm run lint
npm run build
```
