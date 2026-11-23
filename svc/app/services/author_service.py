from app.core.exceptions import AppError
from app.data.mock_data import AUTHORS, FOLLOWED_WRITERS, PRODUCTS
from app.models.schemas import Author, AuthorDetail
from app.services import product_service


def _followed(user: dict | None) -> list[int]:
    return FOLLOWED_WRITERS.setdefault(user["id"], []) if user else []


def _book_ids(name: str) -> list[int]:
    return [p["id"] for p in PRODUCTS if p["author"] == name]


def _to_author(a: dict, user: dict | None) -> Author:
    return Author(**a, book_count=len(_book_ids(a["name"])), following=a["id"] in _followed(user))


def _find(author_id: int) -> dict:
    author = next((a for a in AUTHORS if a["id"] == author_id), None)
    if not author:
        raise AppError("Writer not found", 404)
    return author


def list_authors(user: dict | None = None, search: str | None = None) -> list[Author]:
    items = [a for a in AUTHORS if not search or search.lower() in a["name"].lower()]
    return [_to_author(a, user) for a in items]


def list_followed(user: dict) -> list[Author]:
    followed = _followed(user)
    return [_to_author(a, user) for a in AUTHORS if a["id"] in followed]


def get_author(author_id: int, user: dict | None = None) -> AuthorDetail:
    author = _find(author_id)
    books = [product_service.get_product(pid) for pid in _book_ids(author["name"])]
    return AuthorDetail(**_to_author(author, user).model_dump(), books=[b for b in books if b])


def follow(user: dict, author_id: int) -> Author:
    author = _find(author_id)
    followed = _followed(user)
    if author_id not in followed:
        followed.append(author_id)
    return _to_author(author, user)


def unfollow(user: dict, author_id: int) -> Author:
    author = _find(author_id)
    followed = _followed(user)
    if author_id in followed:
        followed.remove(author_id)
    return _to_author(author, user)
