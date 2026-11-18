from fastapi import APIRouter, HTTPException, Query, status

from app.models.schemas import ReviewCreate
from app.services import product_service
from app.utils.helpers import success

router = APIRouter(tags=["Catalogue"])


def _require_product(product_id: int):
    product = product_service.get_product(product_id)
    if not product:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Product not found")
    return product


@router.get("/categories")
def categories():
    return success(product_service.list_categories())


@router.get("/brands")
def brands(category: str | None = None):
    return success(product_service.list_brands(category))


@router.get("/products")
def products(
    category: str | None = None,
    brand: str | None = None,
    genre_group: str | None = None,
    search: str | None = Query(default=None, min_length=1),
):
    return success(product_service.list_products(category, brand, search, genre_group))


@router.get("/products/{product_id}")
def product_detail(product_id: int):
    return success(_require_product(product_id))


@router.get("/products/{product_id}/related")
def related(product_id: int, limit: int = Query(default=3, ge=1, le=10)):
    return success(product_service.related_products(product_id, limit))


@router.get("/products/{product_id}/reviews")
def reviews(product_id: int):
    _require_product(product_id)
    return success(product_service.list_reviews(product_id))


@router.post("/products/{product_id}/reviews", status_code=status.HTTP_201_CREATED)
def create_review(product_id: int, payload: ReviewCreate):
    _require_product(product_id)
    return success(product_service.add_review(product_id, payload), "Review submitted")
