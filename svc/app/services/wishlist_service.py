from app.core.exceptions import AppError
from app.data.mock_data import WISHLISTS
from app.models.schemas import Product
from app.services import product_service


def _ids(user_id: int) -> list[int]:
    return WISHLISTS.setdefault(user_id, [])


def list_items(user: dict) -> list[Product]:
    products = (product_service.get_product(pid) for pid in _ids(user["id"]))
    return [p for p in products if p]


def add(user: dict, product_id: int) -> list[Product]:
    if not product_service.get_product(product_id):
        raise AppError("Product not found", 404)
    ids = _ids(user["id"])
    if product_id not in ids:
        ids.append(product_id)
    return list_items(user)


def remove(user: dict, product_id: int) -> list[Product]:
    ids = _ids(user["id"])
    if product_id not in ids:
        raise AppError("Book is not in your wishlist", 404)
    ids.remove(product_id)
    return list_items(user)
