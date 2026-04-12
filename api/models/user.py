"""Application user stored in Postgres."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import Boolean, DateTime, String, Uuid, func, select
from sqlalchemy.orm import Mapped, Session, mapped_column

from db import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    username: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    # Portable id for sim payloads / exports — not the DB primary key.
    sim_user_id: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    @classmethod
    def get_by_username(cls, db: Session, username: str) -> User | None:
        return db.scalars(select(cls).where(cls.username == username)).first()

    @classmethod
    def get_by_email(cls, db: Session, email: str) -> User | None:
        return db.scalars(select(cls).where(cls.email == email)).first()

    def to_public_dict(self) -> dict[str, Any]:
        """Safe payload for APIs / JWT dependency (no password hash)."""
        return {
            "id": str(self.id),
            "username": self.username,
            "email": self.email,
            "sim_user_id": self.sim_user_id,
            "is_active": self.is_active,
            "is_verified": self.is_verified,
        }
