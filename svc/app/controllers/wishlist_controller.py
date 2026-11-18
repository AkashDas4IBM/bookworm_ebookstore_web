from fastapi import APIRouter, Depends, status

from app.middleware.auth import get_current_user
from app.models.schemas import WishlistItemIn
from app.services import wishlist_service
from app.utils.helpers import success

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])


@router.get("")
def get_wishlist(user: dict = Depends(get_current_user)):
    return success(wishlist_service.list_items(user))


@router.post("", status_code=status.HTTP_201_CREATED)
def add_to_wishlist(payload: WishlistItemIn, user: dict = Depends(get_current_user)):
    return success(wishlist_service.add(user, payload.product_id), "Added to wishlist")


@router.delete("/{product_id}")
def remove_from_wishlist(product_id: int, user: dict = Depends(get_current_user)):
    return success(wishlist_service.remove(user, product_id), "Removed from wishlist")
