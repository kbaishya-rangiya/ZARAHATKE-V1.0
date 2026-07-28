# Admin Panel Guide — Uploading Photos by Category

A step-by-step guide for using the ZARAHATKE admin panel to upload product photos into each category (Sarees, Kurtis, Kurta Sets, Lehengas, Dupattas, Co-ord Sets, Wedding Collection, Dresses).

---

## 1. Sign into the admin panel

Open **`/admin`** on your live site.

Enter the token: **`zarahatke-admin-2026`**

> This is stored in `backend/.env` as `ADMIN_TOKEN`. Rotate this value (and restart the backend) before going public.

---

## 2. Two ways to add products (both let you pick a category)

### Path A — Add one at a time (left-side form)

Good when you have a single new product with all the details.

1. On the left panel, click the **"TAP TO UPLOAD"** area and pick a photo
2. Wait for the preview to appear
3. Fill in:
   - **Name** — e.g. "Rose Pink Kanjivaram Saree"
   - **Price (₹)** — e.g. `4999`
   - **Section** — *New Arrivals* or *Best Sellers*
   - **Category** — pick **Sarees / Kurtis / Kurta Sets / Lehengas / Dupattas / Co-ord Sets / Wedding Collection / Dresses**
   - **Tag** — *NEW*, *SALE*, or *None*
   - **Description** — optional
4. Click **CREATE PRODUCT** → toast confirms → the card appears in the **MY PRODUCTS** tab and on the site immediately.

### Path B — Bulk Upload (recommended for a whole category)

Fastest way to seed, say, all your Kurtis in one go.

1. Click the **BULK UPLOAD** tab
2. **Drag up to 10 photos** onto the "Drop photos here" zone (or click it to browse)
3. Each photo becomes a **draft card** with a small form under the image
4. For every draft, fill in:
   - **Product name**
   - **Price**
   - **Section** — change if needed (default: *New Arrivals*)
   - **Category** — change the dropdown to the right value (e.g. *Kurtis*)
5. Click **SAVE ALL (n)** in the top-right — every draft with a name + price gets created in one shot
6. Repeat: click **CLEAR**, drag a different set of photos in, and change the category to *Sarees*, *Lehengas*, etc.

> **Tip:** All drafts default to *New Arrivals* + *Kurtis*. If you're bulk-uploading only sarees, click each card's category dropdown and pick **Sarees**, then Save All.

---

## 3. Where the photos show up

Once saved, your uploads are visible in three places without any redeploy:

| Where | What you'll see |
|---|---|
| **Homepage → New Arrivals grid** | If section = *New Arrivals* — your product appears **first** (before seeded items) |
| **Homepage → Best Sellers row** | If section = *Best Sellers* |
| **Category page** e.g. `/category/sarees` | Every product tagged with that category, DB uploads first |

---

## 4. Editing a product later

- Go to **MY PRODUCTS** tab
- Hover any card → **"TAP TO EDIT"** overlay appears, or click the small **EDIT** button
- The modal opens with every field filled in
- Change anything (including replacing the photo via **REPLACE PHOTO**)
- Click **SAVE CHANGES**

Seeded products (the ones that shipped with the site) are read-only. To hide them, edit the seed lists in `backend/server.py` and restart the backend.

---

## 5. Recommended workflow for launching your catalog

1. **Prep photos in folders on your computer** — one folder per category (`Sarees/`, `Kurtis/`, `Lehengas/`, …)
2. Open `/admin` → BULK UPLOAD tab
3. Drag **all Sarees photos** in → set category to **Sarees** on each draft → SAVE ALL
4. Click **CLEAR**, then drag **all Kurtis** in → set category to **Kurtis** → SAVE ALL
5. Repeat for the remaining 6 categories

---

## 6. Photo tips

| Recommendation | Why |
|---|---|
| **Portrait 3:4 aspect** (e.g. 900 × 1200 px) | The card layout expects it; landscape gets cropped |
| **Under 500 KB per image** | Faster loads; the site limit is 8 MB |
| **JPG or WEBP** for photos, PNG only for transparent cutouts | Smaller files |
| **Consistent lighting/background** across a category | Makes the grid look premium |
| **Descriptive filenames** (`rose-pink-kanjivaram.jpg`) | The uploader ignores the filename, but it helps you before upload |

---

## 7. Deleting a product

- **MY PRODUCTS** tab → click **DEL** on any card you added
- Confirm the browser prompt
- Soft-deletes the product (it disappears from the site immediately)

Uploaded photo files stay in object storage even after delete — this keeps historical order confirmations working.

---

## 8. Troubleshooting

| Symptom | Fix |
|---|---|
| Login toast says "Invalid admin token" | Double-check the exact value in `backend/.env` → `ADMIN_TOKEN` and restart the backend if you changed it |
| Upload fails with "Unsupported file type" | Only JPG/JPEG/PNG/WEBP/GIF are accepted |
| Upload fails with "File too large (max 8 MB)" | Compress the image (try [squoosh.app](https://squoosh.app/)) |
| Draft's SAVE button stays disabled | The photo is still uploading — wait for the loader to disappear |
| Product created but not visible on the homepage | Check the *section* dropdown — only *New Arrivals* items show in the New Arrivals grid; visit `/category/{slug}` to see all items in a category |
| Edit modal doesn't open | You clicked a **SEEDED** card (read-only). Switch to the **MY PRODUCTS** tab |
