import json
from typing import List

from fastapi import APIRouter, Request, Response, HTTPException, status
from fastapi.encoders import jsonable_encoder

from mongo_client import MongoCRUDClient
from schemas import ActionSequence

# https://github.com/mongodb-developer/pymongo-fastapi-crud/blob/main/routes.py

router = APIRouter()


@router.post(
    "/actionSequences",
    status_code=status.HTTP_201_CREATED,
    response_model=ActionSequence
)
async def create_action_sequence(request: Request):

    action_sequence_data = json.loads(await request.body())

    action_sequence = jsonable_encoder(action_sequence_data)
    mongo_client = MongoCRUDClient()
    created_action_sequence = mongo_client.create_document("action_sequences", action_sequence)
    return created_action_sequence


@router.get("/actionSequences", response_model=List[ActionSequence])
def list_action_sequences():
    mongo_client = MongoCRUDClient()
    actionSequences = mongo_client.list_documents("action_sequences")
    return actionSequences


@router.get("/actionSequence/{id}", response_model=ActionSequence)
def get_action_sequence(id: str):
    mongo_client = MongoCRUDClient()
    action_sequence = mongo_client.get_document("action_sequences", id)
    if action_sequence is not None:
        return action_sequence

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"ActionSequence with ID {id} not found")


@router.put("/actionSequence/{id}", response_model=ActionSequence)
async def update_action_sequence(id: str, request: Request):

    action_sequence = json.loads(await request.body())
    action_sequence_id = action_sequence["id"]

    if len(action_sequence) >= 1:
        mongo_client = MongoCRUDClient()
        try:
            mongo_client.update_document("action_sequences", action_sequence)
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error updating {id}: {e}")

    item = mongo_client.get_document("action_sequences", id=action_sequence_id)
    if item is not None:
        return item

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"ActionSequence with ID {id} not found")


@router.delete("/actionSequence/{id}")
def delete_action_sequence(id: str, response: Response):
    mongo_client = MongoCRUDClient()
    delete_result = mongo_client.delete_document("action_sequences", id)

    if delete_result.deleted_count == 1:
        response.status_code = status.HTTP_204_NO_CONTENT
        return response

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"ActionSequence with ID {id} not found")
