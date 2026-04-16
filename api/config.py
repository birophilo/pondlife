"""Runtime configuration from environment (see .env in project root)."""

import os
from pathlib import Path
from urllib.parse import quote_plus

from dotenv import load_dotenv

# Load .env from repo root (parent of api/) or api/.env — same file docker-compose uses.
_api_dir = Path(__file__).resolve().parent
load_dotenv(_api_dir.parent / ".env")
load_dotenv(_api_dir / ".env")

ALGORITHM = "HS256"
# Short-lived JWT for API calls; session length is controlled by refresh tokens.
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "30"))


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
    password = os.getenv("POSTGRES_PASSWORD")
    if not password:
        raise RuntimeError(
            "Database URL is not configured: set DATABASE_URL, or set POSTGRES_PASSWORD "
            "(and matching POSTGRES_USER / POSTGRES_DB) in .env at the project root. "
            "If you use docker-compose, use the same POSTGRES_PASSWORD as in that .env. "
        )
    host = os.getenv("POSTGRES_HOST", "localhost")
    port = os.getenv("POSTGRES_PORT", "5432")
    db = os.getenv("POSTGRES_DB", "pondlife")
    pw = quote_plus(password)
    return f"postgresql+psycopg2://{user}:{pw}@{host}:{port}/{db}"
