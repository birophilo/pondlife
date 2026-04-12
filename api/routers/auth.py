import uuid
from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from config import ACCESS_TOKEN_EXPIRE_MINUTES, ALGORITHM, get_jwt_secret
from db import get_db
from models.user import User
from schemas import ResetPasswordBody, UserSignup


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter()


def get_password_hash(password: str):
    return pwd_context.hash(password)


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    now = datetime.now(timezone.utc)
    expires = now + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    data["exp"] = expires
    return jwt.encode(data, get_jwt_secret(), algorithm=ALGORITHM)


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
    return {
        "user": user.username,
        "accessToken": access_token,
        "tokenType": "bearer",
        "simUserId": user.sim_user_id,
        "userId": str(user.id),
    }


@router.post("/logout")
def logout():
    # Frontend discards token; no server-side session store for JWT.
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
