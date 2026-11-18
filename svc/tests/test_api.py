from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)
API = "/api/v1"


def _login():
    r = client.post(f"{API}/auth/login", json={"email": "demo@bookstore.com", "password": "Password@123"})
    assert r.status_code == 200
    return r.json()["data"]["access_token"]


def test_health():
    assert client.get("/health").json() == {"status": "ok"}


def test_login_invalid():
    r = client.post(f"{API}/auth/login", json={"email": "demo@bookstore.com", "password": "wrong"})
    assert r.status_code == 401
    assert r.json()["success"] is False


def test_register_and_duplicate():
    body = {"first_name": "New", "last_name": "User", "email": "new@bookstore.com", "password": "Secret@123"}
    assert client.post(f"{API}/auth/register", json=body).status_code == 201
    assert client.post(f"{API}/auth/register", json=body).status_code == 409


def test_register_validation():
    r = client.post(f"{API}/auth/register", json={"first_name": "A", "last_name": "B", "email": "bad", "password": "x"})
    assert r.status_code == 422


def test_products_and_filters():
    r = client.get(f"{API}/products", params={"category": "Technology"})
    data = r.json()["data"]
    assert len(data) == 3 and all(p["category"] == "Technology" for p in data)
    assert data[0]["tentative_delivery_date"]


def test_product_not_found_and_related():
    assert client.get(f"{API}/products/999").status_code == 404
    assert len(client.get(f"{API}/products/3/related").json()["data"]) > 0


def test_product_detail_fields_and_related_limit():
    p = client.get(f"{API}/products/13").json()["data"]
    assert p["genre_group"] == "Non-fiction" and p["language"] == "English"
    assert p["back_image_url"] and p["author_bio"] and p["author_image_url"]
    related = client.get(f"{API}/products/13/related").json()["data"]
    assert len(related) == 3 and all(r["id"] != 13 for r in related)
    assert related[0]["category"] == "Self-help"


def test_genre_group_filter():
    data = client.get(f"{API}/products", params={"genre_group": "Fiction"}).json()["data"]
    assert data and all(p["genre_group"] == "Fiction" for p in data)


def test_reviews_list_and_create():
    assert len(client.get(f"{API}/products/13/reviews").json()["data"]) == 2
    r = client.post(f"{API}/products/2/reviews", json={"rating": 4, "comment": "Great read"})
    assert r.status_code == 201 and r.json()["data"]["name"] == "Anonymous"
    assert client.post(f"{API}/products/2/reviews", json={"rating": 6, "comment": "x"}).status_code == 422
    assert client.post(f"{API}/products/2/reviews", json={"rating": 5, "comment": "x" * 101}).status_code == 422
    assert client.post(f"{API}/products/999/reviews", json={"rating": 5, "comment": "ok"}).status_code == 404


def test_me_requires_auth():
    assert client.get(f"{API}/users/me").status_code == 401


def test_me_orders_recommendations():
    h = {"Authorization": f"Bearer {_login()}"}
    assert client.get(f"{API}/users/me", headers=h).json()["data"]["email"] == "demo@bookstore.com"
    assert len(client.get(f"{API}/users/me/orders", headers=h).json()["data"]) == 2
    assert len(client.get(f"{API}/users/me/recommendations", headers=h).json()["data"]) > 0
