from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone


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
    tag: Optional[str] = None  # "NEW" | "SALE" | None
    section: str  # "new_arrivals" | "best_sellers"


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


# ---------- SEED DATA (in-memory catalog) ----------
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

CATEGORIES = [
    {"name": "Sarees", "image": "https://images.unsplash.com/photo-1710967074868-2041e4f44c17?w=400&q=80"},
    {"name": "Kurtis", "image": "https://images.unsplash.com/photo-1597983073750-16f5ded1321f?w=400&q=80"},
    {"name": "Kurta Sets", "image": "https://images.unsplash.com/photo-1632745994322-ac4f4bb36792?w=400&q=80"},
    {"name": "Lehengas", "image": "https://images.unsplash.com/photo-1569810020669-aa9d38003ea7?w=400&q=80"},
    {"name": "Dupattas", "image": "https://images.unsplash.com/photo-1710967074923-2b3ebe6171c3?w=400&q=80"},
    {"name": "Co-ord Sets", "image": "https://images.unsplash.com/photo-1739429942851-9083ee185d3d?w=400&q=80"},
    {"name": "Wedding Collection", "image": "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400&q=80"},
    {"name": "Dresses", "image": "https://images.unsplash.com/photo-1678805408704-eb55b9d6e395?w=400&q=80"},
]

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

INSTAGRAM = [
    "https://images.unsplash.com/photo-1710967074868-2041e4f44c17?w=400&q=80",
    "https://images.unsplash.com/photo-1597983073750-16f5ded1321f?w=400&q=80",
    "https://images.unsplash.com/photo-1710967074923-2b3ebe6171c3?w=400&q=80",
    "https://images.unsplash.com/photo-1678805408704-eb55b9d6e395?w=400&q=80",
    "https://images.unsplash.com/photo-1739429942851-9083ee185d3d?w=400&q=80",
    "https://images.unsplash.com/photo-1569810020669-aa9d38003ea7?w=400&q=80",
]


# ---------- ROUTES ----------
@api_router.get("/")
async def root():
    return {"message": "ZARAHATKE API", "status": "ok"}


@api_router.get("/products", response_model=List[Product])
async def list_products(section: Optional[str] = None):
    all_products = NEW_ARRIVALS + BEST_SELLERS
    if section:
        return [p for p in all_products if p.section == section]
    return all_products


@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    for p in NEW_ARRIVALS + BEST_SELLERS:
        if p.id == product_id:
            return p
    raise HTTPException(status_code=404, detail="Product not found")


@api_router.get("/categories")
async def list_categories():
    return CATEGORIES


@api_router.get("/reviews", response_model=List[Review])
async def list_reviews():
    return REVIEWS


@api_router.get("/hero-slides")
async def list_hero_slides():
    return HERO_SLIDES


@api_router.get("/instagram-feed")
async def list_instagram():
    return [{"id": f"ig{i}", "image": url} for i, url in enumerate(INSTAGRAM)]


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
