"""Runtime configuration from environment (see .env in project root)."""

import os
from urllib.parse import quote_plus

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


def get_jwt_secret() -> str:
    key = os.getenv("JWT_SECRET_KEY")
    if not key:
        raise RuntimeError(
            "JWT_SECRET_KEY is not set. Add it to your .env file (e.g. a long random string)."
        )
    return key


def get_database_url() -> str:
    """Postgres URL for SQLAlchemy (sync). Prefer DATABASE_URL if set."""
    explicit = os.getenv("DATABASE_URL")
    if explicit:
        return explicit
    user = os.getenv("POSTGRES_USER", "pondlife")
    password = os.getenv("POSTGRES_PASSWORD") or ""
    host = os.getenv("POSTGRES_HOST", "localhost")
    port = os.getenv("POSTGRES_PORT", "5432")
    db = os.getenv("POSTGRES_DB", "pondlife")
    pw = quote_plus(password)
    return f"postgresql+psycopg2://{user}:{pw}@{host}:{port}/{db}"
