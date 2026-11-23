import logging

from app.core.exceptions import AppError
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.utils.helpers import error

logger = logging.getLogger("bookstore.error")


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def app_exc(_: Request, exc: AppError):
        return JSONResponse(error(exc.message), status_code=exc.status_code)

    @app.exception_handler(StarletteHTTPException)
    async def http_exc(_: Request, exc: StarletteHTTPException):
        return JSONResponse(error(str(exc.detail)), status_code=exc.status_code)

    @app.exception_handler(RequestValidationError)
    async def validation_exc(_: Request, exc: RequestValidationError):
        details = [{"field": ".".join(str(x) for x in e["loc"][1:]), "message": e["msg"]} for e in exc.errors()]
        return JSONResponse(error("Validation failed", details), status_code=422)

    @app.exception_handler(Exception)
    async def unhandled_exc(_: Request, exc: Exception):
        logger.exception("Unhandled error", exc_info=exc)
        return JSONResponse(error("Internal server error"), status_code=500)
