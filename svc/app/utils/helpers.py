from datetime import date, timedelta
from typing import Any


def tentative_delivery_date(stock: int, days: int = 5) -> str | None:
    """Products in stock are tagged with a tentative delivery date; out-of-stock ones are not."""
    if stock <= 0:
        return None
    return (date.today() + timedelta(days=days)).isoformat()


def success(data: Any = None, message: str = "OK") -> dict:
    return {"success": True, "message": message, "data": data}


def error(message: str, details: Any = None) -> dict:
    return {"success": False, "message": message, "details": details}
