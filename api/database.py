from pymongo import MongoClient


# secrets not needed yet
# USERNAME = os.getenv('PONDLIFE_MONGODB_USERNAME')
# PASSWORD = os.getenv('PONDLIFE_MONGODB_PASSWORD')
# HOST = os.getenv('PONDLIFE_MONGODB_HOST')
# PORT = os.getenv('PONDLIFE_MONGODB_PORT')


DATABASE_URL = "mongodb://admin:password@localhost:27017/?authSource=admin"
DATABASE_NAME = "pondlife_db"


def get_database():
    client = MongoClient(DATABASE_URL)
    db = client[DATABASE_NAME]
    return db
