import json
from typing import List

from fastapi import APIRouter, Request, Response, HTTPException, status
from fastapi.encoders import jsonable_encoder

from mongo_client import MongoCRUDClient
from schemas import UtilityFunction

# https://github.com/mongodb-developer/pymongo-fastapi-crud/blob/main/routes.py

router = APIRouter()


@router.post(
    "/utilityFunctions",
    status_code=status.HTTP_201_CREATED,
    response_model=UtilityFunction
)
async def create_utility_function(request: Request):

    utility_function_data = json.loads(await request.body())

    utility_function = jsonable_encoder(utility_function_data)
    mongo_client = MongoCRUDClient()
    created_utility_function = mongo_client.create_document("utility_functions", utility_function)
    return created_utility_function


@router.get("/utilityFunctions", response_model=List[UtilityFunction])
def list_utility_functions():
    mongo_client = MongoCRUDClient()
    utilityFunctions = mongo_client.list_documents("utility_functions")
    return utilityFunctions


@router.get("/utilityFunction/{id}", response_model=UtilityFunction)
def get_utility_function(id: str):
    mongo_client = MongoCRUDClient()
    utility_function = mongo_client.get_document("utility_functions", id)
    if utility_function is not None:
        return utility_function

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"UtilityFunction with ID {id} not found")


@router.put("/utilityFunction/{id}", response_model=UtilityFunction)
async def update_utility_function(id: str, request: Request):

    utility_function = json.loads(await request.body())
    utility_function_id = utility_function["id"]

    if len(utility_function) >= 1:
        mongo_client = MongoCRUDClient()
        try:
            mongo_client.update_document("utility_functions", utility_function)
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error updating {id}: {e}")

    item = mongo_client.get_document("utility_functions", id=utility_function_id)
    if item is not None:
        return item

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"UtilityFunction with ID {id} not found")


@router.delete("/utilityFunction/{id}")
def delete_utility_function(id: str, response: Response):
    mongo_client = MongoCRUDClient()
    delete_result = mongo_client.delete_document("utility_functions", id)

    if delete_result.deleted_count == 1:
        response.status_code = status.HTTP_204_NO_CONTENT
        return response

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"UtilityFunction with ID {id} not found")
