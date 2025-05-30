import json
from typing import List

from fastapi import APIRouter, Request, Response, HTTPException, status
from fastapi.encoders import jsonable_encoder

from mongo_client import MongoCRUDClient
from schemas import Condition

# https://github.com/mongodb-developer/pymongo-fastapi-crud/blob/main/routes.py

router = APIRouter()


@router.post(
    "/conditions",
    status_code=status.HTTP_201_CREATED,
    response_model=Condition
)
async def create_condition(request: Request):

    condition_data = json.loads(await request.body())

    condition = jsonable_encoder(condition_data)
    mongo_client = MongoCRUDClient()
    created_condition = mongo_client.create_document("conditions", condition)
    return created_condition


@router.get("/conditions", response_model=List[Condition])
def list_conditions():
    mongo_client = MongoCRUDClient()
    conditions = mongo_client.list_documents("conditions")
    return conditions


@router.get("/condition/{id}", response_model=Condition)
def get_condition(id: str):
    mongo_client = MongoCRUDClient()
    condition = mongo_client.get_document("conditions", id)
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
        try:
            mongo_client.update_document("conditions", condition)
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error updating {id}: {e}")

    item = mongo_client.get_document("conditions", id=condition_id)
    if item is not None:
        return item

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Condition with ID {id} not found")


@router.delete("/condition/{id}")
def delete_condition(id: str, response: Response):
    mongo_client = MongoCRUDClient()
    delete_result = mongo_client.delete_document("conditions", id)

    if delete_result.deleted_count == 1:
        response.status_code = status.HTTP_204_NO_CONTENT
        return response

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Condition with ID {id} not found")
