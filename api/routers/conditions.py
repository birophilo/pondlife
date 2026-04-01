from fastapi import APIRouter

from crud_factory import MongoCrudConfig, register_mongo_crud
from schemas import Condition

router = APIRouter()

register_mongo_crud(
    router,
    MongoCrudConfig(
        collection="conditions",
        resource_name="Condition",
        path_collection="/conditions",
        path_item="/condition",
        response_item_model=Condition,
    ),
)
