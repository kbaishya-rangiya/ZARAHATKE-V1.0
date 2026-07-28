import os
import uuid

import pytest
import requests
from dotenv import dotenv_values

frontend_env = dotenv_values("/app/frontend/.env")
base_url = os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL")
if not base_url:
    raise RuntimeError("REACT_APP_BACKEND_URL missing")
BASE_URL = base_url.rstrip("/")


@pytest.fixture(scope="session")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---- root ----
class TestRoot:
    def test_root(self, api):
        r = api.get(f"{BASE_URL}/api/", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert data == {"message": "ZARAHATKE API", "status": "ok"}


# ---- products ----
class TestProducts:
    def test_all_products(self, api):
        r = api.get(f"{BASE_URL}/api/products", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 14
        assert sum(1 for p in data if p["section"] == "new_arrivals") == 8
        assert sum(1 for p in data if p["section"] == "best_sellers") == 6
        for p in data:
            assert isinstance(p["id"], str) and p["id"]
            assert isinstance(p["price"], int)
            assert p["image"].startswith("http")
            assert "_id" not in p

    def test_new_arrivals(self, api):
        r = api.get(f"{BASE_URL}/api/products", params={"section": "new_arrivals"}, timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 8
        assert all(p["section"] == "new_arrivals" for p in data)

    def test_best_sellers(self, api):
        r = api.get(f"{BASE_URL}/api/products", params={"section": "best_sellers"}, timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 6
        assert all(p["section"] == "best_sellers" for p in data)

    def test_unknown_section_empty(self, api):
        r = api.get(f"{BASE_URL}/api/products", params={"section": "bogus"}, timeout=30)
        assert r.status_code == 200
        assert r.json() == []

    def test_get_product_by_id(self, api):
        r = api.get(f"{BASE_URL}/api/products/na1", timeout=30)
        assert r.status_code == 200
        p = r.json()
        assert p["id"] == "na1"
        assert p["name"] == "Rose Pink Embroidered Anarkali Kurta Set"
        assert p["price"] == 2499
        assert p["category"] == "Kurta Sets"
        assert p["section"] == "new_arrivals"

    def test_sale_product_has_original_price(self, api):
        r = api.get(f"{BASE_URL}/api/products/bs5", timeout=30)
        assert r.status_code == 200
        p = r.json()
        assert p["tag"] == "SALE"
        assert p["original_price"] == 11999
        assert p["price"] < p["original_price"]

    def test_unknown_product_404(self, api):
        r = api.get(f"{BASE_URL}/api/products/unknown", timeout=30)
        assert r.status_code == 404
        assert r.json().get("detail") == "Product not found"


# ---- categories / reviews / hero / instagram ----
class TestStaticContent:
    def test_categories(self, api):
        r = api.get(f"{BASE_URL}/api/categories", timeout=30)
        assert r.status_code == 200
        data = r.json()
        names = [c["name"] for c in data]
        assert len(data) == 8
        for expected in ["Sarees", "Kurtis", "Kurta Sets", "Lehengas", "Dupattas",
                         "Co-ord Sets", "Wedding Collection", "Dresses"]:
            assert expected in names
        assert all(c["image"].startswith("http") for c in data)

    def test_reviews(self, api):
        r = api.get(f"{BASE_URL}/api/reviews", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 3
        assert all(rv["rating"] == 5 for rv in data)
        assert all(rv["name"] and rv["location"] and rv["text"] for rv in data)

    def test_hero_slides(self, api):
        r = api.get(f"{BASE_URL}/api/hero-slides", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 3
        assert data[0]["title"] == "FESTIVE COLLECTION"
        assert data[0]["year"] == "2026"
        assert all({"id", "title", "subtitle", "image", "cta"} <= set(s.keys()) for s in data)

    def test_instagram_feed(self, api):
        r = api.get(f"{BASE_URL}/api/instagram-feed", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 6
        assert all(item["id"] and item["image"].startswith("http") for item in data)


# ---- newsletter ----
class TestNewsletter:
    def test_subscribe_valid(self, api):
        email = f"TEST_{uuid.uuid4().hex[:8]}@example.com"
        r = api.post(f"{BASE_URL}/api/newsletter", json={"email": email}, timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert data["email"] == email
        assert isinstance(data["id"], str) and len(data["id"]) > 0
        assert "created_at" in data
        assert "_id" not in data

    def test_subscribe_invalid(self, api):
        r = api.post(f"{BASE_URL}/api/newsletter", json={"email": "not-an-email"}, timeout=30)
        assert r.status_code == 422

    def test_subscribe_missing_field(self, api):
        r = api.post(f"{BASE_URL}/api/newsletter", json={}, timeout=30)
        assert r.status_code == 422

    def test_subscribe_idempotent(self, api):
        email = f"TEST_dup_{uuid.uuid4().hex[:8]}@example.com"
        r1 = api.post(f"{BASE_URL}/api/newsletter", json={"email": email}, timeout=30)
        r2 = api.post(f"{BASE_URL}/api/newsletter", json={"email": email}, timeout=30)
        assert r1.status_code == 200 and r2.status_code == 200

        import asyncio
        from motor.motor_asyncio import AsyncIOMotorClient
        from dotenv import dotenv_values as dv
        be = dv("/app/backend/.env")
        mongo_url = os.environ.get("MONGO_URL") or be.get("MONGO_URL")
        db_name = os.environ.get("DB_NAME") or be.get("DB_NAME")

        async def count():
            c = AsyncIOMotorClient(mongo_url)
            try:
                return await c[db_name].newsletter.count_documents({"email": email})
            finally:
                c.close()

        assert asyncio.get_event_loop().run_until_complete(count()) == 1 if False else asyncio.run(count()) == 1


@pytest.fixture(scope="session", autouse=True)
def cleanup():
    yield
    import asyncio
    from motor.motor_asyncio import AsyncIOMotorClient
    from dotenv import dotenv_values as dv
    be = dv("/app/backend/.env")
    mongo_url = os.environ.get("MONGO_URL") or be.get("MONGO_URL")
    db_name = os.environ.get("DB_NAME") or be.get("DB_NAME")

    async def purge():
        c = AsyncIOMotorClient(mongo_url)
        try:
            await c[db_name].newsletter.delete_many({"email": {"$regex": "^TEST_"}})
        finally:
            c.close()

    asyncio.run(purge())
