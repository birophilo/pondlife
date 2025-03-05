import json
from typing import List

from fastapi import APIRouter, Request, Response, HTTPException, status
from fastapi.encoders import jsonable_encoder
from mongo_client import MongoCRUDClient

from schemas import Spritesheet

# https://github.com/mongodb-developer/pymongo-fastapi-crud/blob/main/routes.py

router = APIRouter()


@router.post("/spritesheets", status_code=status.HTTP_201_CREATED, response_model=Spritesheet)
async def create_spritesheet(request: Request):

    spritesheet_data = json.loads(await request.body())

    spritesheet = jsonable_encoder(spritesheet_data)
    mongo_client = MongoCRUDClient()
    created_spritesheet = mongo_client.create_document("spritesheets", spritesheet)
    return created_spritesheet


@router.get("/spritesheets", response_model=List[Spritesheet])
def list_spritesheets():
    mongo_client = MongoCRUDClient()
    spritesheets = mongo_client.list_documents("spritesheets")
    return spritesheets


@router.get("/spritesheet/{id}", response_model=Spritesheet)
def get_spritesheet(id: str):
    mongo_client = MongoCRUDClient()
    spritesheet = mongo_client.get_document("spritesheets", id)
    if spritesheet is not None:
        return spritesheet

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Spritesheet with ID {id} not found")


@router.put("/spritesheet/{id}", response_model=Spritesheet)
async def update_spritesheet(id: str, request: Request):

    spritesheet = json.loads(await request.body())
    spritesheet_id = spritesheet["id"]

    # spritesheet = {k: v for k, v in spritesheet_data.dict().items() if v is not None}

    if len(spritesheet) >= 1:
        mongo_client = MongoCRUDClient()
        try:
            mongo_client.update_document("spritesheets", spritesheet)
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error updating {id}: {e}")

    item = mongo_client.get_document("spritesheets", id=spritesheet_id)
    if item is not None:
        return item

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Spritesheet with ID {id} not found")


@router.delete("/spritesheet/{id}")
def delete_spritesheet(id: str, response: Response):
    mongo_client = MongoCRUDClient()
    delete_result = mongo_client.delete_document("spritesheets", id)

    if delete_result.deleted_count == 1:
        response.status_code = status.HTTP_204_NO_CONTENT
        return response

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Spritesheet with ID {id} not found")
