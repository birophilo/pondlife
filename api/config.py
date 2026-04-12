"""Runtime configuration from environment (see .env in project root)."""

import os

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


def get_jwt_secret() -> str:
    key = os.getenv("JWT_SECRET_KEY")
    if not key:
        raise RuntimeError(
            "JWT_SECRET_KEY is not set. Add it to your .env file (e.g. a long random string)."
        )
    return key
