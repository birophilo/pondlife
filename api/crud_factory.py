from __future__ import annotations

import json
from dataclasses import dataclass, field
from enum import Enum
from typing import Callable, FrozenSet, Generator, List, Optional, Type

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel

from mongo_client import MongoCRUDClient


def get_mongo_crud() -> Generator[MongoCRUDClient, None, None]:
    yield MongoCRUDClient()


class UpdateStrategy(str, Enum):
    """How to handle replace_one results on update."""

    TRY_EXCEPT = "try_except"
    """Wrap update in try/except; surface unexpected errors as 500."""

    NOOP_IS_404 = "noop_is_404"
    """If modified_count == 0, respond with 404 (document unchanged or missing)."""


@dataclass(frozen=True)
class MongoCrudConfig:
    collection: str
    """MongoDB collection name."""

    resource_name: str
    """Used in 404/500 messages (e.g. \"AgentProperty\")."""

    path_collection: str
    """Path for POST (create) and GET (list), e.g. \"/agentProperties\"."""

    path_item: str
    """Path prefix for item routes, e.g. \"/agentProperty\" -> GET \"{path_item}/{id}\"."""

    response_item_model: Optional[Type[BaseModel]] = None
    """If set, applied to create, get, update, and list (as List[model])."""

    update_strategy: UpdateStrategy = UpdateStrategy.TRY_EXCEPT

    before_delete: Optional[Callable[[MongoCRUDClient, str], None]] = None
    """Called before delete_document (e.g. cascade related documents)."""

    endpoints: FrozenSet[str] = field(
        default_factory=lambda: frozenset(
            {"create", "list", "get", "update", "delete"}
        )
    )
    """Subset of route names to register; omit keys to skip (for custom handlers)."""


def _not_found_detail(resource_name: str, id_: str) -> str:
    return f"{resource_name} with ID {id_} not found"


def register_mongo_crud(router: APIRouter, config: MongoCrudConfig) -> None:
    c = config.collection
    label = config.resource_name
    pc = config.path_collection
    pi = config.path_item
    item_model = config.response_item_model
    list_model = List[item_model] if item_model is not None else None

    if "create" in config.endpoints:

        async def create_item(
            request: Request, mongo: MongoCRUDClient = Depends(get_mongo_crud)
        ) -> object:
            raw = json.loads(await request.body())
            payload = jsonable_encoder(raw)
            return mongo.create_document(c, payload)

        create_kwargs = {
            "status_code": status.HTTP_201_CREATED,
        }
        if item_model is not None:
            create_kwargs["response_model"] = item_model
        create_item.__name__ = f"create_{c}"
        router.add_api_route(pc, create_item, methods=["POST"], **create_kwargs)

    if "list" in config.endpoints:

        def list_items(mongo: MongoCRUDClient = Depends(get_mongo_crud)) -> object:
            return mongo.list_documents(c)

        list_kwargs = {}
        if list_model is not None:
            list_kwargs["response_model"] = list_model
        list_items.__name__ = f"list_{c}"
        router.add_api_route(pc, list_items, methods=["GET"], **list_kwargs)

    if "get" in config.endpoints:

        def get_item(id: str, mongo: MongoCRUDClient = Depends(get_mongo_crud)) -> object:
            item = mongo.get_document(c, id)
            if item is not None:
                return item
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=_not_found_detail(label, id),
            )

        get_kwargs = {}
        if item_model is not None:
            get_kwargs["response_model"] = item_model
        get_item.__name__ = f"get_{c}"
        router.add_api_route(f"{pi}/{{id}}", get_item, methods=["GET"], **get_kwargs)

    if "update" in config.endpoints:

        async def update_item(
            id: str,
            request: Request,
            mongo: MongoCRUDClient = Depends(get_mongo_crud),
        ) -> object:
            body = json.loads(await request.body())
            if "id" not in body:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Request body must include id",
                )
            entity_id = body["id"]

            if len(body) >= 1:
                if config.update_strategy is UpdateStrategy.TRY_EXCEPT:
                    try:
                        mongo.update_document(c, body)
                    except Exception as e:
                        raise HTTPException(
                            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail=f"Error updating {id}: {e}",
                        ) from e
                else:
                    update_result = mongo.update_document(c, body)
                    if update_result.modified_count == 0:
                        raise HTTPException(
                            status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"Data for ID: {id} already matches saved document",
                        )

            item = mongo.get_document(c, id=entity_id)
            if item is not None:
                return item
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=_not_found_detail(label, id),
            )

        update_kwargs = {}
        if item_model is not None:
            update_kwargs["response_model"] = item_model
        update_item.__name__ = f"update_{c}"
        router.add_api_route(
            f"{pi}/{{id}}", update_item, methods=["PUT"], **update_kwargs
        )

    if "delete" in config.endpoints:

        def delete_item(
            id: str,
            response: Response,
            mongo: MongoCRUDClient = Depends(get_mongo_crud),
        ) -> Response:
            if config.before_delete is not None:
                config.before_delete(mongo, id)
            delete_result = mongo.delete_document(c, id)
            if delete_result.deleted_count == 1:
                response.status_code = status.HTTP_204_NO_CONTENT
                return response
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=_not_found_detail(label, id),
            )

        delete_item.__name__ = f"delete_{c}"
        router.add_api_route(f"{pi}/{{id}}", delete_item, methods=["DELETE"])
