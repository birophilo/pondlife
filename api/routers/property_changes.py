import json
from bson import ObjectId
from typing import List

from fastapi import APIRouter, Request, Response, HTTPException, status
from fastapi.encoders import jsonable_encoder
from pymongo.errors import PyMongoError

from mongo_client import MongoCRUDClient
from schemas import PropertyChange

# https://github.com/mongodb-developer/pymongo-fastapi-crud/blob/main/routes.py

router = APIRouter()


@router.post("/propertyChanges", status_code=status.HTTP_201_CREATED, response_model=PropertyChange)
async def create_property_change(request: Request):

    request_body = json.loads(await request.body())
    property_change_data = request_body
    action_id = request_body["actionId"]
    property_change = jsonable_encoder(property_change_data)
    mongo_client = MongoCRUDClient()

    # session = mongo_client.client.start_session()
    # session.start_transaction()

    try:
        created_item = mongo_client.create_document("property_changes", property_change)

        action_collection = mongo_client.db.actions
        action_collection.update_one(
            {"_id": ObjectId(action_id)},
            {"$push": {"propertyChanges": ObjectId(created_item["id"])}},
            # session=session
        )

        # session.commit_transaction()
        return created_item

    except PyMongoError as e:
        # session.abort_transaction()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR , detail=f"{e}")

    finally:
        # session.end_session()
        pass


@router.get("/propertyChanges", response_model=List[PropertyChange])
def list_property_changes():
    mongo_client = MongoCRUDClient()
    property_changes = mongo_client.list_documents("property_changes")
    return property_changes


@router.get("/propertyChange/{id}", response_model=PropertyChange)
def get_property_change(id: str):
    mongo_client = MongoCRUDClient()
    property_change = mongo_client.get_document("property_changes", id)
    if property_change is not None:
        return property_change

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"PropertyChange with ID {id} not found")


@router.put("/propertyChange/{id}", response_model=PropertyChange)
async def update_property_change(id: str, request: Request):

    property_change = json.loads(await request.body())
    property_change_id = property_change["id"]

    # property_change = {k: v for k, v in property_change_data.dict().items() if v is not None}

    if len(property_change) >= 1:
        mongo_client = MongoCRUDClient()
        try:
            mongo_client.update_document("property_changes", property_change)
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error updating {id}: {e}")

    item = mongo_client.get_document("property_changes", id=property_change_id)
    if item is not None:
        return item

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"PropertyChange with ID {id} not found")


@router.delete("/propertyChange/{id}")
def delete_property_change(id: str, response: Response):
    mongo_client = MongoCRUDClient()
    property_change = mongo_client.get_document("property_changes", id)
    action_id = property_change["actionId"]

    try:
        delete_result = mongo_client.delete_document("property_changes", id)

        # session = mongo_client.client.start_session()
        # session.start_transaction()

        action_collection = mongo_client.db.actions
        action_collection.update_one(
            {"_id": ObjectId(action_id)},
            {"$pull": {"propertyChanges": ObjectId(id)}},
            # session=session
        )

    except PyMongoError as e:
        # session.abort_transaction()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR , detail=f"{e}")

    finally:
        # session.end_session()
        pass

    if delete_result.deleted_count == 1:
        response.status_code = status.HTTP_204_NO_CONTENT
        return response

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"PropertyChange with ID {id} not found")
