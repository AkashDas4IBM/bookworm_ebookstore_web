from app.core.security import hash_password, verify_password
from app.data.mock_data import ORDERS, USERS
from app.models.schemas import RegisterRequest, UserOut


def to_user_out(user: dict) -> UserOut:
    return UserOut(**{k: v for k, v in user.items() if k != "password_hash"})


def get_by_email(email: str) -> dict | None:
    return next((u for u in USERS if u["email"].lower() == email.lower()), None)


def get_by_id(user_id: int) -> dict | None:
    return next((u for u in USERS if u["id"] == user_id), None)


def create_user(data: RegisterRequest) -> dict:
    user = {
        "id": max(u["id"] for u in USERS) + 1,
        "first_name": data.first_name,
        "last_name": data.last_name,
        "email": data.email,
        "phone": data.phone,
        "password_hash": hash_password(data.password),
        "gift_points": 100,  # welcome points
        "addresses": [],
    }
    USERS.append(user)
    return user


def authenticate(email: str, password: str) -> dict | None:
    user = get_by_email(email)
    if user and verify_password(password, user["password_hash"]):
        return user
    return None


def get_orders(user_id: int) -> list[dict]:
    return [o for o in ORDERS if o["user_id"] == user_id]
