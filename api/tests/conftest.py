import os
import uuid

# Required before importing the app (JWT secret, DB URL — engine binds at import).
os.environ.setdefault(
    "JWT_SECRET_KEY", "test-jwt-secret-for-local-pytest-only-not-for-production"
)
os.environ.setdefault("DATABASE_URL", "sqlite+pysqlite:///:memory:")

import pytest
from pymongo import MongoClient
from fastapi.testclient import TestClient

from database import get_database
from deps import get_current_user
from main import app


def override_get_current_user():
    """Bypass JWT in tests; protected routes behave as if a user is logged in."""
    return {
        "id": str(uuid.uuid4()),
        "username": "pytest_user",
        "email": "pytest@example.com",
        "sim_user_id": "sim-pytest-user",
        "is_active": True,
        "is_verified": False,
    }


# currently same as live DB
TEST_DATABASE_URL = "mongodb://admin:password@localhost:27017/?authSource=admin"
TEST_DATABASE_NAME = "test_pondlife_db"


def override_get_database():
    client = MongoClient(TEST_DATABASE_URL)
    db = client[TEST_DATABASE_NAME]
    return db


@pytest.fixture(scope="module")
def test_app():

    app.dependency_overrides[get_database] = override_get_database
    app.dependency_overrides[get_current_user] = override_get_current_user

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()

    # Delete database after tests
    client = MongoClient(TEST_DATABASE_URL)
    # client.drop_database(TEST_DATABASE_NAME)
    client.close()
