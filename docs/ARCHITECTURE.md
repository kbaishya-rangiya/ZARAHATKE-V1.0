# ZARAHATKE — Architecture Guide

A quick map of the codebase so you can find, edit, and extend any part of the site with confidence.

---

## 1. Front page location

The homepage you see on `/` is composed by:

**`/app/frontend/src/pages/Home.jsx`**

`Home.jsx` doesn't contain any UI itself — it just stitches together six section components in order:

1. `Hero` — festive collection carousel
2. `Categories` — circular category tiles + Sale bubble
3. `ServiceStrip` — Free Shipping / COD / Easy Returns row
4. `NewArrivalsAndAside` — product grid + Festive Edit CTA + Why Choose Us
5. `BestSellersAndFeed` — best sellers + Instagram feed + reviews + newsletter
6. `TrustStrip` — bottom trust-badges row

The chrome around it (announcement bar, header, footer, cart drawer, wishlist drawer) comes from `SiteChrome.jsx` which wraps every route via `<Outlet />`.

---

## 2. Repository structure

```
/app
│
├── backend/
│   ├── server.py          FastAPI app: every /api endpoint lives here
│   ├── requirements.txt
│   └── .env               MONGO_URL, DB_NAME, STRIPE_API_KEY
│
├── memory/
│   └── PRD.md             product requirements + backlog
│
└── frontend/
    ├── tailwind.config.js Colors (maroon/gold/cream), fonts, animations
    ├── package.json
    └── src/
        ├── index.js       ReactDOM entry
        ├── index.css      Global styles, fonts, CSS variables
        ├── App.js         Router + <StoreProvider> + <Toaster>
        │
        ├── context/
        │   └── StoreContext.jsx   Cart + Wishlist (localStorage-persisted)
        │
        ├── lib/
        │   └── api.js             axios client + typed helpers per endpoint
        │
        ├── pages/                 Route-level components
        │   ├── Home.jsx                → /
        │   ├── ProductDetail.jsx       → /product/:id
        │   ├── Category.jsx            → /category/:slug
        │   ├── Checkout.jsx            → /checkout
        │   ├── PaymentSuccess.jsx      → /payment/success
        │   ├── PaymentCancel.jsx       → /payment/cancel
        │   └── OrderConfirmation.jsx   → /order/:id
        │
        └── components/site/       Reusable pieces
            ├── SiteChrome.jsx         Layout wrapper for all routes
            ├── AnnouncementBar.jsx    Maroon top strip
            ├── Header.jsx             Logo, search, cart/wishlist icons, nav
            ├── Footer.jsx             Bottom footer
            ├── Hero.jsx               Homepage hero carousel
            ├── Categories.jsx         Category tiles
            ├── ServiceStrip.jsx       Service icons row
            ├── NewArrivalsAndAside.jsx  New Arrivals + side widgets
            ├── BestSellersAndFeed.jsx   Best Sellers + Insta + reviews + newsletter
            ├── TrustStrip.jsx         Bottom trust badges
            ├── ProductCard.jsx        Reusable product card
            ├── CartSheet.jsx          Slide-out cart drawer
            ├── WishlistSheet.jsx      Slide-out wishlist drawer
            └── ShoppableLookModal.jsx Instagram "Shop the Look" modal
```

---

## 3. Route map & how pages link

```
                          ┌───────────────────────────┐
                          │          App.js           │
                          │  Router + StoreProvider   │
                          └────────────┬──────────────┘
                                       │  all routes wrapped in
                                       ▼
                          ┌───────────────────────────┐
                          │      SiteChrome.jsx       │
                          │  AnnouncementBar + Header │
                          │  + <Outlet/> + Footer     │
                          │  + CartSheet + Wishlist   │
                          └────────────┬──────────────┘
                                       │
 ┌──────────────┬──────────────┬───────┴───────┬──────────────┬──────────────┐
 ▼              ▼              ▼               ▼              ▼              ▼
Home        ProductDetail  Category        Checkout      PaymentSuccess  OrderConfirm
(/)         (/product/:id) (/category/:slug) (/checkout) (/payment/success) (/order/:id)
                                                          + PaymentCancel
                                                          (/payment/cancel)
```

---

## 4. Typical user journey

```
Home
  │
  ├── (Header nav "SAREES") ────────→ Category (/category/sarees)
  │
  ├── (Category tile "Kurtis") ─────→ Category (/category/kurtis)
  │        │
  │        └── ProductCard click ──→ ProductDetail (/product/:id)
  │                                      │
  │                                      ├── ADD TO BAG → CartSheet opens
  │                                      └── BUY IT NOW → Checkout
  │
  ├── (Product card ADD TO BAG) ──→ StoreContext.addToCart
  │                                      │
  │                                      ▼
  │                                 CartSheet (drawer)
  │                                      │
  │                                      └── PROCEED TO CHECKOUT → Checkout
  │
  └── (Instagram tile) ─────────→ ShoppableLookModal
                                       │
                                       └── shoppable-add → StoreContext.addToCart

Checkout
  │
  ├── COD → POST /api/checkout ─→ OrderConfirmation (/order/:id)
  │                                   (cart is cleared)
  │
  └── Stripe → POST /api/checkout ─→ redirect to Stripe hosted page
                                         │
                     ┌───────────────────┴──────────────────┐
                     ▼                                      ▼
             /payment/success                       /payment/cancel
             (polls status)                         (retry / keep shopping)
                     │
                     └─→ OrderConfirmation
```

---

## 5. Data flow (frontend ↔ backend)

```
Any React page/component
      │
      │ imports from
      ▼
frontend/src/lib/api.js    axios instance using REACT_APP_BACKEND_URL
      │
      │ HTTPS
      ▼
backend/server.py    FastAPI — all routes prefixed with /api
      │
      ├── In-memory catalog
      │     NEW_ARRIVALS, BEST_SELLERS, CATEGORIES,
      │     REVIEWS, HERO_SLIDES, INSTAGRAM_LOOKS
      │
      ├── MongoDB (motor)
      │     db.newsletter  email subscriptions (upsert by email)
      │     db.orders      COD + Stripe orders with status tracking
      │
      └── Stripe (via emergentintegrations, Flow B / BYOK)
            POST /api/checkout          creates Stripe Session
            GET  /api/payments/status   syncs paid status server-side
            POST /api/webhook/stripe    async payment updates
```

### API endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/` | Health check |
| GET | `/api/products` (`?section=` `?category=`) | Product list with filters |
| GET | `/api/products/{id}` | Single product (with sizes, description) |
| GET | `/api/categories` | All categories with slugs |
| GET | `/api/categories/{slug}` | Category + its products |
| GET | `/api/hero-slides` | Homepage carousel slides |
| GET | `/api/reviews` | Customer reviews |
| GET | `/api/instagram-feed` | Instagram tiles |
| GET | `/api/instagram-feed/{look_id}` | A shoppable look + its products |
| POST | `/api/newsletter` | Email signup (upsert, idempotent) |
| POST | `/api/checkout` | Create COD or Stripe order |
| GET | `/api/payments/status/{session_id}` | Poll Stripe payment state |
| POST | `/api/webhook/stripe` | Stripe async webhook |
| GET | `/api/orders/{order_id}` | Order confirmation data |

---

## 6. Global state

`frontend/src/context/StoreContext.jsx` holds the client-side cart & wishlist.

```
StoreContext (React Context + localStorage)
  │
  ├── cart      persisted to  zk_cart      (dedup by id + size)
  ├── wishlist  persisted to  zk_wishlist
  ├── cartOpen / wishlistOpen (drawer visibility)
  │
  └── Consumed by:
        Header (badge counts), ProductCard, CartSheet,
        WishlistSheet, ProductDetail, Checkout, PaymentSuccess
```

Because it uses localStorage, the cart survives Stripe redirects and browser refreshes.

---

## 7. Where to make common changes

### Product photos — three ways to source images

| Source | How to use it | Best for |
|---|---|---|
| **External URL** | Set `image="https://images.unsplash.com/..."` | Stock photos, testing |
| **Public folder** | Drop files into `/app/frontend/public/images/products/` and set `image="/images/products/your-file.jpg"` | Your own curated photo set shipped with the site |
| **Admin — single** | Sign into `/admin`, use the left-side "Add product" form to upload one photo and fill in one form | Adding products one at a time |
| **Admin — bulk** | Sign into `/admin` → BULK UPLOAD tab, drag up to 10 photos at once, fill in each draft card, click SAVE ALL | Fast catalog bootstrapping |
| **Admin — edit** | Click any DB product card on the MY PRODUCTS tab to open the edit modal (name, price, category, section, tag, description, image) | Fixing typos, price changes, photo swaps |

The `image` field on a product is just a string — the frontend's `imageUrl()` helper (`src/lib/img.js`) auto-prefixes `/api/...` URLs with the backend URL, and public-folder paths (`/images/...`) work as-is via React's static asset serving.

### Editable configuration

| I want to change… | Edit this file |
|---|---|
| Section order or add/remove a section on the homepage | `src/pages/Home.jsx` |
| The maroon strip at the very top | `src/components/site/AnnouncementBar.jsx` |
| Hero slides (title, subtitle, image) | `backend/server.py` → `HERO_SLIDES` |
| Category tiles | `backend/server.py` → `CATEGORIES` |
| Seeded New Arrivals / Best Sellers | `backend/server.py` → `NEW_ARRIVALS` / `BEST_SELLERS` |
| Add new products at runtime | Sign in at `/admin` and use the upload form |
| Instagram looks + products in each look | `backend/server.py` → `INSTAGRAM_LOOKS` |
| Customer reviews | `backend/server.py` → `REVIEWS` |
| Site colors, fonts, spacing tokens | `frontend/tailwind.config.js` + `src/index.css` |
| Header nav links | `src/components/site/Header.jsx` → `navLinks` |
| Footer columns / social / payment badges | `src/components/site/Footer.jsx` |
| Shipping cost / free-shipping threshold | `backend/server.py` → `SHIPPING_FLAT_RATE_INR`, `FREE_SHIPPING_THRESHOLD_INR` |
| Admin password | `backend/.env` → `ADMIN_TOKEN` (restart backend after change) |

---

## 8. Environment & running

- **Backend** runs on `0.0.0.0:8001` (supervisor-managed, hot-reload).
- **Frontend** runs on `0.0.0.0:3000` (supervisor-managed, hot-reload).
- Frontend calls the backend via `process.env.REACT_APP_BACKEND_URL` — never hard-coded.
- MongoDB is available at `MONGO_URL` and `DB_NAME` from `backend/.env`.
- Stripe uses `STRIPE_API_KEY` (`sk_test_emergent` — Emergent's shared sandbox because India isn't supported for claimable sandboxes yet).
- Object storage uses `EMERGENT_LLM_KEY` (Emergent's shared storage endpoint).
- Admin panel uses a bearer token from `ADMIN_TOKEN` (change this to your own secret before going public).

All requests from the browser must hit paths starting with `/api` so the Kubernetes ingress routes them to the backend.

---

## 9. Related docs

- **[GETTING_STARTED.md](./GETTING_STARTED.md)** — how and where to run the whole flow (both on Emergent and locally on your machine)
- **[ADMIN_GUIDE.md](./ADMIN_GUIDE.md)** — step-by-step for uploading photos into each category (Sarees, Kurtis, Lehengas, …) via the `/admin` panel
