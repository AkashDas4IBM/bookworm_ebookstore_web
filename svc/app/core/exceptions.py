class AppError(Exception):
    """Business-rule error that the API turns into a JSON error response."""

    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
