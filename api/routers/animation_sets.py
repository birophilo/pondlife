from fastapi import APIRouter

from crud_factory import MongoCrudConfig, register_mongo_crud
from schemas import AnimationSet

router = APIRouter()

register_mongo_crud(
    router,
    MongoCrudConfig(
        collection="animation_sets",
        resource_name="AnimationSet",
        path_collection="/animationSets",
        path_item="/animationSet",
        response_item_model=AnimationSet,
    ),
)
