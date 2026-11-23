from datetime import datetime, timedelta, timezone

import pytest
from fastapi.testclient import TestClient

from app.data.mock_data import CARTS, ORDERS, PAYMENTS, PRODUCTS, USERS
from app.main import app

client = TestClient(app)
API = "/api/v1"

ADDRESS = {
    "first_name": "Demo", "last_name": "User", "email": "demo@bookstore.com", "phone": "+919876543210",
    "line1": "12 Park Street", "city": "Kolkata", "state": "West Bengal", "postal_code": "700016", "country": "India",
}


@pytest.fixture(autouse=True)
def reset_state():
    """Each test starts from the seeded cart, orders and points of the demo user."""
    cart, orders = [dict(i) for i in CARTS[1]], [o for o in ORDERS]
    points = USERS[0]["gift_points"]
    stock = {p["id"]: p["stock"] for p in PRODUCTS}
    PAYMENTS.clear()
    yield
    PAYMENTS.clear()
    CARTS[1] = cart
    ORDERS[:] = orders
    USERS[0]["gift_points"] = points
    for p in PRODUCTS:
        p["stock"] = stock[p["id"]]


CARD = {"number": "4111 1111 1111 1111", "name": "Demo User", "cvv": "123", "expiry": "12/2099"}


def _headers(email="demo@bookstore.com"):
    r = client.post(f"{API}/auth/login", json={"email": email, "password": "Password@123"})
    return {"Authorization": f"Bearer {r.json()['data']['access_token']}"}


def _paid(h, method="credit_card", coupon=None, points=0, **details):
    """Runs the two payment steps and returns the paid payment id."""
    init = client.post(f"{API}/checkout/payments", json={"coupon_code": coupon, "points_to_redeem": points}, headers=h)
    assert init.status_code == 201, init.text
    pid = init.json()["data"]["id"]
    body = {"method": method, **({"card": CARD} if method.endswith("card") and not details else details)}
    paid = client.post(f"{API}/checkout/payments/{pid}/pay", json=body, headers=h)
    assert paid.status_code == 200, paid.text
    return pid


def _order_body(pid):
    return {"address": ADDRESS, "payment_id": pid}


def test_cart_requires_login():
    assert client.get(f"{API}/cart").status_code == 401
    assert client.post(f"{API}/cart/items", json={"product_id": 1}).status_code == 401


def test_seed_cart_matches_checkout_design():
    data = client.get(f"{API}/cart", headers=_headers()).json()["data"]
    assert [i["product"]["id"] for i in data["items"]] == [13, 3]
    s = data["summary"]
    assert s["subtotal"] == 508 and s["tax"] == 60.96 and s["delivery_charge"] == 0
    assert s["total"] == 568.96


def test_add_update_remove_item():
    h = _headers()
    r = client.post(f"{API}/cart/items", json={"product_id": 1, "quantity": 2}, headers=h)
    assert r.status_code == 201 and r.json()["data"]["summary"]["item_count"] == 4
    r = client.put(f"{API}/cart/items/1", json={"quantity": 5}, headers=h)
    assert r.json()["data"]["summary"]["item_count"] == 7
    r = client.delete(f"{API}/cart/items/1", headers=h)
    assert [i["product"]["id"] for i in r.json()["data"]["items"]] == [13, 3]


def test_add_item_rules():
    h = _headers()
    assert client.post(f"{API}/cart/items", json={"product_id": 999}, headers=h).status_code == 404
    assert client.post(f"{API}/cart/items", json={"product_id": 18}, headers=h).status_code == 400  # out of stock
    assert client.post(f"{API}/cart/items", json={"product_id": 1, "quantity": 0}, headers=h).status_code == 422
    assert client.put(f"{API}/cart/items/77", json={"quantity": 1}, headers=h).status_code == 404


def test_summary_with_coupon_and_points():
    h = _headers()
    r = client.post(f"{API}/checkout/summary", json={"coupon_code": "welcome100", "points_to_redeem": 50}, headers=h)
    s = r.json()["data"]
    assert s["discount"] == 100 and s["points_redeemed"] == 50
    assert s["total"] == round(568.96 - 100 - 50, 2)


def test_summary_rejects_bad_coupon_and_caps_points():
    h = _headers()
    assert client.post(f"{API}/checkout/summary", json={"coupon_code": "NOPE"}, headers=h).status_code == 400
    s = client.post(f"{API}/checkout/summary", json={"points_to_redeem": 99999}, headers=h).json()["data"]
    assert s["points_redeemed"] == 250  # capped at the user's balance


def test_payment_methods_and_form_options_are_public():
    methods = client.get(f"{API}/checkout/payment-methods").json()["data"]
    assert [m["id"] for m in methods] == ["credit_card", "debit_card", "upi", "wallet"]
    assert next(m for m in methods if m["id"] == "wallet")["options"]
    opts = client.get(f"{API}/meta/form-options").json()["data"]
    assert "+91" in [c["code"] for c in opts["country_codes"]] and "India" in opts["states"]


def test_place_order_empties_cart_and_updates_points():
    h = _headers()
    pid = _paid(h, "upi", coupon="READ10", points=20, upi_id="demo@okbank")
    r = client.post(f"{API}/checkout/place-order", json=_order_body(pid), headers=h)
    assert r.status_code == 201
    order = r.json()["data"]["order"]
    assert order["status"] == "Placed" and order["cancellable"] and order["points_redeemed"] == 20
    assert order["payment_method"] == "upi" and order["payment_reference"].startswith("TXN")
    assert len(order["items"]) == 2
    first = order["items"][0]  # the confirmation screen shows these for each book
    assert first["description"] and first["category"] and "genre_group" in first
    assert order["estimated_delivery"] == (datetime.fromisoformat(order["placed_at"]) + timedelta(days=5)).date().isoformat()
    assert client.get(f"{API}/cart", headers=h).json()["data"]["items"] == []
    expected_points = 250 - 20 + order["points_earned"]
    assert r.json()["data"]["gift_points"] == expected_points
    assert client.get(f"{API}/users/me", headers=h).json()["data"]["gift_points"] == expected_points


def test_place_order_validation():
    h = _headers()
    pid = _paid(h)
    bad_pin = {"address": {**ADDRESS, "postal_code": "12"}, "payment_id": pid}
    assert client.post(f"{API}/checkout/place-order", json=bad_pin, headers=h).status_code == 422
    assert client.post(f"{API}/checkout/payments", json={"points_to_redeem": 999}, headers=h).status_code == 400
    CARTS[1] = []
    assert client.post(f"{API}/checkout/place-order", json=_order_body(pid), headers=h).status_code == 400  # empty cart
    assert client.post(f"{API}/checkout/payments", json={}, headers=h).status_code == 400  # nothing to pay for


def test_order_history_and_buy_again():
    h = _headers()
    orders = client.get(f"{API}/orders", headers=h).json()["data"]
    assert [o["id"] for o in orders] == [1002, 1001]  # newest first
    assert orders[0]["cancellable"] is False  # delivered
    again = client.get(f"{API}/orders/buy-again", headers=h).json()["data"]
    assert [p["id"] for p in again] == [8, 3, 5]
    r = client.post(f"{API}/orders/1001/reorder", headers=h)
    assert r.status_code == 200
    ids = [i["product"]["id"] for i in client.get(f"{API}/cart", headers=h).json()["data"]["items"]]
    assert ids == [13, 3, 5] and client.get(f"{API}/orders/9999", headers=h).status_code == 404


def test_orders_are_private_to_their_owner():
    jane = _headers("jane@bookstore.com")
    assert client.get(f"{API}/orders/1001", headers=jane).status_code == 404
    assert client.post(f"{API}/orders/1001/cancel", headers=jane).status_code == 404


def test_cancel_within_48_hours_restores_stock_and_points():
    h = _headers()
    stock_before = next(p for p in client.get(f"{API}/products").json()["data"] if p["id"] == 13)["stock"]
    placed = client.post(f"{API}/checkout/place-order", json=_order_body(_paid(h, points=30)), headers=h)
    order = placed.json()["data"]["order"]
    r = client.post(f"{API}/orders/{order['id']}/cancel", headers=h)
    assert r.status_code == 200 and r.json()["data"]["status"] == "Cancelled"
    assert client.get(f"{API}/users/me", headers=h).json()["data"]["gift_points"] == 250  # 30 back, earned points removed
    assert next(p for p in client.get(f"{API}/products").json()["data"] if p["id"] == 13)["stock"] == stock_before
    assert client.post(f"{API}/orders/{order['id']}/cancel", headers=h).status_code == 400  # already cancelled


def test_cancel_after_48_hours_is_refused():
    h = _headers()
    order = client.post(f"{API}/checkout/place-order", json=_order_body(_paid(h)), headers=h).json()["data"]["order"]
    stored = next(o for o in ORDERS if o["id"] == order["id"])
    stored["placed_at"] = (datetime.now(timezone.utc) - timedelta(hours=49)).isoformat()
    r = client.post(f"{API}/orders/{order['id']}/cancel", headers=h)
    assert r.status_code == 400 and "48 hours" in r.json()["message"]
    assert client.get(f"{API}/orders/{order['id']}", headers=h).json()["data"]["cancellable"] is False


def test_initiate_payment_locks_amount_with_coupon_and_points():
    h = _headers()
    p = client.post(f"{API}/checkout/payments", json={"coupon_code": "WELCOME100", "points_to_redeem": 50}, headers=h).json()["data"]
    assert p["status"] == "Initiated" and p["amount"] == round(568.96 - 100 - 50, 2) and p["points_to_redeem"] == 50
    assert client.post(f"{API}/checkout/payments", json={"coupon_code": "NOPE"}, headers=h).status_code == 400


def test_card_payment_validation():
    h = _headers()
    pid = client.post(f"{API}/checkout/payments", json={}, headers=h).json()["data"]["id"]
    url = f"{API}/checkout/payments/{pid}/pay"
    assert client.post(url, json={"method": "credit_card"}, headers=h).status_code == 400  # no card
    for bad in ({"number": "1234 5678 9012 3456"}, {"name": "A"}, {"cvv": "12"}, {"expiry": "13/2030"}, {"expiry": "01/2020"}):
        r = client.post(url, json={"method": "debit_card", "card": {**CARD, **bad}}, headers=h)
        assert r.status_code == 400, bad
    assert client.post(url, json={"method": "bitcoin"}, headers=h).status_code == 400
    assert client.post(url, json={"method": "credit_card", "card": CARD}, headers=h).status_code == 200


def test_upi_and_wallet_validation():
    h = _headers()
    pid = client.post(f"{API}/checkout/payments", json={}, headers=h).json()["data"]["id"]
    url = f"{API}/checkout/payments/{pid}/pay"
    assert client.post(url, json={"method": "upi", "upi_id": "not-an-id"}, headers=h).status_code == 400
    assert client.post(url, json={"method": "wallet", "wallet": "Nope"}, headers=h).status_code == 400
    assert client.post(url, json={"method": "wallet", "wallet": "Paytm"}, headers=h).json()["data"]["status"] == "Paid"
    assert client.post(url, json={"method": "upi", "upi_id": "a@b"}, headers=h).status_code == 400  # already paid


def test_declined_card_fails_payment_and_blocks_order():
    h = _headers()
    pid = client.post(f"{API}/checkout/payments", json={}, headers=h).json()["data"]["id"]
    r = client.post(f"{API}/checkout/payments/{pid}/pay", json={"method": "credit_card", "card": {**CARD, "number": "4000000000000002"}}, headers=h)
    assert r.status_code == 402 and "declined" in r.json()["message"]
    assert client.post(f"{API}/checkout/place-order", json=_order_body(pid), headers=h).status_code == 402
    # the customer can retry on the same payment with another card
    assert client.post(f"{API}/checkout/payments/{pid}/pay", json={"method": "credit_card", "card": CARD}, headers=h).status_code == 200


def test_cannot_place_order_without_paying_or_reuse_payment():
    h = _headers()
    pid = client.post(f"{API}/checkout/payments", json={}, headers=h).json()["data"]["id"]
    assert client.post(f"{API}/checkout/place-order", json=_order_body(pid), headers=h).status_code == 402
    assert client.post(f"{API}/checkout/place-order", json=_order_body("pay_unknown"), headers=h).status_code == 404
    paid = _paid(h)
    assert client.post(f"{API}/checkout/place-order", json=_order_body(paid), headers=h).status_code == 201
    CARTS[1] = [{"product_id": 13, "quantity": 1}]
    assert client.post(f"{API}/checkout/place-order", json=_order_body(paid), headers=h).status_code == 400  # already used


def test_payment_is_private_and_amount_must_match_cart():
    h, jane = _headers(), _headers("jane@bookstore.com")
    pid = _paid(h)
    assert client.post(f"{API}/checkout/payments/{pid}/pay", json={"method": "upi", "upi_id": "a@b"}, headers=jane).status_code == 404
    client.put(f"{API}/cart/items/13", json={"quantity": 3}, headers=h)  # cart changes after paying
    r = client.post(f"{API}/checkout/place-order", json=_order_body(pid), headers=h)
    assert r.status_code == 400 and "changed" in r.json()["message"]


def test_recommendations_use_order_history():
    h = _headers()
    recs = client.get(f"{API}/users/me/recommendations", headers=h).json()["data"]
    bought = {3, 5, 8}
    assert recs and all(p["id"] not in bought for p in recs)
    assert {p["category"] for p in recs} <= {"Self-help", "Fiction", "Romance"}
