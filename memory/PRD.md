# ZARAHATKE — Ethnic Fashion E-commerce

## Original Problem Statement
> "Convert this UI page in code so that i can build the website"

User provided a screenshot of a ZARAHATKE Ethnic Fashion homepage (Indian ethnic wear e-commerce) and asked to convert it to code. Follow-up asks: full working store with product detail pages, category listings, real checkout (Stripe + COD), and shoppable Instagram.

## Architecture
- **Backend**: FastAPI + MongoDB (motor). Routes prefixed `/api`. In-memory product/category/review/hero/instagram catalog; MongoDB persists newsletter subscriptions and orders.
- **Frontend**: React 19 + Tailwind + Shadcn UI primitives + sonner toasts. React Router. Client-side cart + wishlist state via React Context (`StoreContext`), persisted to `localStorage`.
- **Payments**: Stripe via `emergentintegrations` (Flow B / BYOK with `sk_test_emergent`) + Cash on Delivery. INR pricing.
- **Fonts**: Playfair Display (display) + Manrope (body). Palette: maroon-900 `#5D101C`, gold-500 `#C5A059`, cream-50 `#FBF9F6`.
- **Docs**: See `/app/docs/ARCHITECTURE.md` for the full page map and data flow.

## User Personas
- Indian ethnic wear shopper browsing sarees, kurtis, lehengas
- Bride-to-be looking for a wedding collection
- Newsletter subscriber (10% off first order)
- Instagram browser wanting to "shop the look"

## Core Requirements (static)
- Homepage matching the reference screenshot
- Product detail pages with sizes, quantity, add to bag, buy now, related products
- Category listing pages with price filter + sort
- Cart + wishlist (persisted across reloads)
- Checkout with Stripe (card/UPI/netbanking) and Cash on Delivery
- Order confirmation & status polling
- Shoppable Instagram — click any tile to see products styled in that look
- Newsletter subscribe (idempotent)
- Fully responsive (mobile 390px verified: 0 horizontal overflow)

## What's Been Implemented

### Iteration 1 (2026-02-01) — Homepage MVP
- Backend endpoints: `GET /api/`, `/api/products` (+`?section=`), `/api/products/{id}`, `/api/categories`, `/api/reviews`, `/api/hero-slides`, `/api/instagram-feed`, `POST /api/newsletter`
- 14 products across `new_arrivals` (8) and `best_sellers` (6); 8 categories + Sale tile; 3 hero slides; 6 instagram tiles; 3 reviews
- Full homepage composition, cart & wishlist drawers, hover ADD TO BAG, newsletter form

### Iteration 2 (2026-02-01) — Store enhancements
- Product Detail page (`/product/:id`) — gallery, size selector, quantity, add to bag / buy now, wishlist, related products
- Category listing (`/category/:slug`) — hero banner, price-range filter, sort dropdown, empty-collection state
- Checkout (`/checkout`) — address form, COD + Stripe method picker, order summary with editing, free-shipping logic (₹1999+)
- Payment flow — `/payment/success` (polls `/api/payments/status`), `/payment/cancel`, `/order/:id` order confirmation
- Shoppable Instagram — clicking a tile opens a modal with the styled look + curated products, each with ADD TO BAG
- Cart & wishlist persisted to `localStorage` (`zk_cart`, `zk_wishlist`)
- Cart dedup by product.id + size (same product different sizes stay separate lines)
- Backend: `POST /api/checkout`, `GET /api/payments/status/{id}`, `POST /api/webhook/stripe`, `GET /api/orders/{id}`, `GET /api/categories/{slug}`, `GET /api/instagram-feed/{look_id}`

### Verified end-to-end
- All backend tests green (50/50 pytest cases)
- COD checkout: add product → drawer → checkout → address → COD → order confirmation with cart cleared
- Stripe path returns valid `checkout.stripe.com` URL (hosted page not completed in tests)
- Cart survives page reload + Stripe redirect roundtrip
- Empty category shows "This collection is on its way"
- Shoppable Instagram modal opens with 3 products + shop links
- Mobile 390px: no horizontal overflow

## Prioritized Backlog

### P0 — none

### P1
- Auth (login / register / order history) — MUST call `integration_playbook_expert_v2` first
- Real user reviews with photo upload (currently seeded)
- Order tracking page with status timeline
- More product photos (each product currently uses one image cycled across gallery slots)
- Distinct hero copy per slide (currently 3 seeded slides all in-image)

### P2
- Search wired to backend + typeahead
- Admin panel to manage products / view orders
- Email confirmations via Resend/SendGrid on order + payment webhook
- Inventory / stock tracking
- Multi-currency (USD/GBP)
- Loyalty points / referral

## Notes
- Product data is in-memory in `/app/backend/server.py`. Only `newsletter` and `orders` collections persist to Mongo.
- India isn't supported for claimable Stripe sandboxes, so we use the shared Emergent test key.
- Backend regression tests: `/app/backend/tests/backend_test.py`, `/app/backend/tests/test_new_features.py`
- See `/app/docs/ARCHITECTURE.md` for the full code map.
