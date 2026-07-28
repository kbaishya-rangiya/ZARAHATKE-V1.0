# Getting Started — Running ZARAHATKE

Where and how to run the whole flow to see your website.

---

## Option 1 — Running on Emergent (right now, zero setup)

Your app is **already running** on the Emergent preview URL. No install needed.

**Live URL:** `https://code-generator-392.preview.emergentagent.com`

| Page | URL |
|---|---|
| Homepage | `/` |
| Category listing (e.g. Kurtis) | `/category/kurtis` |
| Product detail | `/product/na1` (or any product id) |
| Checkout | `/checkout` (after adding items to bag) |
| Admin panel | `/admin` |

Everything is wired: FastAPI backend, React frontend, MongoDB, Stripe (test key), Emergent object storage. You can start uploading photos in `/admin` right away.

To **export the code** to GitHub or another environment, use the Emergent "Save to GitHub" button (requires a paid plan). See `/app/docs/ARCHITECTURE.md` for the full code map.

---

## Option 2 — Running locally on your own machine

Once you've cloned the repo, here's how to bring the whole flow up.

### Prerequisites

| Tool | Version | Install |
|---|---|---|
| Python | 3.11 or newer | https://www.python.org/downloads/ |
| Node.js | 20 or newer | https://nodejs.org/ |
| Yarn | 1.22+ | `npm install --global yarn` |
| MongoDB | 6.0+ (Community Edition is fine) | https://www.mongodb.com/try/download/community |

Verify:

```bash
python3 --version    # -> Python 3.11.x
node --version       # -> v20.x
yarn --version       # -> 1.22.x
mongod --version     # -> db version v6.x or higher
```

### Step 1 — Start MongoDB

Open a terminal and start MongoDB (leave it running):

```bash
# macOS (via Homebrew)
brew services start mongodb-community

# Linux (systemd)
sudo systemctl start mongod

# Or run it directly in a terminal
mongod --dbpath /path/to/your/data/folder
```

MongoDB needs to be reachable at the default `mongodb://localhost:27017`.

### Step 2 — Start the backend

In a **second terminal**:

```bash
cd /path/to/zarahatke/backend

# One-time: install Python dependencies
python3 -m venv .venv
source .venv/bin/activate         # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Run the server
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

You should see:

```
INFO:     Uvicorn running on http://0.0.0.0:8001
INFO:     Application startup complete.
```

Sanity check:

```bash
curl http://localhost:8001/api/
# -> {"message":"ZARAHATKE API","status":"ok"}
```

### Step 3 — Configure the frontend to talk to your local backend

Edit `frontend/.env` and set:

```
REACT_APP_BACKEND_URL=http://localhost:8001
```

(On Emergent this points at the preview URL — change it to `http://localhost:8001` when running locally.)

### Step 4 — Start the frontend

In a **third terminal**:

```bash
cd /path/to/zarahatke/frontend

# One-time: install Node dependencies (use yarn, not npm)
yarn install

# Run the dev server
yarn start
```

You should see:

```
Compiled successfully!
You can now view the app in the browser.
  Local:  http://localhost:3000
```

### Step 5 — Open the site

Visit **`http://localhost:3000`** in your browser. That's it — the full flow is running:

- Homepage renders with categories, products, hero carousel
- Cart / wishlist work
- `/admin` uses token `zarahatke-admin-2026` (from `backend/.env`)
- Stripe uses the test key `sk_test_emergent`

Any code change hot-reloads automatically (both React and FastAPI).

---

## Environment variables reference

All values live in **`backend/.env`** — never hard-code these in source.

| Variable | Purpose | Default (local) |
|---|---|---|
| `MONGO_URL` | MongoDB connection string | `mongodb://localhost:27017` |
| `DB_NAME` | Database name | `test_database` |
| `CORS_ORIGINS` | Allowed CORS origins (comma-separated, or `*`) | `*` |
| `STRIPE_API_KEY` | Stripe secret key (test or live) | `sk_test_emergent` |
| `EMERGENT_LLM_KEY` | Key for object storage (photo uploads) | Emergent-issued |
| `ADMIN_TOKEN` | Bearer token gating the `/admin` panel | `zarahatke-admin-2026` |

And **`frontend/.env`**:

| Variable | Purpose |
|---|---|
| `REACT_APP_BACKEND_URL` | Where the frontend calls the backend (e.g. `http://localhost:8001` locally, the preview URL on Emergent) |

After changing any `.env` value **restart the affected service**.

---

## Common issues when running locally

| Problem | Fix |
|---|---|
| `MongoNotConnectedError` | MongoDB isn't running. `brew services start mongodb-community` or launch `mongod` |
| `port 8001 already in use` | Kill the process: `lsof -ti :8001 \| xargs kill -9` |
| CORS error in browser console | `CORS_ORIGINS=http://localhost:3000` in `backend/.env` and restart backend |
| Admin page 401s | `ADMIN_TOKEN` mismatch — check `backend/.env` value equals what you type in the login field |
| Object storage upload fails | `EMERGENT_LLM_KEY` missing/invalid — only works on Emergent's infra or with a valid key |
| Stripe checkout redirects to a broken URL | Local runs need a real domain for Stripe's return URLs; use ngrok (`ngrok http 3000`) or test the COD path instead |

---

## Deploying to production

When you're ready to go live:

1. **Push to GitHub** (Emergent "Save to GitHub" button, or `git push` if you own the repo)
2. Deploy the backend to Emergent (or Railway / Fly.io / Render) — it just needs Python, MongoDB and the env variables above
3. Deploy the frontend to Emergent (or Vercel / Netlify / Cloudflare Pages) — set `REACT_APP_BACKEND_URL` to your production backend URL
4. Point a real domain at the frontend
5. Swap `STRIPE_API_KEY` for a live key and `ADMIN_TOKEN` for a strong secret
6. Update `CORS_ORIGINS` to your production domain(s) only

Ask the assistant about **deployment** to get platform-specific step-by-step instructions.

---

## Related docs

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** — code map, page flow, data flow, "where to change X" table
- **[ADMIN_GUIDE.md](./ADMIN_GUIDE.md)** — how to upload photos into each category from the admin panel
