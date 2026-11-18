from fastapi import APIRouter, Depends, Query

from app.middleware.auth import get_current_user
from app.services import author_service
from app.utils.helpers import success

router = APIRouter(prefix="/writers", tags=["Writers"])


@router.get("")
def all_writers(search: str | None = Query(default=None, min_length=1), user: dict = Depends(get_current_user)):
    return success(author_service.list_authors(user, search))


# Declared before "/{author_id}" so "me" is not parsed as an id
@router.get("/me")
def my_writers(user: dict = Depends(get_current_user)):
    return success(author_service.list_followed(user))


@router.get("/{author_id}")
def writer_detail(author_id: int, user: dict = Depends(get_current_user)):
    return success(author_service.get_author(author_id, user))


@router.post("/{author_id}/follow")
def follow_writer(author_id: int, user: dict = Depends(get_current_user)):
    return success(author_service.follow(user, author_id), "Writer added to My Writers")


@router.delete("/{author_id}/follow")
def unfollow_writer(author_id: int, user: dict = Depends(get_current_user)):
    return success(author_service.unfollow(user, author_id), "Writer removed from My Writers")
