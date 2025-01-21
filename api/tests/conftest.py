import pytest
from pymongo import MongoClient
from fastapi.testclient import TestClient
from main import app
from database import get_database


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

    with TestClient(app) as test_client:
        yield test_client

    # Delete database after tests
    client = MongoClient(TEST_DATABASE_URL)
    client.drop_database(TEST_DATABASE_NAME)
    client.close()
