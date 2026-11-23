from app.core.exceptions import AppError

TAX_RATE = 0.12
FREE_DELIVERY_MIN = 300  # subtotal at or above this ships free
DELIVERY_CHARGE = 40.0
POINT_VALUE = 1.0  # one gift point is worth Rs 1


def compute_summary(
    lines: list[tuple[float, int]],
    coupon: dict | None = None,
    points_requested: int = 0,
    points_available: int = 0,
) -> dict:
    """Prices a basket. `lines` is a list of (unit_price, quantity)."""
    subtotal = round(sum(price * qty for price, qty in lines), 2)
    item_count = sum(qty for _, qty in lines)
    tax = round(subtotal * TAX_RATE, 2)
    delivery = 0.0 if subtotal == 0 or subtotal >= FREE_DELIVERY_MIN else DELIVERY_CHARGE
    gross = subtotal + tax + delivery

    discount = 0.0
    if coupon:
        if subtotal < coupon["min_subtotal"]:
            raise AppError(f"Coupon {coupon['code']} needs a minimum order of ₹{coupon['min_subtotal']}")
        if coupon["type"] == "flat":
            discount = float(coupon["value"])
        else:
            discount = subtotal * coupon["value"] / 100
            discount = min(discount, coupon.get("max_discount", discount))
        discount = round(min(discount, gross), 2)

    after_coupon = gross - discount
    points = max(0, min(int(points_requested), int(points_available), int(after_coupon)))
    points_discount = round(points * POINT_VALUE, 2)

    return {
        "item_count": item_count,
        "subtotal": subtotal,
        "tax": tax,
        "delivery_charge": delivery,
        "discount": discount,
        "coupon_code": coupon["code"] if coupon else None,
        "points_redeemed": points,
        "points_discount": points_discount,
        "total": round(after_coupon - points_discount, 2),
    }
