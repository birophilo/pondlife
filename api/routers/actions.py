import json
from typing import List

from fastapi import APIRouter, Body, Request, Response, HTTPException, status
from fastapi.encoders import jsonable_encoder
from mongo_client import MongoCRUDClient

from schemas import AgentType
from utils import transform_doc_id, flatten_oid_list

# https://github.com/mongodb-developer/pymongo-fastapi-crud/blob/main/routes.py

router = APIRouter()


@router.post("/actions", status_code=status.HTTP_201_CREATED)
async def create_action(request: Request):

    action_data = json.loads(await request.body())

    action = jsonable_encoder(action_data)
    mongo_client = MongoCRUDClient()
    created_action = mongo_client.create_document("actions", action)
    action = transform_doc_id(created_action)
    return action


@router.get("/actions")
def list_actions(request: Request):
    mongo_client = MongoCRUDClient()
    actions = mongo_client.list_documents("actions")
    print(actions)
    payload = [transform_doc_id(action) for action in actions]
    for action in payload:
        if action.get("propertyChanges"):
            action["propertyChanges"] = flatten_oid_list(action["propertyChanges"])
    return payload


@router.get("/action/{id}")
def get_action(id: str, request: Request):
    mongo_client = MongoCRUDClient()
    action = mongo_client.get_document("actions", id)
    if action is not None:
        if action.get("propertyChanges"):
            action["propertyChanges"] = flatten_oid_list(action["propertyChanges"])
        return transform_doc_id(action)

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Action with ID {id} not found")


@router.put("/action/{id}")
async def update_action(id: str, request: Request):

    action = json.loads(await request.body())
    action_id = action["id"]

    # action = {k: v for k, v in action_data.dict().items() if v is not None}

    if len(action) >= 1:
        mongo_client = MongoCRUDClient()
        update_result = mongo_client.update_document("actions", action)

        if update_result.modified_count == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Data for ID: {id} already matches saved document")

    item = mongo_client.get_document("actions", id=action_id)
    item = transform_doc_id(item)
    if item is not None:
        return item

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Action with ID {id} not found")


@router.delete("/action/{id}")
def delete_action(id: str, request: Request, response: Response):
    mongo_client = MongoCRUDClient()

    action = mongo_client.get_document("actions", id=id)

    for property_change_id in action["propertyChanges"]:
        mongo_client.delete_document("property_changes", property_change_id)

    delete_result = mongo_client.delete_document("actions", id)

    if delete_result.deleted_count == 1:
        response.status_code = status.HTTP_204_NO_CONTENT
        return response

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Action with ID {id} not found")
