from fastapi import APIRouter, Depends, status

from app.data.mock_data import COUPONS, FORM_OPTIONS
from app.middleware.auth import get_current_user
from app.models.schemas import PayRequest, PaymentInitRequest, PlaceOrderRequest, SummaryRequest
from app.services import cart_service, order_service, payment_service
from app.utils.helpers import success

router = APIRouter(tags=["Checkout"])


@router.get("/meta/form-options")
def form_options():
    """Dropdown data for the registration and address forms (country codes, countries, states)."""
    return success(FORM_OPTIONS)


@router.get("/checkout/payment-methods")
def payment_methods():
    return success(order_service.payment_methods())


@router.get("/checkout/coupons")
def coupons(_: dict = Depends(get_current_user)):
    return success(list(COUPONS.values()))


@router.post("/checkout/summary")
def summary(payload: SummaryRequest, user: dict = Depends(get_current_user)):
    """Re-prices the cart with an optional coupon and gift points."""
    return success(cart_service.build_summary(user, payload.coupon_code, payload.points_to_redeem))


@router.post("/checkout/payments", status_code=status.HTTP_201_CREATED)
def initiate_payment(payload: PaymentInitRequest, user: dict = Depends(get_current_user)):
    """Step 1 of payment: lock the payable amount (coupon and gift points applied)."""
    return success(payment_service.initiate(user, payload), "Payment initiated")


@router.post("/checkout/payments/{payment_id}/pay")
def complete_payment(payment_id: str, payload: PayRequest, user: dict = Depends(get_current_user)):
    """Step 2 of payment: pay with a card, UPI or wallet."""
    return success(payment_service.pay(user, payment_id, payload), "Payment successful")


@router.post("/checkout/place-order", status_code=status.HTTP_201_CREATED)
def place_order(payload: PlaceOrderRequest, user: dict = Depends(get_current_user)):
    order = order_service.place_order(user, payload)
    return success({"order": order, "gift_points": user["gift_points"]}, "Payment successful. Your order is placed.")
