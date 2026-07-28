# ZARAHATKE — Ethnic Fashion E-commerce

> _Tradition Woven with Elegance._

A full-stack online store for Indian ethnic wear — sarees, kurtis, kurta sets, lehengas, dupattas, co-ord sets, wedding collection, and dresses. Built with React, FastAPI, MongoDB, Stripe, and Emergent object storage.

**Live preview:** [`https://code-generator-392.preview.emergentagent.com`](https://code-generator-392.preview.emergentagent.com)

---

## Quick start

```bash
# 1. Start MongoDB (leave it running)
mongod

# 2. Backend  (terminal 2)
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn server:app --reload --host 0.0.0.0 --port 8001

# 3. Frontend (terminal 3)
cd frontend
yarn install
yarn start
```

Then open **[http://localhost:3000](http://localhost:3000)**.

The full setup guide (prerequisites, env variables, deploying to production, troubleshooting) lives in **[docs/GETTING_STARTED.md](docs/GETTING_STARTED.md)**.

---

## Features

- **Homepage** — hero carousel, categories, service strip, new arrivals, festive edit CTA, best sellers, shoppable Instagram, customer reviews, newsletter, trust badges, footer
- **Product Detail** — image gallery, size selector, quantity, add-to-bag, buy-now, wishlist, related products
- **Category listings** — price-range filter, sort, empty-collection state, DB uploads before seeded items
- **Cart + Wishlist** — client-side state persisted in `localStorage`; dedup by product + size
- **Checkout** — full address form, **Stripe hosted checkout** or **Cash on Delivery**, free-shipping threshold, order confirmation
- **Payment success flow** — polls `/api/payments/status`, then routes to `/order/:id`
- **Shoppable Instagram** — tap a tile to open a modal with the products styled in that look
- **Admin panel** (`/admin`, token-gated) — single-product form, **bulk uploader** (drag up to 10 photos), **edit-in-place** modal, delete, view seeded vs. DB products
- **Image sources** — external URLs, `public/images/products/` folder, or Emergent object storage via the admin uploader — all three work simultaneously

---

## Documentation

| Doc | What's inside |
|---|---|
| **[docs/GETTING_STARTED.md](docs/GETTING_STARTED.md)** | How and where to run the whole flow — Emergent preview + local dev + env variables + production deploy + troubleshooting |
| **[docs/ADMIN_GUIDE.md](docs/ADMIN_GUIDE.md)** | Step-by-step admin panel walkthrough for uploading photos into each category (Sarees, Kurtis, Lehengas, …) |
| **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** | Complete code map — repo structure, route diagram, user journey, data flow, "where to change X" table |

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router, Tailwind CSS, Shadcn UI, Sonner (toasts), lucide-react (icons) |
| Backend | FastAPI, motor (async MongoDB), Pydantic v2 |
| Database | MongoDB (only `newsletter`, `orders`, `products`, `files` collections persist) |
| Payments | Stripe (via `emergentintegrations`) + Cash on Delivery |
| Storage | Emergent object storage for admin-uploaded photos |
| Fonts | Playfair Display (display) + Manrope (body) |

---

## Repo structure

```
/app
├── backend/         FastAPI — server.py holds every /api endpoint
├── frontend/        React app (src/pages, src/components/site, src/context, src/lib)
├── docs/            All documentation (see the table above)
└── memory/          PRD.md, test_credentials.md
```

See **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** for the full breakdown.

---

## Credentials (dev / test)

| What | Value |
|---|---|
| Admin panel token | `zarahatke-admin-2026` (from `backend/.env` → `ADMIN_TOKEN`) |
| Stripe test key | `sk_test_emergent` (shared Emergent sandbox) |
| Stripe test card | `4242 4242 4242 4242`, any future expiry, any CVC |

**Rotate `ADMIN_TOKEN` and swap `STRIPE_API_KEY` for a live key before going public.**

---

## License

Private / proprietary — all rights reserved.
