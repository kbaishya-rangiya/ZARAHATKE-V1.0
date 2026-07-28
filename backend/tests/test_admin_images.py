"""Admin auth, image upload/serve, and admin product CRUD tests (iteration 4)."""
import io
import os
import struct
import zlib

import pytest
import requests
from dotenv import dotenv_values

frontend_env = dotenv_values("/app/frontend/.env")
backend_env = dotenv_values("/app/backend/.env")
base_url = os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL")
if not base_url:
    raise RuntimeError("REACT_APP_BACKEND_URL missing")
BASE_URL = base_url.rstrip("/")
ADMIN_TOKEN = os.environ.get("ADMIN_TOKEN") or backend_env.get("ADMIN_TOKEN")


def _jpeg_bytes():
    # Minimal valid-ish JPEG (SOI + APP0 + EOI) — enough for upload byte roundtrip
    return (
        b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00"
        + b"\x00" * 64
        + b"\xff\xd9"
    )


@pytest.fixture(scope="session")
def client():
    s = requests.Session()
    return s


@pytest.fixture(scope="session")
def auth_headers():
    if not ADMIN_TOKEN:
        pytest.fail("ADMIN_TOKEN not found in backend/.env")
    return {"Authorization": f"Bearer {ADMIN_TOKEN}"}


@pytest.fixture(scope="session")
def created_product_ids():
    ids = []
    yield ids


@pytest.fixture(scope="session", autouse=True)
def cleanup(client, auth_headers, created_product_ids):
    yield
    for pid in created_product_ids:
        client.delete(f"{BASE_URL}/api/admin/products/{pid}", headers=auth_headers, timeout=30)


# ---------- admin auth ----------
class TestAdminAuth:
    def test_verify_no_header(self, client):
        r = client.post(f"{BASE_URL}/api/admin/verify", timeout=30)
        assert r.status_code == 401, r.text

    def test_verify_wrong_token(self, client):
        r = client.post(f"{BASE_URL}/api/admin/verify", headers={"Authorization": "Bearer nope"}, timeout=30)
        assert r.status_code == 403, r.text

    def test_verify_correct_token(self, client, auth_headers):
        r = client.post(f"{BASE_URL}/api/admin/verify", headers=auth_headers, timeout=30)
        assert r.status_code == 200, r.text
        assert r.json() == {"ok": True}


# ---------- upload + file serve ----------
class TestUploadAndFiles:
    def test_upload_requires_auth(self, client):
        r = client.post(
            f"{BASE_URL}/api/admin/upload",
            files={"file": ("TEST_x.jpg", _jpeg_bytes(), "image/jpeg")},
            timeout=60,
        )
        assert r.status_code == 401, r.text

    def test_upload_invalid_extension(self, client, auth_headers):
        r = client.post(
            f"{BASE_URL}/api/admin/upload",
            headers=auth_headers,
            files={"file": ("TEST_note.txt", b"hello", "text/plain")},
            timeout=60,
        )
        assert r.status_code == 400, r.text

    def test_upload_jpg_and_fetch(self, client, auth_headers, request):
        payload = _jpeg_bytes()
        r = client.post(
            f"{BASE_URL}/api/admin/upload",
            headers=auth_headers,
            files={"file": ("TEST_photo.jpg", payload, "image/jpeg")},
            timeout=120,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert set(["id", "url", "path", "size"]).issubset(data.keys())
        assert data["url"] == f"/api/files/{data['id']}"
        assert data["size"] == len(payload)
        request.session.uploaded_file_id = data["id"]

        g = client.get(f"{BASE_URL}{data['url']}", timeout=60)
        assert g.status_code == 200, g.text
        assert g.headers.get("Content-Type", "").startswith("image/jpeg")
        assert g.content == payload

    def test_get_unknown_file_404(self, client):
        r = client.get(f"{BASE_URL}/api/files/does-not-exist-123", timeout=30)
        assert r.status_code == 404, r.text


# ---------- admin product CRUD ----------
class TestAdminProductCrud:
    def test_create_update_ordering_delete(self, client, auth_headers, created_product_ids):
        # CREATE
        payload = {
            "name": "TEST_Admin Kurti",
            "price": 1111,
            "image": "/api/files/fake-id",
            "category": "Kurtis",
            "section": "new_arrivals",
            "tag": "NEW",
        }
        r = client.post(f"{BASE_URL}/api/admin/products", json=payload, headers=auth_headers, timeout=30)
        assert r.status_code == 200, r.text
        prod = r.json()
        pid = prod["id"]
        created_product_ids.append(pid)
        assert len(pid) == 36
        assert prod["name"] == payload["name"]
        assert prod["price"] == 1111
        assert prod["sizes"] == ["XS", "S", "M", "L", "XL"]

        # create without auth
        assert client.post(f"{BASE_URL}/api/admin/products", json=payload, timeout=30).status_code == 401

        # GET by id
        g = client.get(f"{BASE_URL}/api/products/{pid}", timeout=30)
        assert g.status_code == 200
        assert g.json()["name"] == payload["name"]

        # ordering: DB product first in new_arrivals
        lp = client.get(f"{BASE_URL}/api/products", params={"section": "new_arrivals"}, timeout=30)
        assert lp.status_code == 200
        ids = [p["id"] for p in lp.json()]
        assert pid in ids
        assert ids.index(pid) < ids.index("na1")

        # category page ordering
        cp = client.get(f"{BASE_URL}/api/categories/kurtis", timeout=30)
        assert cp.status_code == 200
        cids = [p["id"] for p in cp.json()["products"]]
        assert cids and cids[0] == pid or cids.index(pid) < cids.index("na2")

        # admin list shows source db
        al = client.get(f"{BASE_URL}/api/admin/products", headers=auth_headers, timeout=30)
        assert al.status_code == 200
        assert any(p["id"] == pid and p["source"] == "db" for p in al.json()["products"])

        # PATCH price
        u = client.patch(f"{BASE_URL}/api/admin/products/{pid}", json={"price": 2222}, headers=auth_headers, timeout=30)
        assert u.status_code == 200, u.text
        assert u.json()["price"] == 2222
        assert client.get(f"{BASE_URL}/api/products/{pid}", timeout=30).json()["price"] == 2222

        # PATCH seeded product -> 404
        s = client.patch(f"{BASE_URL}/api/admin/products/na1", json={"price": 5}, headers=auth_headers, timeout=30)
        assert s.status_code == 404, s.text

        # checkout with DB product
        co = client.post(
            f"{BASE_URL}/api/checkout",
            json={
                "items": [{"product_id": pid, "quantity": 2, "size": "M"}],
                "address": {
                    "full_name": "TEST User", "email": "test_admin@example.com", "phone": "9999999999",
                    "line1": "1 Test St", "city": "Mumbai", "state": "MH", "postal_code": "400001",
                },
                "payment_method": "cod",
                "origin_url": BASE_URL,
            },
            timeout=60,
        )
        assert co.status_code == 200, co.text
        order_id = co.json()["order_id"]
        o = client.get(f"{BASE_URL}/api/orders/{order_id}", timeout=30)
        assert o.status_code == 200
        od = o.json()
        assert od["subtotal"] == 4444
        assert od["shipping"] == 0
        assert od["total"] == 4444
        assert od["items"][0]["product_id"] == pid
        assert "_id" not in od

        # DELETE (soft)
        d = client.delete(f"{BASE_URL}/api/admin/products/{pid}", headers=auth_headers, timeout=30)
        assert d.status_code == 200, d.text
        assert d.json()["deleted"] is True
        created_product_ids.remove(pid)

        al2 = client.get(f"{BASE_URL}/api/admin/products", headers=auth_headers, timeout=30)
        assert not any(p["id"] == pid and p["source"] == "db" for p in al2.json()["products"])
        assert pid not in [p["id"] for p in client.get(f"{BASE_URL}/api/products", timeout=30).json()]
        assert client.get(f"{BASE_URL}/api/products/{pid}", timeout=30).status_code == 404

    def test_delete_seeded_returns_404(self, client, auth_headers):
        r = client.delete(f"{BASE_URL}/api/admin/products/na1", headers=auth_headers, timeout=30)
        assert r.status_code == 404, r.text

    def test_patch_deleted_product_should_404(self, client, auth_headers):
        payload = {"name": "TEST_Soft Deleted", "price": 500, "image": "/api/files/x", "category": "Kurtis"}
        pid = client.post(f"{BASE_URL}/api/admin/products", json=payload, headers=auth_headers, timeout=30).json()["id"]
        client.delete(f"{BASE_URL}/api/admin/products/{pid}", headers=auth_headers, timeout=30)
        r = client.patch(f"{BASE_URL}/api/admin/products/{pid}", json={"price": 900}, headers=auth_headers, timeout=30)
        assert r.status_code == 404, f"PATCH on soft-deleted product returned {r.status_code} (resurrect risk)"


# ---------- regression ----------
class TestRegression:
    @pytest.mark.parametrize("path,expected", [
        ("/api/", 200), ("/api/products", 200), ("/api/categories", 200),
        ("/api/categories/kurtis", 200), ("/api/instagram-feed", 200),
        ("/api/reviews", 200), ("/api/hero-slides", 200),
        ("/api/categories/nope-xyz", 404), ("/api/products/nope-xyz", 404),
    ])
    def test_endpoints(self, client, path, expected):
        r = client.get(f"{BASE_URL}{path}", timeout=30)
        assert r.status_code == expected, r.text

    def test_newsletter(self, client):
        r = client.post(f"{BASE_URL}/api/newsletter", json={"email": "test_qa_iter4@example.com"}, timeout=30)
        assert r.status_code == 200, r.text
        assert r.json()["email"] == "test_qa_iter4@example.com"

    def test_checkout_empty_cart(self, client):
        r = client.post(f"{BASE_URL}/api/checkout", json={
            "items": [],
            "address": {"full_name": "T", "email": "a@b.com", "phone": "1", "line1": "x",
                        "city": "c", "state": "s", "postal_code": "1"},
            "payment_method": "cod", "origin_url": BASE_URL}, timeout=30)
        assert r.status_code == 400, r.text
