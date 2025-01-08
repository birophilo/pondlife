def transform_doc_id(doc):
    if doc and "_id" in doc:
        doc["id"] = doc["_id"]["$oid"]
        del doc["_id"]
    return doc
