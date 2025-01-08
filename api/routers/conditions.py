import json
from typing import List

from fastapi import APIRouter, Body, Request, Response, HTTPException, status
from fastapi.encoders import jsonable_encoder
from mongo_client import MongoCRUDClient

from schemas import Condition
from utils import transform_doc_id

# https://github.com/mongodb-developer/pymongo-fastapi-crud/blob/main/routes.py

router = APIRouter()


@router.post("/conditions", status_code=status.HTTP_201_CREATED)
async def create_condition(request: Request):

    condition_data = json.loads(await request.body())

    condition = jsonable_encoder(condition_data)
    mongo_client = MongoCRUDClient()
    created_condition = mongo_client.create_document("conditions", condition)
    condition = transform_doc_id(created_condition)
    return condition


@router.get("/conditions")
def list_conditions(request: Request):
    mongo_client = MongoCRUDClient()
    conditions = mongo_client.list_documents("conditions")
    payload = [transform_doc_id(condition) for condition in conditions]
    return payload


@router.get("condition/{id}")
def find_conditions(id: str, request: Request):
    mongo_client = MongoCRUDClient()
    condition = mongo_client.list_documents("conditions", id)
    if condition is not None:
        return condition

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Condition with ID {id} not found")


@router.put("/condition/{id}", response_model=Condition)
async def update_condition(id: str, request: Request):

    condition = json.loads(await request.body())
    condition_id = condition["id"]

    # condition = {k: v for k, v in condition_data.dict().items() if v is not None}

    if len(condition) >= 1:
        mongo_client = MongoCRUDClient()
        update_result = mongo_client.update_document("conditions", condition)

        if update_result.modified_count == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Condition with ID {id} not found")

    item = mongo_client.get_document("conditions", id=condition_id)
    item = transform_doc_id(item)
    if item is not None:
        return item

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Condition with ID {id} not found")


@router.delete("/condition/{id}")
def delete_condition(id: str, request: Request, response: Response):
    mongo_client = MongoCRUDClient()
    delete_result = mongo_client.delete_document("conditions", id)

    if delete_result.deleted_count == 1:
        response.status_code = status.HTTP_204_NO_CONTENT
        return response

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Condition with ID {id} not found")
