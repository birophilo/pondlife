from fastapi import APIRouter

from crud_factory import MongoCrudConfig, register_mongo_crud
from schemas import ActionSequence

router = APIRouter()

register_mongo_crud(
    router,
    MongoCrudConfig(
        collection="action_sequences",
        resource_name="ActionSequence",
        path_collection="/actionSequences",
        path_item="/actionSequence",
        response_item_model=ActionSequence,
    ),
)
