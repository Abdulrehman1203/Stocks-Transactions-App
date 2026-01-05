import os
from pydantic_settings import BaseSettings


ENV_PATH = os.path.join(os.path.dirname(__file__), ".env")

class Settings(BaseSettings):
    # Database configuration
    DB_USER: str = "postgres"
    DB_PASSWORD: str = "password"
    DB_HOST: str = "localhost"
    DB_PORT: str = "5432"
    DB_NAME: str = "stocks_db"
    
    # Secret Key for JWT
    SECRET_KEY: str = "your-secret-key-keep-it-secret"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Default to PostgreSQL, fallback to SQLite if needed
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/stocks_db"

    @property
    def SQLALCHEMY_DATABASE_URL(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    class Config:
        env_file = ".env"


settings = Settings()
