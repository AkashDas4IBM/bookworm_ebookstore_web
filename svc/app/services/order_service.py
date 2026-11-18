from datetime import datetime, timedelta, timezone

from app.core.exceptions import AppError
from app.data.mock_data import ORDERS, PAYMENT_METHODS, PRODUCTS
from app.models.schemas import OrderItemOut, OrderOut, PlaceOrderRequest, Product
from app.services import cart_service, payment_service, product_service

CANCEL_WINDOW = timedelta(hours=48)
DELIVERY_TIME = timedelta(days=5)  # same lead time as the tentative delivery date on product pages
CANCELLABLE_STATUSES = {"Placed", "Processing"}


def payment_methods() -> list[dict]:
    return PAYMENT_METHODS


def _deadline(order: dict) -> datetime:
    return datetime.fromisoformat(order["placed_at"]) + CANCEL_WINDOW


def _is_cancellable(order: dict) -> bool:
    return order["status"] in CANCELLABLE_STATUSES and datetime.now(timezone.utc) < _deadline(order)


def to_order_out(order: dict) -> OrderOut:
    items = []
    for line in order["items"]:
        product = next(p for p in PRODUCTS if p["id"] == line["product_id"])
        items.append(
            OrderItemOut(
                product_id=product["id"],
                title=product["title"],
                author=product["author"],
                format=product["format"],
                image_url=product["image_url"],
                description=product["description"],
                category=product["category"],
                genre_group=product.get("genre_group"),
                quantity=line["quantity"],
                unit_price=line["unit_price"],
                line_total=round(line["unit_price"] * line["quantity"], 2),
            )
        )
    cancellable = _is_cancellable(order)
    return OrderOut(
        **{k: v for k, v in order.items() if k not in ("items", "user_id")},
        items=items,
        estimated_delivery=(datetime.fromisoformat(order["placed_at"]) + DELIVERY_TIME).date().isoformat(),
        cancellable=cancellable,
        cancel_deadline=_deadline(order).isoformat() if cancellable else None,
    )


def list_orders(user_id: int) -> list[OrderOut]:
    mine = [o for o in ORDERS if o["user_id"] == user_id]
    return [to_order_out(o) for o in sorted(mine, key=lambda o: o["placed_at"], reverse=True)]


def _get_owned(user_id: int, order_id: int) -> dict:
    order = next((o for o in ORDERS if o["id"] == order_id and o["user_id"] == user_id), None)
    if not order:
        raise AppError("Order not found", 404)
    return order


def get_order(user_id: int, order_id: int) -> OrderOut:
    return to_order_out(_get_owned(user_id, order_id))


def buy_again_products(user_id: int, limit: int = 6) -> list[Product]:
    """Distinct books from past orders, most recently bought first."""
    seen: list[int] = []
    for order in sorted((o for o in ORDERS if o["user_id"] == user_id), key=lambda o: o["placed_at"], reverse=True):
        if order["status"] == "Cancelled":
            continue
        for line in order["items"]:
            if line["product_id"] not in seen:
                seen.append(line["product_id"])
    products = [product_service.get_product(pid) for pid in seen]
    return [p for p in products if p][:limit]


def place_order(user: dict, req: PlaceOrderRequest) -> OrderOut:
    cart = cart_service.get_cart(user)
    if not cart.items:
        raise AppError("Your cart is empty")
    for line in cart.items:
        if line.product.stock < line.quantity:
            raise AppError(f"'{line.product.title}' does not have enough stock")

    payment = payment_service.get_owned(user["id"], req.payment_id)
    if payment["status"] == "Used":
        raise AppError("This payment has already been used for an order")
    if payment["status"] != "Paid":
        raise AppError("Complete the payment before placing the order", 402)
    if payment["points_to_redeem"] > user["gift_points"]:
        raise AppError("You do not have that many gift points")

    summary = cart_service.build_summary(user, payment["coupon_code"], payment["points_to_redeem"])
    if summary.total != payment["amount"]:
        raise AppError("Your cart changed after the payment was started. Please review and pay again.")

    order = {
        "id": max((o["id"] for o in ORDERS), default=1000) + 1,
        "user_id": user["id"],
        "items": [
            {"product_id": l.product.id, "quantity": l.quantity, "unit_price": l.product.price} for l in cart.items
        ],
        "subtotal": summary.subtotal,
        "tax": summary.tax,
        "delivery_charge": summary.delivery_charge,
        "discount": summary.discount + summary.points_discount,
        "coupon_code": summary.coupon_code,
        "points_redeemed": summary.points_redeemed,
        "points_earned": int(summary.total // 100),
        "total": summary.total,
        "payment_method": payment["method"],
        "payment_reference": payment["reference"],
        "address": req.address.model_dump(),
        "status": "Placed",
        "placed_at": datetime.now(timezone.utc).isoformat(),
    }
    ORDERS.append(order)
    payment["status"] = "Used"

    for line in order["items"]:
        next(p for p in PRODUCTS if p["id"] == line["product_id"])["stock"] -= line["quantity"]
    user["gift_points"] += order["points_earned"] - order["points_redeemed"]
    cart_service.clear(user)
    return to_order_out(order)


def cancel_order(user: dict, order_id: int) -> OrderOut:
    order = _get_owned(user["id"], order_id)
    if order["status"] == "Cancelled":
        raise AppError("This order is already cancelled")
    if order["status"] not in CANCELLABLE_STATUSES:
        raise AppError("This order can no longer be cancelled")
    if datetime.now(timezone.utc) >= _deadline(order):
        raise AppError("Orders can only be cancelled within 48 hours of purchase")

    order["status"] = "Cancelled"
    for line in order["items"]:
        next(p for p in PRODUCTS if p["id"] == line["product_id"])["stock"] += line["quantity"]
    user["gift_points"] += order["points_redeemed"] - order["points_earned"]
    user["gift_points"] = max(user["gift_points"], 0)
    return to_order_out(order)


def reorder(user: dict, order_id: int) -> None:
    """Buy again: put every available book from an old order back in the cart."""
    order = _get_owned(user["id"], order_id)
    added = 0
    for line in order["items"]:
        product = product_service.get_product(line["product_id"])
        if product and product.stock > 0:
            cart_service.add_item(user, product.id, min(line["quantity"], product.stock))
            added += 1
    if added == 0:
        raise AppError("None of the books in this order are currently available")
