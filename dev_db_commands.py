import os
import json
import sys
from bson import ObjectId

from pymongo import MongoClient

from api.database import DATABASE_NAME, DATABASE_URL


DB_URL = "mongodb://admin:password@localhost:27017/?authSource=admin"
DEV_DB_DUMP_DIRECTORY = "dev_db_fixtures"


def populate_dev_db(database: str, from_dir: str):
    client = MongoClient(DB_URL)
    db = client[database]

    # delete current dev db contents
    for collection_name in db.list_collection_names():
        db[collection_name].drop()

    # populate dev db from directory files
    for filename in os.listdir(from_dir):
        if filename.endswith(".json"):
            collection_name = filename.replace(".json", "")
            filepath = os.path.join(from_dir, filename)

            with open(filepath) as f:
                data = json.load(f)
                for doc in data:
                    if "_id" in doc:
                        doc["_id"] = ObjectId(doc["_id"])
                db[collection_name].insert_many(data)
            print(f"Imported {collection_name} to {database}")


def export_dev_db(database: str, to_dir: str):
    client = MongoClient(DATABASE_URL)
    db = client[database]

    if not os.path.exists(to_dir):
        os.makedirs(to_dir)

    for collection_name in db.list_collection_names():
        collection = db[collection_name]
        data = list(collection.find())
        output_file = os.path.join(to_dir, f"{collection_name}.json")

        with open(output_file, "w") as f:
            json.dump(data, f, indent=4, default=str)  # Convert ObjectIds to strings

    print(f"Exported database '{database}' to '{to_dir}'")


def run():
    command = sys.argv[1]
    dir_input = sys.argv[2] if len(sys.argv) > 2 else None
    directory = dir_input or DEV_DB_DUMP_DIRECTORY

    if command == "populate":
        approve = input("This will replace the contents of 'pondlife_db' database. Continue? y/N")
        if approve == "y":
            populate_dev_db(database=DATABASE_NAME, from_dir=directory)

    elif command == "dump":
        export_dev_db(database=DATABASE_NAME, to_dir=directory)


if __name__ == "__main__":
    run()
