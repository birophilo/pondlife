from __future__ import annotations

import json

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.encoders import jsonable_encoder
from pymongo.errors import PyMongoError

from crud_factory import MongoCrudConfig, get_mongo_crud, register_mongo_crud
from mongo_client import MongoCRUDClient
from schemas import PropertyChange

router = APIRouter()

register_mongo_crud(
    router,
    MongoCrudConfig(
        collection="property_changes",
        resource_name="PropertyChange",
        path_collection="/propertyChanges",
        path_item="/propertyChange",
        response_item_model=PropertyChange,
        endpoints=frozenset({"list", "get", "update"}),
    ),
)


@router.post(
    "/propertyChanges",
    status_code=status.HTTP_201_CREATED,
    response_model=PropertyChange,
)
async def create_property_change(
    request: Request, mongo: MongoCRUDClient = Depends(get_mongo_crud)
) -> PropertyChange:
    request_body = json.loads(await request.body())
    action_id = request_body["actionId"]
    property_change = jsonable_encoder(request_body)

    try:
        created_item = mongo.create_document("property_changes", property_change)
        mongo.db.actions.update_one(
            {"_id": ObjectId(action_id)},
            {"$push": {"propertyChanges": ObjectId(created_item["id"])}},
        )
        return created_item
    except PyMongoError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"{e}"
        ) from e


@router.delete("/propertyChange/{id}")
def delete_property_change(
    id: str,
    response: Response,
    mongo: MongoCRUDClient = Depends(get_mongo_crud),
) -> Response:
    property_change = mongo.get_document("property_changes", id)
    if property_change is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"PropertyChange with ID {id} not found",
        )
    action_id = property_change["actionId"]

    try:
        delete_result = mongo.delete_document("property_changes", id)
        mongo.db.actions.update_one(
            {"_id": ObjectId(action_id)},
            {"$pull": {"propertyChanges": ObjectId(id)}},
        )
    except PyMongoError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"{e}"
        ) from e

    if delete_result.deleted_count == 1:
        response.status_code = status.HTTP_204_NO_CONTENT
        return response

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"PropertyChange with ID {id} not found",
    )
