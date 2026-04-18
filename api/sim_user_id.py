"""Portable sim-facing user ids: short, human-readable (Lichess-style)."""

import secrets
import string

from sqlalchemy import select
from sqlalchemy.orm import Session

from models.user import User

# 52^8 — plenty for dev; DB unique index catches rare collisions.
_ALPHABET = string.ascii_letters
_LENGTH = 8
_MAX_ATTEMPTS = 64


def allocate_sim_user_id(db: Session) -> str:
    """Return a unique 8-letter mixed-case string for sim_user_id."""
    for _ in range(_MAX_ATTEMPTS):
        candidate = "".join(secrets.choice(_ALPHABET) for _ in range(_LENGTH))
        taken = db.scalars(
            select(User.id).where(User.sim_user_id == candidate)
        ).first()
        if taken is None:
            return candidate
    raise RuntimeError("Could not allocate a unique sim_user_id")
