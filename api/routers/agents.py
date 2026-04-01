from fastapi import APIRouter

from crud_factory import MongoCrudConfig, register_mongo_crud
from schemas import AgentConstructor

router = APIRouter()

register_mongo_crud(
    router,
    MongoCrudConfig(
        collection="agents",
        resource_name="AgentConstructor",
        path_collection="/agents",
        path_item="/agent",
        response_item_model=AgentConstructor,
    ),
)
