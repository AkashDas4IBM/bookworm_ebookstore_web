# E-Bookstore API (FastAPI)

```powershell
cd svc
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
pytest
```

Swagger UI: http://localhost:8000/docs

Demo login: `demo@bookstore.com` / `Password@123`

## Endpoints (prefix `/api/v1`)
| Method | Path | Auth |
|---|---|---|
| POST | `/auth/register`, `/auth/login` | No |
| GET | `/categories`, `/brands?category=`, `/products?category=&brand=&genre_group=&search=` | No |
| GET | `/products/{id}`, `/products/{id}/related`, `/products/{id}/reviews` | No |
| POST | `/products/{id}/reviews` | No |
| GET | `/meta/form-options` (country codes, countries, states), `/checkout/payment-methods` | No |
| GET | `/users/me`, `/users/me/addresses`, `/users/me/orders`, `/users/me/recommendations` | Bearer JWT |
| GET | `/cart` | Bearer JWT |
| POST | `/cart/items` `{product_id, quantity}` | Bearer JWT |
| PUT / DELETE | `/cart/items/{product_id}` (`{quantity}`; 0 removes) | Bearer JWT |
| GET | `/checkout/coupons` | Bearer JWT |
| POST | `/checkout/summary` `{coupon_code, points_to_redeem}` | Bearer JWT |
| POST | `/checkout/payments` `{coupon_code, points_to_redeem}` (step 1: opens a payment for the payable amount) | Bearer JWT |
| POST | `/checkout/payments/{id}/pay` `{method, card \| upi_id \| wallet}` (step 2: pays) | Bearer JWT |
| POST | `/checkout/place-order` `{address, payment_id}` (needs a `Paid` payment) | Bearer JWT |
| GET | `/orders`, `/orders/buy-again`, `/orders/{id}` | Bearer JWT |
| POST | `/orders/{id}/cancel` (within 48 hrs), `/orders/{id}/reorder` (Buy Again) | Bearer JWT |
| GET / POST | `/wishlist`, `/wishlist` `{product_id}` | Bearer JWT |
| DELETE | `/wishlist/{product_id}` | Bearer JWT |
| GET | `/writers` (`?search=`), `/writers/me` (followed), `/writers/{id}` (with their books) | Bearer JWT |
| POST / DELETE | `/writers/{id}/follow` (add to / remove from My Writers) | Bearer JWT |


Payment options: `credit_card`, `debit_card`, `upi`, `wallet` (Paytm, PhonePe, Amazon Pay). The gateway is a mock: cards must pass a Luhn check and have a future MM/YYYY expiry, UPI IDs look like `name@bank`, and test card `4000 0000 0000 0002` is always declined (HTTP 402). Card details are validated but never stored or logged.


Pricing: 12% tax; delivery free from ₹300 else ₹40; 1 gift point = ₹1; coupons `WELCOME100` (₹100 off above ₹300), `READ10` (10%, max ₹150, above ₹200); 1 point earned per ₹100 paid.

All responses use `{ success, message, data }` (errors: `{ success: false, message, details }`).
Config via env vars prefixed `BOOKSTORE_` (e.g. `BOOKSTORE_SECRET_KEY`, `BOOKSTORE_CORS_ORIGINS`).
