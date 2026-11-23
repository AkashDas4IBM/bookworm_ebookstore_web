import pytest
from fastapi.testclient import TestClient

from app.data.mock_data import AUTHORS, FOLLOWED_WRITERS, PRODUCTS, WISHLISTS
from app.main import app

client = TestClient(app)
API = "/api/v1"


@pytest.fixture(autouse=True)
def reset_state():
    wishlist, followed = list(WISHLISTS[1]), list(FOLLOWED_WRITERS[1])
    yield
    WISHLISTS.clear()
    WISHLISTS[1] = wishlist
    FOLLOWED_WRITERS.clear()
    FOLLOWED_WRITERS[1] = followed


def _headers(email="demo@bookstore.com"):
    r = client.post(f"{API}/auth/login", json={"email": email, "password": "Password@123"})
    return {"Authorization": f"Bearer {r.json()['data']['access_token']}"}


def test_wishlist_and_writers_require_login():
    for url in ("/wishlist", "/writers", "/writers/me", "/writers/1"):
        assert client.get(f"{API}{url}").status_code == 401


def test_every_product_author_has_a_writer_record():
    assert {a["name"] for a in AUTHORS} == {p["author"] for p in PRODUCTS}


def test_seeded_wishlist_lists_books():
    data = client.get(f"{API}/wishlist", headers=_headers()).json()["data"]
    assert [p["id"] for p in data] == [1, 7, 9]
    assert all(p["tentative_delivery_date"] for p in data)


def test_add_and_remove_wishlist_item():
    h = _headers()
    r = client.post(f"{API}/wishlist", json={"product_id": 5}, headers=h)
    assert r.status_code == 201 and 5 in [p["id"] for p in r.json()["data"]]

    # adding the same book twice does not duplicate it
    r = client.post(f"{API}/wishlist", json={"product_id": 5}, headers=h)
    assert [p["id"] for p in r.json()["data"]].count(5) == 1

    r = client.delete(f"{API}/wishlist/5", headers=h)
    assert r.status_code == 200 and 5 not in [p["id"] for p in r.json()["data"]]


def test_wishlist_errors():
    h = _headers()
    assert client.post(f"{API}/wishlist", json={"product_id": 9999}, headers=h).status_code == 404
    assert client.delete(f"{API}/wishlist/20", headers=h).status_code == 404


def test_wishlist_is_private_per_user():
    assert client.get(f"{API}/wishlist", headers=_headers("jane@bookstore.com")).json()["data"] == []


def test_writer_list_marks_followed_writers():
    h = _headers()
    writers = client.get(f"{API}/writers", headers=h).json()["data"]
    assert len(writers) == len(AUTHORS)
    assert {w["id"] for w in writers if w["following"]} == {1, 7}
    arjun = next(w for w in writers if w["name"] == "Arjun Patel")
    assert arjun["book_count"] == 1

    found = client.get(f"{API}/writers", params={"search": "patel"}, headers=h).json()["data"]
    assert {w["name"] for w in found} == {"Arjun Patel", "Raj Patel"}


def test_my_writers_and_follow_unfollow():
    h = _headers()
    mine = client.get(f"{API}/writers/me", headers=h).json()["data"]
    assert [w["id"] for w in mine] == [1, 7]

    r = client.post(f"{API}/writers/3/follow", headers=h)
    assert r.status_code == 200 and r.json()["data"]["following"] is True
    assert [w["id"] for w in client.get(f"{API}/writers/me", headers=h).json()["data"]] == [1, 3, 7]

    r = client.delete(f"{API}/writers/3/follow", headers=h)
    assert r.json()["data"]["following"] is False
    assert [w["id"] for w in client.get(f"{API}/writers/me", headers=h).json()["data"]] == [1, 7]


def test_writer_detail_lists_their_books():
    p_author = next(p["author"] for p in PRODUCTS if p["id"] == 19)  # P. Wells wrote two books
    writer = next(a for a in AUTHORS if a["name"] == p_author)
    data = client.get(f"{API}/writers/{writer['id']}", headers=_headers()).json()["data"]
    assert data["name"] == "P. Wells"
    assert sorted(b["id"] for b in data["books"]) == [19, 20]
    assert data["book_count"] == 2


def test_unknown_writer_is_404():
    h = _headers()
    assert client.get(f"{API}/writers/9999", headers=h).status_code == 404
    assert client.post(f"{API}/writers/9999/follow", headers=h).status_code == 404
