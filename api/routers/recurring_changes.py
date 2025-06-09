import json
from typing import List

from fastapi import APIRouter, Request, Response, HTTPException, status
from fastapi.encoders import jsonable_encoder

from mongo_client import MongoCRUDClient
from schemas import RecurringChange

# https://github.com/mongodb-developer/pymongo-fastapi-crud/blob/main/routes.py

router = APIRouter()


@router.post(
    "/recurringChanges",
    status_code=status.HTTP_201_CREATED,
    response_model=RecurringChange
)
async def create_recurring_change(request: Request):

    recurring_change_data = json.loads(await request.body())

    recurring_change = jsonable_encoder(recurring_change_data)
    mongo_client = MongoCRUDClient()
    created_recurring_change = mongo_client.create_document("recurring_changes", recurring_change)
    return created_recurring_change


@router.get("/recurringChanges", response_model=List[RecurringChange])
def list_recurring_changes():
    mongo_client = MongoCRUDClient()
    recurring_changes = mongo_client.list_documents("recurring_changes")
    return recurring_changes


@router.get("/recurringChange/{id}", response_model=RecurringChange)
def get_recurring_change(id: str):
    mongo_client = MongoCRUDClient()
    recurring_change = mongo_client.get_document("recurring_changes", id)
    if recurring_change is not None:
        return recurring_change

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"RecurringChange with ID {id} not found")


@router.put("/recurringChange/{id}", response_model=RecurringChange)
async def update_recurring_change(id: str, request: Request):

    recurring_change = json.loads(await request.body())
    recurring_change_id = recurring_change["id"]

    # recurring_change = {k: v for k, v in recurring_change_data.dict().items() if v is not None}

    if len(recurring_change) >= 1:
        mongo_client = MongoCRUDClient()
        try:
            mongo_client.update_document("recurring_changes", recurring_change)
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error updating {id}: {e}")

    item = mongo_client.get_document("recurring_changes", id=recurring_change_id)
    if item is not None:
        return item

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"RecurringChange with ID {id} not found")


@router.delete("/recurringChange/{id}")
def delete_recurring_change(id: str, response: Response):
    mongo_client = MongoCRUDClient()
    delete_result = mongo_client.delete_document("recurring_changes", id)

    if delete_result.deleted_count == 1:
        response.status_code = status.HTTP_204_NO_CONTENT
        return response

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"RecurringChange with ID {id} not found")
