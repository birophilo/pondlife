"""SQLAlchemy engine and session for Postgres (users and future relational data)."""

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker
from sqlalchemy.pool import StaticPool

from config import get_database_url


class Base(DeclarativeBase):
    pass


def _engine_kwargs(url: str) -> dict:
    # In-memory SQLite + Starlette TestClient use different threads; StaticPool shares one connection.
    if ":memory:" in url:
        return {
            "connect_args": {"check_same_thread": False},
            "poolclass": StaticPool,
        }
    return {"pool_pre_ping": True}


_url = get_database_url()
engine = create_engine(_url, **_engine_kwargs(_url))
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
