from fastapi import APIRouter

from crud_factory import MongoCrudConfig, register_mongo_crud
from schemas import UtilityFunction

router = APIRouter()

register_mongo_crud(
    router,
    MongoCrudConfig(
        collection="utility_functions",
        resource_name="UtilityFunction",
        path_collection="/utilityFunctions",
        path_item="/utilityFunction",
        response_item_model=UtilityFunction,
    ),
)
