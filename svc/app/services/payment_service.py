import re
import uuid
from datetime import datetime, timezone

from app.core.exceptions import AppError
from app.data.mock_data import PAYMENT_METHODS, PAYMENTS
from app.models.schemas import PayRequest, PaymentInitRequest, PaymentOut
from app.services import cart_service

CARD_METHODS = {"credit_card", "debit_card"}
DECLINED_CARD = "4000000000000002"  # mock gateway: this valid test card is always declined
UPI_PATTERN = re.compile(r"^[A-Za-z0-9._-]{2,}@[A-Za-z]{2,}$")


def _out(payment: dict) -> PaymentOut:
    return PaymentOut(**{k: payment[k] for k in PaymentOut.model_fields})


def get_owned(user_id: int, payment_id: str) -> dict:
    payment = PAYMENTS.get(payment_id)
    if not payment or payment["user_id"] != user_id:
        raise AppError("Payment not found", 404)
    return payment


def initiate(user: dict, req: PaymentInitRequest) -> PaymentOut:
    """Step 1: price the basket (coupon + gift points) and open a payment for that amount."""
    if not cart_service.get_cart(user).items:
        raise AppError("Your cart is empty")
    if req.points_to_redeem > user["gift_points"]:
        raise AppError("You do not have that many gift points")
    summary = cart_service.build_summary(user, req.coupon_code, req.points_to_redeem)
    payment = {
        "id": f"pay_{uuid.uuid4().hex[:12]}",
        "user_id": user["id"],
        "amount": summary.total,
        "status": "Initiated",
        "method": None,
        "coupon_code": summary.coupon_code,
        "points_to_redeem": summary.points_redeemed,
        "reference": None,
        "message": "Payment initiated",
    }
    PAYMENTS[payment["id"]] = payment
    return _out(payment)


def _luhn_ok(digits: str) -> bool:
    total = 0
    for i, ch in enumerate(reversed(digits)):
        n = int(ch)
        if i % 2 == 1:
            n *= 2
            if n > 9:
                n -= 9
        total += n
    return total % 10 == 0


def _check_card(req: PayRequest) -> str:
    card = req.card
    if not card:
        raise AppError("Enter your card details")
    digits = re.sub(r"[\s-]", "", card.number)
    if not digits.isdigit() or not 13 <= len(digits) <= 19 or not _luhn_ok(digits):
        raise AppError("Enter a valid card number")
    if len(card.name.strip()) < 2:
        raise AppError("Enter the name on the card")
    if not re.fullmatch(r"\d{3,4}", card.cvv):
        raise AppError("Enter a valid CVV")
    match = re.fullmatch(r"(0[1-9]|1[0-2])/(\d{4})", card.expiry)
    now = datetime.now(timezone.utc)
    if not match or (int(match.group(2)), int(match.group(1))) < (now.year, now.month):
        raise AppError("Enter a valid expiry date (MM/YYYY)")
    if digits == DECLINED_CARD:
        raise PermissionError(f"Card ending {digits[-4:]}")  # turned into a decline below
    return f"card ending {digits[-4:]}"


def _check_upi(req: PayRequest) -> str:
    if not req.upi_id or not UPI_PATTERN.match(req.upi_id.strip()):
        raise AppError("Enter a valid UPI ID, e.g. name@bank")
    return f"UPI {req.upi_id.strip()}"


def _check_wallet(req: PayRequest, options: list[str]) -> str:
    if req.wallet not in options:
        raise AppError("Choose a wallet")
    return str(req.wallet)


def pay(user: dict, payment_id: str, req: PayRequest) -> PaymentOut:
    """Step 2: complete the payment with the chosen option (mock gateway)."""
    payment = get_owned(user["id"], payment_id)
    if payment["status"] == "Paid":
        raise AppError("This payment is already completed")
    if payment["status"] == "Used":
        raise AppError("This payment has already been used for an order")
    method = next((m for m in PAYMENT_METHODS if m["id"] == req.method), None)
    if not method:
        raise AppError("Please choose a valid payment method")

    try:
        if req.method in CARD_METHODS:
            detail = _check_card(req)
        elif req.method == "upi":
            detail = _check_upi(req)
        else:
            detail = _check_wallet(req, method["options"])
    except PermissionError:
        payment.update(status="Failed", method=req.method, message="Payment declined")
        raise AppError("Your bank declined the payment. Please try another card or payment option.", 402)

    payment.update(
        status="Paid",
        method=req.method,
        reference=f"TXN{uuid.uuid4().hex[:10].upper()}",
        message=f"Paid with {detail}",
    )
    return _out(payment)
