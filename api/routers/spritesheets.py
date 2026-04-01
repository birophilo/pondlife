from fastapi import APIRouter

from crud_factory import MongoCrudConfig, register_mongo_crud
from schemas import Spritesheet

router = APIRouter()

register_mongo_crud(
    router,
    MongoCrudConfig(
        collection="spritesheets",
        resource_name="Spritesheet",
        path_collection="/spritesheets",
        path_item="/spritesheet",
        response_item_model=Spritesheet,
    ),
)
