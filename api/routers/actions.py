import json
from typing import List

from fastapi import APIRouter, Body, Request, Response, HTTPException, status
from fastapi.encoders import jsonable_encoder
from mongo_client import MongoCRUDClient


# https://github.com/mongodb-developer/pymongo-fastapi-crud/blob/main/routes.py

router = APIRouter()


@router.post("/actions", status_code=status.HTTP_201_CREATED)
async def create_action(request: Request):

    action_data = json.loads(await request.body())

    action = jsonable_encoder(action_data)
    mongo_client = MongoCRUDClient()
    created_action = mongo_client.create_document("actions", action)
    return created_action


@router.get("/actions")
def list_actions(request: Request):
    mongo_client = MongoCRUDClient()
    actions = mongo_client.list_documents("actions")
    return actions


@router.get("/action/{id}")
def get_action(id: str, request: Request):
    mongo_client = MongoCRUDClient()
    action = mongo_client.get_document("actions", id)
    if action is not None:
        return action

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Action with ID {id} not found")


@router.put("/action/{id}")
async def update_action(id: str, request: Request):

    action = json.loads(await request.body())
    action_id = action["id"]

    if len(action) >= 1:
        mongo_client = MongoCRUDClient()
        update_result = mongo_client.update_document("actions", action)

        if update_result.modified_count == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Data for ID: {id} already matches saved document")

    item = mongo_client.get_document("actions", id=action_id)
    if item is not None:
        return item

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Action with ID {id} not found")


@router.delete("/action/{id}")
def delete_action(id: str, request: Request, response: Response):
    mongo_client = MongoCRUDClient()

    action = mongo_client.get_document("actions", id=id)

    for property_change_id in action.get("propertyChanges", []):
        mongo_client.delete_document("property_changes", property_change_id)

    delete_result = mongo_client.delete_document("actions", id)

    if delete_result.deleted_count == 1:
        response.status_code = status.HTTP_204_NO_CONTENT
        return response

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Action with ID {id} not found")
