"""Iteration 2 backend tests: PDP fields, category listing, instagram looks, checkout/orders/payments."""
import os

import pytest
import requests
from dotenv import dotenv_values

frontend_env = dotenv_values("/app/frontend/.env")
base_url = os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL")
if not base_url:
    raise RuntimeError("REACT_APP_BACKEND_URL missing")
BASE_URL = base_url.rstrip("/")

ADDRESS = {
    "full_name": "TEST_QA User",
    "email": "qa_test@example.com",
    "phone": "9876543210",
    "line1": "12 Test Lane",
    "line2": "",
    "city": "Mumbai",
    "state": "Maharashtra",
    "postal_code": "400001",
    "country": "India",
}


@pytest.fixture(scope="session")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---- Product model extension ----
class TestProductDetail:
    def test_product_na1_extended_fields(self, api):
        r = api.get(f"{BASE_URL}/api/products/na1", timeout=30)
        assert r.status_code == 200
        p = r.json()
        assert p["id"] == "na1"
        assert p["sizes"] == ["XS", "S", "M", "L", "XL"]
        assert isinstance(p["description"], str) and len(p["description"]) > 40
        assert isinstance(p["rating"], (int, float)) and 0 < p["rating"] <= 5
        assert isinstance(p["reviews_count"], int) and p["reviews_count"] > 0

    def test_product_unknown_404(self, api):
        r = api.get(f"{BASE_URL}/api/products/nope", timeout=30)
        assert r.status_code == 404

    def test_filter_by_category(self, api):
        r = api.get(f"{BASE_URL}/api/products", params={"category": "Sarees"}, timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert len(data) > 0
        assert all(p["category"] == "Sarees" for p in data)

    def test_filter_by_category_case_insensitive(self, api):
        a = api.get(f"{BASE_URL}/api/products", params={"category": "sarees"}, timeout=30).json()
        b = api.get(f"{BASE_URL}/api/products", params={"category": "SAREES"}, timeout=30).json()
        assert [p["id"] for p in a] == [p["id"] for p in b]


# ---- Categories ----
class TestCategories:
    EXPECTED_SLUGS = ["sarees", "kurtis", "kurta-sets", "lehengas", "dupattas",
                      "co-ord-sets", "wedding-collection", "dresses"]

    def test_categories_have_slug(self, api):
        r = api.get(f"{BASE_URL}/api/categories", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert [c["slug"] for c in data] == self.EXPECTED_SLUGS
        for c in data:
            assert c["name"] and c["image"].startswith("http")

    def test_category_detail_kurtis(self, api):
        r = api.get(f"{BASE_URL}/api/categories/kurtis", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert data["category"]["name"] == "Kurtis"
        assert data["category"]["slug"] == "kurtis"
        assert len(data["products"]) > 0
        assert all(p["category"] == "Kurtis" for p in data["products"])

    @pytest.mark.parametrize("slug", EXPECTED_SLUGS)
    def test_all_slugs_resolve(self, api, slug):
        r = api.get(f"{BASE_URL}/api/categories/{slug}", timeout=30)
        assert r.status_code == 200
        assert r.json()["category"]["slug"] == slug

    def test_unknown_category_404(self, api):
        r = api.get(f"{BASE_URL}/api/categories/does-not-exist", timeout=30)
        assert r.status_code == 404


# ---- Shoppable Instagram ----
class TestInstagram:
    def test_feed(self, api):
        r = api.get(f"{BASE_URL}/api/instagram-feed", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 6
        for look in data:
            assert set(look.keys()) == {"id", "image", "caption"}

    def test_look_detail(self, api):
        r = api.get(f"{BASE_URL}/api/instagram-feed/ig1", timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert data["look"]["id"] == "ig1"
        assert len(data["products"]) == 3
        for p in data["products"]:
            assert p["id"] and p["name"] and isinstance(p["price"], int)
            assert p["sizes"]

    def test_look_unknown_404(self, api):
        r = api.get(f"{BASE_URL}/api/instagram-feed/ig99", timeout=30)
        assert r.status_code == 404


# ---- Checkout ----
class TestCheckout:
    def _payload(self, items, method="cod"):
        return {
            "items": items,
            "address": ADDRESS,
            "payment_method": method,
            "origin_url": BASE_URL,
        }

    def test_cod_order_created_and_persisted(self, api):
        payload = self._payload([{"product_id": "na1", "quantity": 2, "size": "M"}])
        r = api.post(f"{BASE_URL}/api/checkout", json=payload, timeout=60)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "order_id" in data
        assert data["redirect_url"].endswith(f"/order/{data['order_id']}")

        g = api.get(f"{BASE_URL}/api/orders/{data['order_id']}", timeout=30)
        assert g.status_code == 200
        order = g.json()
        assert "_id" not in order
        assert order["payment_status"] == "cod_pending"
        assert order["status"] == "confirmed"
        assert order["payment_method"] == "cod"
        assert order["subtotal"] == 2499 * 2
        assert order["shipping"] == 0
        assert order["total"] == 4998
        assert order["items"][0]["product_id"] == "na1"
        assert order["items"][0]["size"] == "M"
        assert order["address"]["city"] == "Mumbai"

    def test_shipping_charged_below_threshold(self, api):
        # na8 = 1199 (< 1999) -> shipping 149
        payload = self._payload([{"product_id": "na8", "quantity": 1, "size": "S"}])
        r = api.post(f"{BASE_URL}/api/checkout", json=payload, timeout=60)
        assert r.status_code == 200, r.text
        order = api.get(f"{BASE_URL}/api/orders/{r.json()['order_id']}", timeout=30).json()
        assert order["subtotal"] == 1199
        assert order["shipping"] == 149
        assert order["total"] == 1348

    def test_free_shipping_at_threshold(self, api):
        # na2 = 1299 x 2 = 2598 >= 1999 -> shipping 0
        payload = self._payload([{"product_id": "na2", "quantity": 2}])
        r = api.post(f"{BASE_URL}/api/checkout", json=payload, timeout=60)
        assert r.status_code == 200, r.text
        order = api.get(f"{BASE_URL}/api/orders/{r.json()['order_id']}", timeout=30).json()
        assert order["subtotal"] == 2598
        assert order["shipping"] == 0
        assert order["total"] == 2598

    def test_empty_items_400(self, api):
        r = api.post(f"{BASE_URL}/api/checkout", json=self._payload([]), timeout=30)
        assert r.status_code == 400

    def test_unknown_product_400(self, api):
        r = api.post(f"{BASE_URL}/api/checkout",
                     json=self._payload([{"product_id": "zzz", "quantity": 1}]), timeout=30)
        assert r.status_code == 400

    def test_invalid_payment_method_422(self, api):
        r = api.post(f"{BASE_URL}/api/checkout",
                     json=self._payload([{"product_id": "na1", "quantity": 1}], method="bitcoin"),
                     timeout=30)
        assert r.status_code == 422

    def test_stripe_session_created(self, api):
        payload = self._payload([{"product_id": "bs1", "quantity": 1, "size": "L"}], method="stripe")
        r = api.post(f"{BASE_URL}/api/checkout", json=payload, timeout=90)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["session_id"]
        assert data["checkout_url"].startswith("https://checkout.stripe.com")

        order = api.get(f"{BASE_URL}/api/orders/{data['order_id']}", timeout=30).json()
        assert order["payment_status"] == "pending"
        assert order["status"] == "initiated"
        assert order["session_id"] == data["session_id"]
        assert order["total"] == 4199

        # payment status endpoint
        s = api.get(f"{BASE_URL}/api/payments/status/{data['session_id']}", timeout=60)
        assert s.status_code == 200, s.text
        sd = s.json()
        assert sd["session_id"] == data["session_id"]
        assert sd["order_id"] == data["order_id"]
        assert sd["payment_status"] in ("pending", "paid", "unpaid", "expired")
        assert sd["status"] in ("initiated", "confirmed")

    def test_payment_status_unknown_404(self, api):
        r = api.get(f"{BASE_URL}/api/payments/status/cs_test_unknown_xyz", timeout=30)
        assert r.status_code == 404

    def test_order_unknown_404(self, api):
        r = api.get(f"{BASE_URL}/api/orders/not-a-real-order", timeout=30)
        assert r.status_code == 404


class TestWebhook:
    def test_invalid_signature_400(self, api):
        r = requests.post(f"{BASE_URL}/api/webhook/stripe",
                          data=b'{"type":"checkout.session.completed"}',
                          headers={"Stripe-Signature": "t=1,v1=bogus",
                                   "Content-Type": "application/json"},
                          timeout=30)
        assert r.status_code == 400


# ---- Regression on prior endpoints ----
class TestRegression:
    def test_root(self, api):
        r = api.get(f"{BASE_URL}/api/", timeout=30)
        assert r.status_code == 200 and r.json()["status"] == "ok"

    def test_products(self, api):
        r = api.get(f"{BASE_URL}/api/products", timeout=30)
        assert r.status_code == 200 and len(r.json()) == 14

    def test_reviews(self, api):
        r = api.get(f"{BASE_URL}/api/reviews", timeout=30)
        assert r.status_code == 200 and len(r.json()) == 3

    def test_hero_slides(self, api):
        r = api.get(f"{BASE_URL}/api/hero-slides", timeout=30)
        assert r.status_code == 200 and len(r.json()) == 3

    def test_newsletter(self, api):
        r = api.post(f"{BASE_URL}/api/newsletter", json={"email": "TEST_qa2@example.com"}, timeout=30)
        assert r.status_code == 200
        assert r.json()["email"] == "TEST_qa2@example.com"

    def test_newsletter_invalid_email(self, api):
        r = api.post(f"{BASE_URL}/api/newsletter", json={"email": "bad"}, timeout=30)
        assert r.status_code == 422
