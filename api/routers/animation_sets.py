import json
from typing import List

from fastapi import APIRouter, Request, Response, HTTPException, status
from fastapi.encoders import jsonable_encoder
from mongo_client import MongoCRUDClient

from schemas import AnimationSet

# https://github.com/mongodb-developer/pymongo-fastapi-crud/blob/main/routes.py

router = APIRouter()


@router.post("/animationSets", status_code=status.HTTP_201_CREATED, response_model=AnimationSet)
async def create_animation_set(request: Request):

    animation_set_data = json.loads(await request.body())

    animation_set = jsonable_encoder(animation_set_data)
    mongo_client = MongoCRUDClient()
    created_animation_set = mongo_client.create_document("animation_sets", animation_set)
    return created_animation_set


@router.get("/animationSets", response_model=List[AnimationSet])
def list_animation_sets():
    mongo_client = MongoCRUDClient()
    animation_sets = mongo_client.list_documents("animation_sets")
    return animation_sets


@router.get("/animationSet/{id}", response_model=AnimationSet)
def get_animation_set(id: str):
    mongo_client = MongoCRUDClient()
    animation_set = mongo_client.get_document("animation_sets", id)
    if animation_set is not None:
        return animation_set

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"AnimationSet with ID {id} not found")


@router.put("/animationSet/{id}", response_model=AnimationSet)
async def update_animation_set(id: str, request: Request):

    animation_set = json.loads(await request.body())
    animation_set_id = animation_set["id"]

    # animation_set = {k: v for k, v in animation_set_data.dict().items() if v is not None}

    if len(animation_set) >= 1:
        mongo_client = MongoCRUDClient()
        try:
            mongo_client.update_document("animation_sets", animation_set)
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error updating {id}: {e}")

    item = mongo_client.get_document("animation_sets", id=animation_set_id)
    if item is not None:
        return item

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"AnimationSet with ID {id} not found")


@router.delete("/animationSet/{id}")
def delete_animation_set(id: str, response: Response):
    mongo_client = MongoCRUDClient()
    delete_result = mongo_client.delete_document("animation_sets", id)

    if delete_result.deleted_count == 1:
        response.status_code = status.HTTP_204_NO_CONTENT
        return response

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"AnimationSet with ID {id} not found")
