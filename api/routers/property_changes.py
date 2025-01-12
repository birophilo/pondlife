import json
from typing import List

from fastapi import APIRouter, Body, Request, Response, HTTPException, status
from fastapi.encoders import jsonable_encoder
from mongo_client import MongoCRUDClient

from schemas import PropertyChange
from utils import transform_doc_id

# https://github.com/mongodb-developer/pymongo-fastapi-crud/blob/main/routes.py

router = APIRouter()


@router.post("/propertyChanges", status_code=status.HTTP_201_CREATED, response_model=PropertyChange)
async def create_property_change(request: Request):

    property_change_data = json.loads(await request.body())

    property_change = jsonable_encoder(property_change_data)
    mongo_client = MongoCRUDClient()
    created_property_change = mongo_client.create_document("property_changes", property_change)
    property_change = transform_doc_id(created_property_change)
    return property_change


@router.get("/propertyChanges", response_model=List[PropertyChange])
def list_property_changes(request: Request):
    mongo_client = MongoCRUDClient()
    property_changes = mongo_client.list_documents("property_changes")
    payload = [transform_doc_id(property_change) for property_change in property_changes]
    return payload


@router.get("/propertyChange/{id}", response_model=PropertyChange)
def get_property_change(id: str, request: Request):
    mongo_client = MongoCRUDClient()
    property_change = mongo_client.get_document("property_changes", id)
    if property_change is not None:
        return transform_doc_id(property_change)

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"PropertyChange with ID {id} not found")


@router.put("/propertyChange/{id}", response_model=PropertyChange)
async def update_property_change(id: str, request: Request):

    property_change = json.loads(await request.body())
    property_change_id = property_change["id"]

    # property_change = {k: v for k, v in property_change_data.dict().items() if v is not None}

    if len(property_change) >= 1:
        mongo_client = MongoCRUDClient()
        update_result = mongo_client.update_document("property_changes", property_change)

        if update_result.modified_count == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Data for ID: {id} already matches saved document")

    item = mongo_client.get_document("property_changes", id=property_change_id)
    item = transform_doc_id(item)
    if item is not None:
        return item

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"PropertyChange with ID {id} not found")


@router.delete("/propertyChange/{id}")
def delete_property_change(id: str, request: Request, response: Response):
    mongo_client = MongoCRUDClient()
    delete_result = mongo_client.delete_document("property_changes", id)

    if delete_result.deleted_count == 1:
        response.status_code = status.HTTP_204_NO_CONTENT
        return response

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"PropertyChange with ID {id} not found")
