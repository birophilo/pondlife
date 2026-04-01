from fastapi import APIRouter

from crud_factory import MongoCrudConfig, UpdateStrategy, register_mongo_crud
from schemas import AgentProperty

router = APIRouter()

register_mongo_crud(
    router,
    MongoCrudConfig(
        collection="agent_properties",
        resource_name="AgentProperty",
        path_collection="/agentProperties",
        path_item="/agentProperty",
        response_item_model=AgentProperty,
        update_strategy=UpdateStrategy.NOOP_IS_404,
    ),
)
