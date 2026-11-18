from fastapi import APIRouter, Depends

from app.middleware.auth import get_current_user
from app.services import order_service, product_service, user_service
from app.utils.helpers import success

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me")
def me(user: dict = Depends(get_current_user)):
    return success(user_service.to_user_out(user))


@router.get("/me/addresses")
def my_addresses(user: dict = Depends(get_current_user)):
    return success(user["addresses"])


@router.get("/me/orders")
def my_orders(user: dict = Depends(get_current_user)):
    """Order history (supports the 'Buy again' feature)."""
    return success(order_service.list_orders(user["id"]))


@router.get("/me/recommendations")
def my_recommendations(user: dict = Depends(get_current_user)):
    """Books from categories the user has bought before, excluding books already bought."""
    bought = [i["product_id"] for o in user_service.get_orders(user["id"]) if o["status"] != "Cancelled" for i in o["items"]]
    return success(product_service.recommendations_for(bought, limit=6))
