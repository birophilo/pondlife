from fastapi import APIRouter

from crud_factory import MongoCrudConfig, register_mongo_crud
from schemas import Sensor

router = APIRouter()

register_mongo_crud(
    router,
    MongoCrudConfig(
        collection="sensors",
        resource_name="Sensor",
        path_collection="/sensors",
        path_item="/sensor",
        response_item_model=Sensor,
    ),
)
