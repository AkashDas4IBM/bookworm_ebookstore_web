from fastapi import APIRouter, Depends

from app.middleware.auth import get_current_user
from app.services import order_service
from app.utils.helpers import success

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.get("")
def list_orders(user: dict = Depends(get_current_user)):
    return success(order_service.list_orders(user["id"]))


# Declared before "/{order_id}" so "buy-again" is not parsed as an id
@router.get("/buy-again")
def buy_again(user: dict = Depends(get_current_user)):
    return success(order_service.buy_again_products(user["id"]))


@router.get("/{order_id}")
def get_order(order_id: int, user: dict = Depends(get_current_user)):
    return success(order_service.get_order(user["id"], order_id))


@router.post("/{order_id}/cancel")
def cancel_order(order_id: int, user: dict = Depends(get_current_user)):
    return success(order_service.cancel_order(user, order_id), "Order cancelled")


@router.post("/{order_id}/reorder")
def reorder(order_id: int, user: dict = Depends(get_current_user)):
    order_service.reorder(user, order_id)
    return success(None, "Books added to your cart")
