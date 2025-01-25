def transform_doc_id(doc):
    if doc and "_id" in doc:
        doc["id"] = doc["_id"]["$oid"]
        del doc["_id"]
    return doc


def stringify_objectid_list(item_list):
    return [item["$oid"] for item in item_list]


def flatten_oid_list(oid_list):
    """
    input: [
      {
        "$oid": "678aa8a012d7d6e1cca848d1"
      }
    ]
    output: ["678aa8a012d7d6e1cca848d1"]
    """
    return [item["$oid"] for item in oid_list]
