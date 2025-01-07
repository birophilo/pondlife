import json
from typing import List

from fastapi import APIRouter, Body, Request, Response, HTTPException, status
from fastapi.encoders import jsonable_encoder
from mongo_client import MongoCRUDClient

# from models import Condition, ConditionUpdate

router = APIRouter()


@router.post("/conditions", status_code=status.HTTP_201_CREATED)
async def create_condition(request: Request):

    condition_data = json.loads(await request.body())

    condition = jsonable_encoder(condition_data)
    mongo_client = MongoCRUDClient()
    created_condition = mongo_client.create_document("conditions", condition)
    return created_condition


# @router.get("/", response_description="List all books", response_model=List[Book])
# def list_books(request: Request):
#     books = list(request.app.database["books"].find(limit=100))
#     return books


# @router.get("/{id}", response_description="Get a single book by id", response_model=Book)
# def find_book(id: str, request: Request):
#     if (book := request.app.database["books"].find_one({"_id": id})) is not None:
#         return book

#     raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Book with ID {id} not found")


@router.put("/condition/{id}")
async def update_condition(id: str, request: Request):

    condition = json.loads(await request.body())
    condition_id = condition["_id"]["$oid"]

    # condition = {k: v for k, v in condition_data.dict().items() if v is not None}

    if len(condition) >= 1:
        mongo_client = MongoCRUDClient()
        update_result = mongo_client.update_document("conditions", condition)

        if update_result.modified_count == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Book with ID {id} not found")

    item = mongo_client.get_document("conditions", id=condition_id)
    if item is not None:
        return item

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Book with ID {id} not found")


@router.delete("/condition/{id}")
def delete_condition(id: str, request: Request, response: Response):
    mongo_client = MongoCRUDClient()
    delete_result = mongo_client.delete_document("conditions", id)

    if delete_result.deleted_count == 1:
        response.status_code = status.HTTP_204_NO_CONTENT
        return response

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Book with ID {id} not found")
