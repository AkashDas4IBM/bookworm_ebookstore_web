from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "E-Bookstore API"
    api_prefix: str = "/api/v1"
    secret_key: str = "dev-only-secret-change-me-in-production-0123456789"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    cors_origins: list[str] = [
        "http://localhost:4200",
        "http://localhost:4201",
        "http://127.0.0.1:4200",
        "http://127.0.0.1:4201",
    ]

    model_config = SettingsConfigDict(env_file=".env", env_prefix="BOOKSTORE_")


settings = Settings()
