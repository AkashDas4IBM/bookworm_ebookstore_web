from datetime import datetime, timezone

from app.data.mock_data import CATEGORIES, PRODUCTS, REVIEWS
from app.models.schemas import Product, Review, ReviewCreate
from app.utils.helpers import tentative_delivery_date


def _build(p: dict) -> Product:
    return Product(**p, tentative_delivery_date=tentative_delivery_date(p["stock"]))


def list_categories() -> list[dict]:
    return CATEGORIES


def list_brands(category: str | None = None) -> list[str]:
    items = [p for p in PRODUCTS if not category or p["category"].lower() == category.lower()]
    return sorted({p["brand"] for p in items})


def list_products(
    category: str | None = None,
    brand: str | None = None,
    search: str | None = None,
    genre_group: str | None = None,
) -> list[Product]:
    items = PRODUCTS
    if category:
        items = [p for p in items if p["category"].lower() == category.lower()]
    if brand:
        items = [p for p in items if p["brand"].lower() == brand.lower()]
    if genre_group:
        items = [p for p in items if p["genre_group"].lower() == genre_group.lower()]
    if search:
        s = search.lower()
        items = [p for p in items if s in p["title"].lower() or s in p["author"].lower()]
    return [_build(p) for p in items]


def get_product(product_id: int) -> Product | None:
    p = next((p for p in PRODUCTS if p["id"] == product_id), None)
    return _build(p) if p else None


def related_products(product_id: int, limit: int = 3) -> list[Product]:
    """Same-category books first, then books from the same brand."""
    base = next((p for p in PRODUCTS if p["id"] == product_id), None)
    if not base:
        return []
    related = [
        p for p in PRODUCTS
        if p["id"] != product_id and (p["category"] == base["category"] or p["brand"] == base["brand"])
    ]
    related.sort(key=lambda p: p["category"] != base["category"])
    return [_build(p) for p in related[:limit]]


def recommendations_for(product_ids: list[int], limit: int = 4) -> list[Product]:
    """Recommend products from categories the user has bought before, excluding ones already bought."""
    bought = [p for p in PRODUCTS if p["id"] in product_ids]
    categories = {p["category"] for p in bought}
    recs = [p for p in PRODUCTS if p["category"] in categories and p["id"] not in product_ids]
    if not recs:
        recs = sorted((p for p in PRODUCTS if p["id"] not in product_ids), key=lambda p: -p["rating"])
    return [_build(p) for p in recs[:limit]]


def list_reviews(product_id: int) -> list[Review]:
    items = [r for r in REVIEWS if r["product_id"] == product_id]
    return [Review(**r) for r in sorted(items, key=lambda r: r["created_at"], reverse=True)]


def add_review(product_id: int, data: ReviewCreate) -> Review:
    review = {
        "id": max((r["id"] for r in REVIEWS), default=0) + 1,
        "product_id": product_id,
        "name": (data.name or "").strip() or "Anonymous",
        "rating": data.rating,
        "comment": data.comment.strip(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    REVIEWS.append(review)
    return Review(**review)
