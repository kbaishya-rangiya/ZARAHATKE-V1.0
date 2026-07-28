# Product photos — public folder

Drop image files (`.jpg`, `.png`, `.webp`) into this folder.

**How to use them in the catalog:**

Reference them by path in `/app/backend/server.py` (`NEW_ARRIVALS` / `BEST_SELLERS` lists):

```python
Product(
    id="na1",
    name="Rose Pink Embroidered Anarkali Kurta Set",
    price=2499,
    image="/images/products/rose-anarkali.jpg",   # <-- relative path
    category="Kurta Sets",
    section="new_arrivals",
),
```

The `image` field is a plain string — it accepts:
- **Absolute URL** — `https://images.unsplash.com/...` (current default)
- **Public-folder path** — `/images/products/your-file.jpg` (this folder)
- **Uploaded-image URL** — `${BACKEND}/api/files/…` (via the admin uploader)

React will serve these files directly from the `public/` folder, so no config change is needed.

**Recommended sizes:**
- Product cards: 800px wide, 3:4 aspect (portrait)
- Hero slides: 1600px wide, 16:9-ish

**Tips:**
- Keep filenames lowercase, hyphen-separated: `rose-pink-anarkali.jpg`
- Optimise to under ~300 KB per image (use https://squoosh.app/ or `cwebp`)
- To bulk-add: just copy files here, edit the product list, and hot-reload picks it up
