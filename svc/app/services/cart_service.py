from app.core.exceptions import AppError
from app.data.mock_data import CARTS, COUPONS
from app.models.schemas import CartLine, CartOut, PriceSummary
from app.services import product_service
from app.utils.pricing import compute_summary

MAX_QTY = 10


def _items(user_id: int) -> list[dict]:
    return CARTS.setdefault(user_id, [])


def find_coupon(code: str | None) -> dict | None:
    if not code or not code.strip():
        return None
    coupon = COUPONS.get(code.strip().upper())
    if not coupon:
        raise AppError(f"Coupon '{code.strip()}' is not valid")
    return coupon


def _lines(user_id: int) -> list[tuple[object, int]]:
    result = []
    for item in _items(user_id):
        product = product_service.get_product(item["product_id"])
        if product:
            result.append((product, item["quantity"]))
    return result


def build_summary(user: dict, coupon_code: str | None = None, points_to_redeem: int = 0) -> PriceSummary:
    lines = [(p.price, qty) for p, qty in _lines(user["id"])]
    summary = compute_summary(lines, find_coupon(coupon_code), points_to_redeem, user["gift_points"])
    return PriceSummary(**summary)


def get_cart(user: dict) -> CartOut:
    lines = _lines(user["id"])
    return CartOut(
        items=[CartLine(product=p, quantity=q, line_total=round(p.price * q, 2)) for p, q in lines],
        summary=build_summary(user),
    )


def add_item(user: dict, product_id: int, quantity: int) -> CartOut:
    product = product_service.get_product(product_id)
    if not product:
        raise AppError("Product not found", 404)
    if product.stock <= 0:
        raise AppError("This book is out of stock")
    items = _items(user["id"])
    existing = next((i for i in items if i["product_id"] == product_id), None)
    new_qty = (existing["quantity"] if existing else 0) + quantity
    if new_qty > min(MAX_QTY, product.stock):
        raise AppError(f"You can order at most {min(MAX_QTY, product.stock)} copies of this book")
    if existing:
        existing["quantity"] = new_qty
    else:
        items.append({"product_id": product_id, "quantity": quantity})
    return get_cart(user)


def set_quantity(user: dict, product_id: int, quantity: int) -> CartOut:
    items = _items(user["id"])
    existing = next((i for i in items if i["product_id"] == product_id), None)
    if not existing:
        raise AppError("Item is not in your cart", 404)
    if quantity == 0:
        items.remove(existing)
    else:
        product = product_service.get_product(product_id)
        limit = min(MAX_QTY, product.stock) if product else MAX_QTY
        if quantity > limit:
            raise AppError(f"You can order at most {limit} copies of this book")
        existing["quantity"] = quantity
    return get_cart(user)


def clear(user: dict) -> None:
    CARTS[user["id"]] = []
