from pydantic_settings import BaseSettings
import secrets


class Settings(BaseSettings):
    APP_NAME: str = "TellEye API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    DATABASE_URL: str = "postgresql://postgres:123@localhost:5432/telleye_db"

    SECRET_KEY: str = secrets.token_urlsafe(32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    ADMIN_EMAIL:     str = "admin@telleye.dz"
    ADMIN_PASSWORD:  str = "TellEye@2026!"
    ADMIN_FULL_NAME: str = "Admin TellEye"

    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://localhost:3000",
    ]

    STORAGE_DIR: str = "./storage"

    # Chargily Pay
    CHARGILY_API_KEY: str = "test_sk_Dcya8aSOHYd6LKcDdwNbDc1AdmoISUJD9IWcdLOJ"
    FRONTEND_URL:     str = "http://localhost:5173"

    class Config:
        env_file = ".env"


settings = Settings()