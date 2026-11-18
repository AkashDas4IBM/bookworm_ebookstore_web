from fastapi import APIRouter, HTTPException, status

from app.core.security import create_access_token
from app.models.schemas import LoginRequest, RegisterRequest, TokenResponse
from app.services import user_service
from app.utils.helpers import success

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest):
    if user_service.get_by_email(payload.email):
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already registered")
    user = user_service.create_user(payload)
    token = TokenResponse(access_token=create_access_token(str(user["id"])), user=user_service.to_user_out(user))
    return success(token, "Registration successful")


@router.post("/login")
def login(payload: LoginRequest):
    user = user_service.authenticate(payload.email, payload.password)
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password")
    token = TokenResponse(access_token=create_access_token(str(user["id"])), user=user_service.to_user_out(user))
    return success(token, "Login successful")
