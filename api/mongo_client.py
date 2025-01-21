import json
from bson import ObjectId
from bson.json_util import dumps

from database import DATABASE_NAME, get_database


class MongoCRUDClient:

    def __init__(self):
        self.db = get_database()

    def create_document(self, collection: str, item, session=None):
        new_item = self.db[collection].insert_one(item)
        created_item = self.client[DATABASE_NAME][collection].find_one(
            {"_id": ObjectId(new_item.inserted_id)}
        )
        return json.loads(dumps(created_item))

    def get_document(self, collection: str, id: str):
        item = self.db[collection].find_one({"_id": ObjectId(id)})
        return json.loads(dumps(item))

    def list_documents(self, collection: str):
        items = self.db[collection].find()
        return json.loads(dumps(list(items)))

    def get_documents_from_ids(self, collection: str, ids: list):
        object_ids = [ObjectId(id) for id in ids]
        items = self.db[collection].find({"_id": {"$in": object_ids}})
        return json.loads(dumps(list(items)))

    def delete_document(self, collection: str, id: str):
        delete_result = self.db[collection].delete_one({"_id": ObjectId(id)})
        return delete_result

    def update_document(self, collection: str, item):
        object_id = ObjectId(item["id"])
        item.pop("id", None)
        update_result = self.db[collection].update_one(
            {"_id": object_id},
            {"$set": item}
        )
        return update_result
