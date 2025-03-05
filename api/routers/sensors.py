import json
from typing import List

from fastapi import APIRouter, Request, Response, HTTPException, status
from fastapi.encoders import jsonable_encoder

from mongo_client import MongoCRUDClient
from schemas import Sensor

# https://github.com/mongodb-developer/pymongo-fastapi-crud/blob/main/routes.py

router = APIRouter()


@router.post(
    "/sensors",
    status_code=status.HTTP_201_CREATED,
    response_model=Sensor
)
async def create_sensor(request: Request):

    sensor_data = json.loads(await request.body())

    sensor = jsonable_encoder(sensor_data)
    mongo_client = MongoCRUDClient()
    created_sensor = mongo_client.create_document("sensors", sensor)
    return created_sensor


@router.get("/sensors", response_model=List[Sensor])
def list_sensors():
    mongo_client = MongoCRUDClient()
    sensors = mongo_client.list_documents("sensors")
    return sensors


@router.get("/sensor/{id}", response_model=Sensor)
def get_sensor(id: str):
    mongo_client = MongoCRUDClient()
    sensor = mongo_client.get_document("sensors", id)
    if sensor is not None:
        return sensor

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Sensor with ID {id} not found")


@router.put("/sensor/{id}", response_model=Sensor)
async def update_sensor(id: str, request: Request):

    sensor = json.loads(await request.body())
    sensor_id = sensor["id"]

    # sensor = {k: v for k, v in sensor_data.dict().items() if v is not None}

    if len(sensor) >= 1:
        mongo_client = MongoCRUDClient()
        try:
            mongo_client.update_document("sensors", sensor)
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error updating {id}: {e}")

    item = mongo_client.get_document("sensors", id=sensor_id)
    if item is not None:
        return item

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Sensor with ID {id} not found")


@router.delete("/sensor/{id}")
def delete_sensor(id: str, response: Response):
    mongo_client = MongoCRUDClient()
    delete_result = mongo_client.delete_document("sensors", id)

    if delete_result.deleted_count == 1:
        response.status_code = status.HTTP_204_NO_CONTENT
        return response

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Sensor with ID {id} not found")
