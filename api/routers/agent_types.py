from pathlib import Path

from fastapi import APIRouter

from crud_factory import MongoCrudConfig, register_mongo_crud
from schemas import AgentType

router = APIRouter()

UPLOAD_FOLDER = Path("media")
UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)

register_mongo_crud(
    router,
    MongoCrudConfig(
        collection="agent_types",
        resource_name="AgentType",
        path_collection="/agentTypes",
        path_item="/agentType",
        response_item_model=AgentType,
    ),
)
