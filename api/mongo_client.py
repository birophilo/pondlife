import json
import time
from bson import ObjectId
from bson.json_util import dumps

from database import get_database
from utils import stringify_objectid_list


OBJECT_ID_LIST_FIELDS = {
    # A few documents have fields which are lists of bson ObjectIds. These
    # shoud be converted to strings by the client. This dict specifies
    # which fields of which objects require this conversion, intended
    # as a more lightweight approach than a general-purpose tree-walk
    # through all objects or a 3rd party library. Can be replaced with
    # one of those approaches if it becomes unwieldy.
    "actions": ["propertyChanges"]
}


def stringify_objectid_list_fields(doc: object, collection: str):
    """
    Transforms ObjectId lists into strings, e.g. property change Action:
    {'propertyChanges': [ObjectId('abc123'), ObjectId('def456')]}
    becomes -->
    {'propertyChanges': ['abc123', 'def456']}
    """

    if collection in OBJECT_ID_LIST_FIELDS:
        for field in OBJECT_ID_LIST_FIELDS[collection]:
            if field in doc:
                doc[field] = [str(item) for item in doc[field]]
    return doc


def flatten_object_id(doc):
    if "_id" in doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    return doc


class MongoCRUDClient:

    def __init__(self):
        self.db = get_database()

    def create_document(self, collection: str, item, session=None):

        # timestamps only for scenes for now until update other object schemas
        if item.get("resource") and item.get("resource") == "scene":
            current_time = int(time.time()*1000)
            item["createdAt"] = current_time
            item["lastModified"] = current_time

        new_item = self.db[collection].insert_one(item)
        created_item = self.db[collection].find_one(
            {"_id": ObjectId(new_item.inserted_id)}
        )

        created_item = flatten_object_id(created_item)
        created_item = stringify_objectid_list_fields(created_item, collection)

        return created_item

    def get_document(self, collection: str, id: str):
        item = self.db[collection].find_one({"_id": ObjectId(id)})
        item = flatten_object_id(item)
        item = stringify_objectid_list_fields(item, collection)

        return item

    def list_documents(self, collection: str):
        items = self.db[collection].find()
        items = [flatten_object_id(item) for item in items]
        items = [stringify_objectid_list_fields(item, collection) for item in items]
        return items

    def get_documents_from_ids(self, collection: str, ids: list):
        object_ids = [ObjectId(id) for id in ids]
        items = self.db[collection].find({"_id": {"$in": object_ids}})
        items = [flatten_object_id(item) for item in items]
        items = [stringify_objectid_list_fields(item, collection) for item in items]
        return json.loads(dumps(list(items)))

    def delete_document(self, collection: str, id: str):
        delete_result = self.db[collection].delete_one({"_id": ObjectId(id)})
        return delete_result

    def update_document(self, collection: str, item):
        object_id = ObjectId(item["id"])
        item.pop("id", None)
        update_result = self.db[collection].replace_one({"_id": object_id}, item)
        return update_result
