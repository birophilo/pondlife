from fastapi import APIRouter

from crud_factory import MongoCrudConfig, UpdateStrategy, register_mongo_crud
from mongo_client import MongoCRUDClient

router = APIRouter()


def _before_delete_actions(mongo: MongoCRUDClient, id: str) -> None:
    action = mongo.get_document("actions", id)
    if action:
        for property_change_id in action.get("propertyChanges", []):
            mongo.delete_document("property_changes", property_change_id)


register_mongo_crud(
    router,
    MongoCrudConfig(
        collection="actions",
        resource_name="Action",
        path_collection="/actions",
        path_item="/action",
        response_item_model=None,
        update_strategy=UpdateStrategy.NOOP_IS_404,
        before_delete=_before_delete_actions,
    ),
)
