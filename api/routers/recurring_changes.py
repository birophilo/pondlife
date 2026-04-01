from fastapi import APIRouter

from crud_factory import MongoCrudConfig, register_mongo_crud
from schemas import RecurringChange

router = APIRouter()

register_mongo_crud(
    router,
    MongoCrudConfig(
        collection="recurring_changes",
        resource_name="RecurringChange",
        path_collection="/recurringChanges",
        path_item="/recurringChange",
        response_item_model=RecurringChange,
    ),
)
