import json
from bson import ObjectId
from bson.json_util import dumps
from pymongo import MongoClient


# secrets not needed yet
# USERNAME = os.getenv('PONDLIFE_MONGODB_USERNAME')
# PASSWORD = os.getenv('PONDLIFE_MONGODB_PASSWORD')
# HOST = os.getenv('PONDLIFE_MONGODB_HOST')
# PORT = os.getenv('PONDLIFE_MONGODB_PORT')


class MongoCRUDClient:

    def __init__(self):
        db_path = "mongodb://admin:password@localhost:27017/?authSource=admin"
        self.client = MongoClient(db_path)

    def get_document(self, collection: str, id: str):
        item = self.client.pondlife_db[collection].find_one({"_id": ObjectId(id)})
        return json.loads(dumps(item))

    def list_documents(self, collection: str):
        items = self.client.pondlife_db[collection].find()
        return json.loads(dumps(list(items)))

    def get_documents_from_ids(self, collection: str, ids: list):
        object_ids = [ObjectId(id) for id in ids]
        items = self.client.pondlife_db[collection].find({"_id": {"$in": object_ids} })
        return json.loads(dumps(list(items)))

    def create_document(self, collection: str, item):
        new_item = self.client.pondlife_db[collection].insert_one(item)
        created_item = self.client.pondlife_db[collection].find_one(
            {"_id": ObjectId(new_item.inserted_id)}
        )
        return json.loads(dumps(created_item))

    def delete_document(self, collection: str, id: str):
        delete_result = self.client.pondlife_db[collection].delete_one({"_id": ObjectId(id)})
        return delete_result

    def update_document(self, collection: str, item):
        item_id = item["_id"]["$oid"]
        del item["_id"]
        update_result = self.client.pondlife_db[collection].update_one(
            {"_id": ObjectId(item_id)},
            {"$set": item}
        )
        return update_result
