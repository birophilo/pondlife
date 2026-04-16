import hashlib
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Body, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.orm import Session

from config import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    ALGORITHM,
    REFRESH_TOKEN_EXPIRE_DAYS,
    get_jwt_secret,
)
from db import get_db
from models.refresh_token import RefreshToken
from models.user import User
from schemas import LogoutBody, RefreshTokenBody, ResetPasswordBody, UserSignup


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter()


def get_password_hash(password: str):
    return pwd_context.hash(password)


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def _hash_refresh_token(raw: str) -> str:
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    now = datetime.now(timezone.utc)
    expires = now + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    data["exp"] = expires
    data["typ"] = "access"
    return jwt.encode(data, get_jwt_secret(), algorithm=ALGORITHM)


def issue_refresh_token(db: Session, user: User) -> str:
    """Create a new refresh row; caller must commit."""
    raw = secrets.token_urlsafe(48)
    row = RefreshToken(
        user_id=user.id,
        token_hash=_hash_refresh_token(raw),
        expires_at=datetime.now(timezone.utc)
        + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
    )
    db.add(row)
    return raw


def _auth_payload(user: User, access_token: str, refresh_raw: str) -> dict:
    return {
        "user": user.username,
        "accessToken": access_token,
        "refreshToken": refresh_raw,
        "tokenType": "bearer",
        "simUserId": user.sim_user_id,
        "userId": str(user.id),
    }


@router.post("/signup")
def signup(details: UserSignup, db: Session = Depends(get_db)):

    if User.get_by_username(db, details.username):
        raise HTTPException(status_code=400, detail="Username already registered")
    if User.get_by_email(db, details.email):
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(details.password)
    user = User(
        username=details.username,
        email=details.email,
        hashed_password=hashed_password,
        sim_user_id=str(uuid.uuid4()),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {"message": "User created successfully"}


@router.post("/login")
def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_db),
):
    username, password = form_data.username, form_data.password
    user = User.get_by_username(db, username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    if not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    access_token = create_access_token(data={"sub": user.username})
    refresh_raw = issue_refresh_token(db, user)
    db.commit()
    return _auth_payload(user, access_token, refresh_raw)


@router.post("/refresh")
def refresh_tokens(body: RefreshTokenBody, db: Session = Depends(get_db)):
    """Rotate refresh token and issue a new access token. Revokes the presented refresh token."""
    h = _hash_refresh_token(body.refresh_token)
    row = db.scalars(
        select(RefreshToken).where(
            RefreshToken.token_hash == h,
            RefreshToken.revoked_at.is_(None),
        )
    ).first()
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )
    if row.expires_at <= datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )
    user = db.get(User, row.user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )
    row.revoked_at = datetime.now(timezone.utc)
    db.add(row)
    access_token = create_access_token(data={"sub": user.username})
    new_refresh_raw = issue_refresh_token(db, user)
    db.commit()
    db.refresh(user)
    return _auth_payload(user, access_token, new_refresh_raw)


@router.post("/logout")
def logout(
    db: Session = Depends(get_db),
    body: LogoutBody = Body(default_factory=LogoutBody),
):
    """Client should discard tokens; optionally revoke server-side refresh token."""
    if body.refresh_token:
        h = _hash_refresh_token(body.refresh_token)
        row = db.scalars(
            select(RefreshToken).where(
                RefreshToken.token_hash == h,
                RefreshToken.revoked_at.is_(None),
            )
        ).first()
        if row:
            row.revoked_at = datetime.now(timezone.utc)
            db.add(row)
            db.commit()
    return {"message": "Logout successful"}


@router.post("/reset-password")
def reset_password(
    body: ResetPasswordBody,
    db: Session = Depends(get_db),
):
    user = User.get_by_email(db, body.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    hashed = get_password_hash(body.new_password)
    user.hashed_password = hashed
    db.add(user)
    db.commit()
    return {"message": "Password reset successful"}
