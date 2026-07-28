# ZARAHATKE — Ethnic Fashion E-commerce

## Original Problem Statement
> "Convert this UI page in code so that i can build the website"

User provided a screenshot of a ZARAHATKE Ethnic Fashion homepage (Indian ethnic wear e-commerce) and asked to convert it to code. User confirmed a full working store with backend APIs, functional cart/wishlist/carousel, Unsplash stock images, and a wired newsletter.

## Architecture
- **Backend**: FastAPI + MongoDB (motor). Routes prefixed `/api`. In-memory product/category/review/hero/instagram catalog; MongoDB used only for newsletter subscriptions (upsert by email, idempotent).
- **Frontend**: React 19 + Tailwind + Shadcn UI primitives + sonner toasts. React Router at `/`. Client-side cart + wishlist state via React Context (`StoreContext`).
- **Fonts**: Playfair Display (display) + Manrope (body). Palette: maroon-900 `#5D101C`, gold-500 `#C5A059`, cream-50 `#FBF9F6`.

## User Personas
- Indian ethnic wear shopper browsing sarees, kurtis, lehengas
- Visitor evaluating brand trust (reviews, secure payment badges)
- Newsletter subscriber (10% off first order)

## Core Requirements (static)
- Homepage matching the reference screenshot: announcement bar, header (logo/search/account/wishlist/cart), horizontal nav, hero carousel, category tiles + sale bubble, service strip, new arrivals grid, festive edit CTA, why-choose-us, best sellers, instagram feed, customer reviews, newsletter, trust strip, footer
- Working cart & wishlist (add / remove / qty update / move-to-bag)
- Newsletter subscribe API with idempotent upsert
- Fully responsive (mobile 390px verified: 0 horizontal overflow)

## What's Been Implemented (2026-02-01)
- Backend endpoints: `GET /api/`, `GET /api/products` (+`?section=`), `GET /api/products/{id}`, `GET /api/categories`, `GET /api/reviews`, `GET /api/hero-slides`, `GET /api/instagram-feed`, `POST /api/newsletter`
- 14 products across `new_arrivals` (8) and `best_sellers` (6); 8 categories + Sale tile; 3 hero slides with auto-advance + prev/next/dots; 6 instagram tiles; 3 rotating reviews
- Frontend: full homepage composition, animated hero carousel, sliding cart & wishlist drawers, hover ADD TO BAG, wishlist heart toggle, newsletter form with toast success
- Testing: 16/16 backend pytest cases green; frontend flows validated end-to-end by testing agent

## Prioritized Backlog

### P0 — none (MVP complete)

### P1
- Product detail page (`/product/:id`) with size selector & related products
- Category listing pages (Sarees, Kurtis, etc.) with filter/sort
- Real checkout flow (currently `PROCEED TO CHECKOUT` is a stub)
- Curate distinct product photos so image ≠ duplicated across cards

### P2
- Auth (login / register / order history) — needs integration_playbook_expert_v2 first
- Wishlist & cart persistence (MongoDB) across sessions
- Search functionality wired to backend
- Inline newsletter email validation (currently only native HTML5 validation)
- Admin panel to manage products

## Notes
- All product data is in-memory in `/app/backend/server.py`. Newsletter is the only Mongo-persisted collection.
- Backend regression tests: `/app/backend/tests/backend_test.py`
