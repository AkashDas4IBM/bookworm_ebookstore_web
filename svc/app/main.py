import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.controllers import (
    auth_controller,
    author_controller,
    cart_controller,
    checkout_controller,
    order_controller,
    product_controller,
    user_controller,
    wishlist_controller,
)
from app.core.config import settings
from app.middleware.error_handlers import register_error_handlers
from app.middleware.logging import RequestLoggingMiddleware

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")

app = FastAPI(title=settings.app_name, version="1.0.0")

app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
register_error_handlers(app)

for r in (
    auth_controller.router,
    product_controller.router,
    user_controller.router,
    cart_controller.router,
    checkout_controller.router,
    order_controller.router,
    wishlist_controller.router,
    author_controller.router,
):
    app.include_router(r, prefix=settings.api_prefix)


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}
