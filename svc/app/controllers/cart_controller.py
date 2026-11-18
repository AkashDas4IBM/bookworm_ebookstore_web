from fastapi import APIRouter, Depends, status

from app.middleware.auth import get_current_user
from app.models.schemas import CartItemIn, CartQuantityIn
from app.services import cart_service
from app.utils.helpers import success

router = APIRouter(prefix="/cart", tags=["Cart"])


@router.get("")
def get_cart(user: dict = Depends(get_current_user)):
    return success(cart_service.get_cart(user))


@router.post("/items", status_code=status.HTTP_201_CREATED)
def add_item(payload: CartItemIn, user: dict = Depends(get_current_user)):
    return success(cart_service.add_item(user, payload.product_id, payload.quantity), "Added to cart")


@router.put("/items/{product_id}")
def set_quantity(product_id: int, payload: CartQuantityIn, user: dict = Depends(get_current_user)):
    return success(cart_service.set_quantity(user, product_id, payload.quantity))


@router.delete("/items/{product_id}")
def remove_item(product_id: int, user: dict = Depends(get_current_user)):
    return success(cart_service.set_quantity(user, product_id, 0), "Removed from cart")
