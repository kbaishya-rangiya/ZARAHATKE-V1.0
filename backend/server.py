from fastapi import FastAPI, APIRouter, HTTPException, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone

from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout,
    CheckoutSessionRequest,
)


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="ZARAHATKE API")
api_router = APIRouter(prefix="/api")


# ---------- MODELS ----------
class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    price: int
    original_price: Optional[int] = None
    image: str
    category: str
    tag: Optional[str] = None
    section: str
    sizes: List[str] = Field(default_factory=lambda: ["XS", "S", "M", "L", "XL"])
    description: str = (
        "Handcrafted in India, this piece features intricate detailing on a "
        "premium fabric that drapes beautifully. Comfortable, breathable and "
        "made to last. Perfect for festive gatherings and special moments."
    )
    rating: float = 4.7
    reviews_count: int = 128


class NewsletterCreate(BaseModel):
    email: EmailStr


class NewsletterEntry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class Review(BaseModel):
    id: str
    name: str
    location: str
    rating: int
    text: str
    avatar: str


class CartItem(BaseModel):
    product_id: str
    quantity: int = Field(ge=1, le=20)
    size: Optional[str] = None


class ShippingAddress(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    line1: str
    line2: Optional[str] = ""
    city: str
    state: str
    postal_code: str
    country: str = "India"


class CheckoutInitRequest(BaseModel):
    items: List[CartItem]
    address: ShippingAddress
    payment_method: Literal["stripe", "cod"]
    origin_url: str


class OrderRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    items: List[dict]  # {product_id, name, price, image, quantity, size}
    subtotal: int
    shipping: int
    total: int
    address: dict
    payment_method: str
    payment_status: str  # "pending" | "paid" | "cod_pending"
    status: str  # "initiated" | "confirmed" | "cancelled"
    session_id: Optional[str] = None
    created_at: str


# ---------- SEED DATA ----------
NEW_ARRIVALS: List[Product] = [
    Product(id="na1", name="Rose Pink Embroidered Anarkali Kurta Set", price=2499, image="https://images.unsplash.com/photo-1710967074868-2041e4f44c17?w=800&q=80", category="Kurta Sets", tag="NEW", section="new_arrivals"),
    Product(id="na2", name="Mustard Yellow Printed Cotton Kurta", price=1299, image="https://images.unsplash.com/photo-1597983073750-16f5ded1321f?w=800&q=80", category="Kurtis", tag="NEW", section="new_arrivals"),
    Product(id="na3", name="Green Floral Printed A-Line Kurta", price=1499, image="https://images.unsplash.com/photo-1710967074923-2b3ebe6171c3?w=800&q=80", category="Kurtis", tag="NEW", section="new_arrivals"),
    Product(id="na4", name="Beige Chanderi Embroidered Kurta Set", price=2299, image="https://images.unsplash.com/photo-1632745994322-ac4f4bb36792?w=800&q=80", category="Kurta Sets", tag="NEW", section="new_arrivals"),
    Product(id="na5", name="Maroon Silk Blend Straight Kurta", price=1699, image="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80", category="Kurtis", tag="NEW", section="new_arrivals"),
    Product(id="na6", name="Off White Embroidered Kurta Set", price=2599, image="https://images.unsplash.com/photo-1678805408704-eb55b9d6e395?w=800&q=80", category="Kurta Sets", tag="NEW", section="new_arrivals"),
    Product(id="na7", name="Peach Georgette Embroidered Set", price=2799, image="https://images.unsplash.com/photo-1739429942851-9083ee185d3d?w=800&q=80", category="Kurta Sets", tag="NEW", section="new_arrivals"),
    Product(id="na8", name="Indigo Block Printed Cotton Kurta", price=1199, image="https://images.unsplash.com/photo-1600495495739-8e2a8f4ada40?w=800&q=80", category="Kurtis", tag="NEW", section="new_arrivals"),
]

BEST_SELLERS: List[Product] = [
    Product(id="bs1", name="Pink Banarasi Silk Saree", price=4199, image="https://images.unsplash.com/photo-1710967074868-2041e4f44c17?w=800&q=80", category="Sarees", section="best_sellers"),
    Product(id="bs2", name="Teal Blue Embroidered Anarkali Kurta Set", price=2799, image="https://images.unsplash.com/photo-1632745994322-ac4f4bb36792?w=800&q=80", category="Kurta Sets", section="best_sellers"),
    Product(id="bs3", name="Purple Printed Cotton Kurta Set", price=1399, image="https://images.unsplash.com/photo-1597983073750-16f5ded1321f?w=800&q=80", category="Kurta Sets", section="best_sellers"),
    Product(id="bs4", name="Yellow Floral Organza Saree", price=3299, image="https://images.unsplash.com/photo-1710967074923-2b3ebe6171c3?w=800&q=80", category="Sarees", section="best_sellers"),
    Product(id="bs5", name="Emerald Green Lehenga Choli", price=8999, original_price=11999, image="https://images.unsplash.com/photo-1569810020669-aa9d38003ea7?w=800&q=80", category="Lehengas", tag="SALE", section="best_sellers"),
    Product(id="bs6", name="Royal Red Bridal Lehenga", price=12499, image="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80", category="Wedding Collection", section="best_sellers"),
]

ALL_PRODUCTS = NEW_ARRIVALS + BEST_SELLERS
PRODUCTS_BY_ID = {p.id: p for p in ALL_PRODUCTS}

CATEGORIES = [
    {"name": "Sarees", "slug": "sarees", "image": "https://images.unsplash.com/photo-1710967074868-2041e4f44c17?w=400&q=80"},
    {"name": "Kurtis", "slug": "kurtis", "image": "https://images.unsplash.com/photo-1597983073750-16f5ded1321f?w=400&q=80"},
    {"name": "Kurta Sets", "slug": "kurta-sets", "image": "https://images.unsplash.com/photo-1632745994322-ac4f4bb36792?w=400&q=80"},
    {"name": "Lehengas", "slug": "lehengas", "image": "https://images.unsplash.com/photo-1569810020669-aa9d38003ea7?w=400&q=80"},
    {"name": "Dupattas", "slug": "dupattas", "image": "https://images.unsplash.com/photo-1710967074923-2b3ebe6171c3?w=400&q=80"},
    {"name": "Co-ord Sets", "slug": "co-ord-sets", "image": "https://images.unsplash.com/photo-1739429942851-9083ee185d3d?w=400&q=80"},
    {"name": "Wedding Collection", "slug": "wedding-collection", "image": "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400&q=80"},
    {"name": "Dresses", "slug": "dresses", "image": "https://images.unsplash.com/photo-1678805408704-eb55b9d6e395?w=400&q=80"},
]
CATEGORY_BY_SLUG = {c["slug"]: c for c in CATEGORIES}

REVIEWS = [
    Review(id="r1", name="Priya", location="Mumbai", rating=5, text="The quality is absolutely amazing! Fabric, fitting, everything is great. Loved the packaging too.", avatar="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80"),
    Review(id="r2", name="Neha", location="Delhi", rating=5, text="Beautiful collection and fast delivery. Will shop again for sure! The embroidery is stunning.", avatar="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&q=80"),
    Review(id="r3", name="Ananya", location="Bangalore", rating=5, text="Wore the Anarkali for my sister's engagement and got so many compliments. Fits like a dream.", avatar="https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=200&q=80"),
]

HERO_SLIDES = [
    {"id": "h1", "title": "FESTIVE COLLECTION", "year": "2026", "subtitle": "Celebrate every moment in timeless elegance.", "image": "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1600&q=80", "cta": "SHOP NOW"},
    {"id": "h2", "title": "WEDDING EDIT", "year": "SIGNATURE", "subtitle": "Handcrafted heirlooms woven for your forever day.", "image": "https://images.unsplash.com/photo-1710967074868-2041e4f44c17?w=1600&q=80", "cta": "EXPLORE BRIDAL"},
    {"id": "h3", "title": "SUMMER KURTIS", "year": "EDIT", "subtitle": "Breezy silhouettes in mulmul, chanderi and cotton.", "image": "https://images.unsplash.com/photo-1597983073750-16f5ded1321f?w=1600&q=80", "cta": "SHOP KURTIS"},
]

# Shoppable Instagram: each look ties to a curated set of product ids
INSTAGRAM_LOOKS = [
    {"id": "ig1", "image": "https://images.unsplash.com/photo-1710967074868-2041e4f44c17?w=600&q=80", "caption": "Bridal Whispers", "product_ids": ["bs1", "bs5", "bs6"]},
    {"id": "ig2", "image": "https://images.unsplash.com/photo-1597983073750-16f5ded1321f?w=600&q=80", "caption": "Everyday Elegance", "product_ids": ["na2", "na3", "bs3"]},
    {"id": "ig3", "image": "https://images.unsplash.com/photo-1710967074923-2b3ebe6171c3?w=600&q=80", "caption": "Garden Party", "product_ids": ["na3", "bs4", "na8"]},
    {"id": "ig4", "image": "https://images.unsplash.com/photo-1678805408704-eb55b9d6e395?w=600&q=80", "caption": "Silk Stories", "product_ids": ["bs1", "na6", "bs4"]},
    {"id": "ig5", "image": "https://images.unsplash.com/photo-1739429942851-9083ee185d3d?w=600&q=80", "caption": "Festive Glow", "product_ids": ["na7", "na1", "bs2"]},
    {"id": "ig6", "image": "https://images.unsplash.com/photo-1569810020669-aa9d38003ea7?w=600&q=80", "caption": "Wedding Vibes", "product_ids": ["bs5", "bs6", "na4"]},
]

SHIPPING_FLAT_RATE_INR = 149
FREE_SHIPPING_THRESHOLD_INR = 1999


# ---------- HELPERS ----------
def compute_totals(items: List[CartItem]) -> dict:
    line_items = []
    subtotal = 0
    for item in items:
        p = PRODUCTS_BY_ID.get(item.product_id)
        if not p:
            raise HTTPException(400, f"Unknown product: {item.product_id}")
        line_total = p.price * item.quantity
        subtotal += line_total
        line_items.append({
            "product_id": p.id,
            "name": p.name,
            "price": p.price,
            "image": p.image,
            "quantity": item.quantity,
            "size": item.size,
        })
    shipping = 0 if subtotal >= FREE_SHIPPING_THRESHOLD_INR else SHIPPING_FLAT_RATE_INR
    total = subtotal + shipping
    return {"line_items": line_items, "subtotal": subtotal, "shipping": shipping, "total": total}


# ---------- ROUTES ----------
@api_router.get("/")
async def root():
    return {"message": "ZARAHATKE API", "status": "ok"}


@api_router.get("/products", response_model=List[Product])
async def list_products(section: Optional[str] = None, category: Optional[str] = None):
    results = ALL_PRODUCTS
    if section:
        results = [p for p in results if p.section == section]
    if category:
        results = [p for p in results if p.category.lower() == category.lower()]
    return results


@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    p = PRODUCTS_BY_ID.get(product_id)
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    return p


@api_router.get("/categories")
async def list_categories():
    return CATEGORIES


@api_router.get("/categories/{slug}")
async def category_detail(slug: str):
    c = CATEGORY_BY_SLUG.get(slug)
    if not c:
        raise HTTPException(404, "Category not found")
    products = [p for p in ALL_PRODUCTS if p.category.lower() == c["name"].lower()]
    return {"category": c, "products": products}


@api_router.get("/reviews", response_model=List[Review])
async def list_reviews():
    return REVIEWS


@api_router.get("/hero-slides")
async def list_hero_slides():
    return HERO_SLIDES


@api_router.get("/instagram-feed")
async def list_instagram():
    return [{"id": look["id"], "image": look["image"], "caption": look["caption"]} for look in INSTAGRAM_LOOKS]


@api_router.get("/instagram-feed/{look_id}")
async def instagram_look(look_id: str):
    look = next((l for l in INSTAGRAM_LOOKS if l["id"] == look_id), None)
    if not look:
        raise HTTPException(404, "Look not found")
    products = [PRODUCTS_BY_ID[pid] for pid in look["product_ids"] if pid in PRODUCTS_BY_ID]
    return {"look": look, "products": products}


@api_router.post("/newsletter", response_model=NewsletterEntry)
async def subscribe_newsletter(payload: NewsletterCreate):
    entry = NewsletterEntry(email=payload.email)
    doc = entry.model_dump()
    await db.newsletter.update_one(
        {"email": doc["email"]},
        {"$setOnInsert": doc},
        upsert=True,
    )
    return entry


# ---------- CHECKOUT / ORDERS ----------
@api_router.post("/checkout")
async def create_checkout(payload: CheckoutInitRequest, request: Request):
    if not payload.items:
        raise HTTPException(400, "Cart is empty")
    totals = compute_totals(payload.items)

    order_id = str(uuid.uuid4())
    order_doc = {
        "id": order_id,
        "items": totals["line_items"],
        "subtotal": totals["subtotal"],
        "shipping": totals["shipping"],
        "total": totals["total"],
        "address": payload.address.model_dump(),
        "payment_method": payload.payment_method,
        "payment_status": "cod_pending" if payload.payment_method == "cod" else "pending",
        "status": "confirmed" if payload.payment_method == "cod" else "initiated",
        "session_id": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    if payload.payment_method == "cod":
        await db.orders.insert_one(dict(order_doc))
        return {"order_id": order_id, "redirect_url": f"{payload.origin_url}/order/{order_id}"}

    # Stripe path — Flow B (BYOK using pre-injected key)
    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(
        api_key=os.environ.get("STRIPE_API_KEY", "sk_test_emergent"),
        webhook_url=webhook_url,
    )
    success_url = f"{payload.origin_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{payload.origin_url}/payment/cancel?order_id={order_id}"

    # Amount is authoritative server-side; INR treated as float (rupees)
    session_req = CheckoutSessionRequest(
        amount=float(totals["total"]),
        currency="inr",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={"order_id": order_id, "email": payload.address.email},
    )
    session = await stripe_checkout.create_checkout_session(session_req)
    order_doc["session_id"] = session.session_id
    await db.orders.insert_one(dict(order_doc))
    return {
        "order_id": order_id,
        "session_id": session.session_id,
        "checkout_url": session.url,
    }


@api_router.get("/payments/status/{session_id}")
async def payment_status(session_id: str, request: Request):
    order = await db.orders.find_one({"session_id": session_id}, {"_id": 0})
    if not order:
        raise HTTPException(404, "Order not found")

    if order.get("payment_status") != "paid":
        host_url = str(request.base_url).rstrip("/")
        webhook_url = f"{host_url}/api/webhook/stripe"
        stripe_checkout = StripeCheckout(
            api_key=os.environ.get("STRIPE_API_KEY", "sk_test_emergent"),
            webhook_url=webhook_url,
        )
        try:
            status = await stripe_checkout.get_checkout_status(session_id)
            if status.payment_status == "paid":
                await db.orders.update_one(
                    {"session_id": session_id, "payment_status": {"$ne": "paid"}},
                    {"$set": {"payment_status": "paid", "status": "confirmed",
                              "updated_at": datetime.now(timezone.utc).isoformat()}},
                )
                order = await db.orders.find_one({"session_id": session_id}, {"_id": 0})
        except Exception as e:
            logging.warning(f"Stripe status check failed: {e}")

    return {
        "session_id": session_id,
        "status": order.get("status"),
        "payment_status": order.get("payment_status"),
        "order_id": order.get("id"),
    }


@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    sig = request.headers.get("Stripe-Signature", "")
    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(
        api_key=os.environ.get("STRIPE_API_KEY", "sk_test_emergent"),
        webhook_url=webhook_url,
    )
    try:
        result = await stripe_checkout.handle_webhook(body, sig)
    except Exception as e:
        logging.error(f"Webhook error: {e}")
        raise HTTPException(400, "Invalid webhook")

    if result.payment_status == "paid" and result.session_id:
        await db.orders.update_one(
            {"session_id": result.session_id, "payment_status": {"$ne": "paid"}},
            {"$set": {"payment_status": "paid", "status": "confirmed",
                      "updated_at": datetime.now(timezone.utc).isoformat()}},
        )
    return {"received": True}


@api_router.get("/orders/{order_id}")
async def get_order(order_id: str):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(404, "Order not found")
    return order


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
