from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt
from passlib.context import CryptContext
from pymongo import MongoClient

from database import get_database
from mongo_client import get_user_by_username, get_user_by_email
from schemas import UserSignup


users_collection_name = "users"

# JWT config
SECRET_KEY = "my_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

router = APIRouter()


def get_password_hash(password: str):
    return pwd_context.hash(password)


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    now = datetime.now(timezone.utc)
    expires = now + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    data["exp"] = expires
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)


@router.post("/signup")
def signup(details: UserSignup, db: MongoClient = Depends(get_database)):

    if get_user_by_username(db, details.username):
        raise HTTPException(status_code=400, detail="Username already registered")
    if get_user_by_email(db, details.email):
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(details.password)
    new_user = {
        "username": details.username,
        "email": details.email,
        "hashed_password": hashed_password
    }
    db[users_collection_name].insert_one(new_user)

    return {"message": "User created successfully"}


@router.post("/login")
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: MongoClient = Depends(get_database)
):
    username, password = form_data.username, form_data.password
    user = get_user_by_username(db, username)
    verified = verify_password(password, user["hashed_password"])
    if not user or not verified:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    access_token = create_access_token(data={"sub": user["username"]})
    return {"user": username, "accessToken": access_token, "tokenType": "bearer"}


@router.post("/logout")
def logout():
    # Frontend needs to discard token
    return {"message": "Logout successful"}


@router.post("/reset-password")
def reset_password(
    email: str,
    new_password: str,
    db: MongoClient = Depends(get_database)
):
    user = get_user_by_email(db, email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user["hashed_password"] = get_password_hash(new_password)

    return {"message": "Password reset successful"}
