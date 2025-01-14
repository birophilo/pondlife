import json
from typing import List

from fastapi import APIRouter, Body, Request, Response, HTTPException, status
from fastapi.encoders import jsonable_encoder
from mongo_client import MongoCRUDClient

from schemas import AgentProperty
from utils import transform_doc_id

# https://github.com/mongodb-developer/pymongo-fastapi-crud/blob/main/routes.py

router = APIRouter()


@router.post("/agentProperties", status_code=status.HTTP_201_CREATED, response_model=AgentProperty)
async def create_agent_property(request: Request):

    agent_property_data = json.loads(await request.body())

    agent_property = jsonable_encoder(agent_property_data)
    mongo_client = MongoCRUDClient()
    created_agent_property = mongo_client.create_document("agent_properties", agent_property)
    agent_property = transform_doc_id(created_agent_property)
    return agent_property


@router.get("/agentProperties", response_model=List[AgentProperty])
def list_agent_properties(request: Request):
    mongo_client = MongoCRUDClient()
    agent_properties = mongo_client.list_documents("agent_properties")
    payload = [transform_doc_id(agent_property) for agent_property in agent_properties]
    return payload


@router.get("/agentProperty/{id}", response_model=AgentProperty)
def get_agent_property(id: str, request: Request):
    mongo_client = MongoCRUDClient()
    agent_property = mongo_client.get_document("agent_properties", id)
    if agent_property is not None:
        return transform_doc_id(agent_property)

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"AgentProperty with ID {id} not found")


@router.put("/agentProperty/{id}", response_model=AgentProperty)
async def update_agent_property(id: str, request: Request):

    agent_property = json.loads(await request.body())
    agent_property_id = agent_property["id"]

    # agent_property = {k: v for k, v in agent_property_data.dict().items() if v is not None}

    if len(agent_property) >= 1:
        mongo_client = MongoCRUDClient()
        update_result = mongo_client.update_document("agent_properties", agent_property)

        if update_result.modified_count == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Data for ID: {id} already matches saved document")

    item = mongo_client.get_document("agent_properties", id=agent_property_id)
    item = transform_doc_id(item)
    if item is not None:
        return item

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"AgentProperty with ID {id} not found")


@router.delete("/agentProperty/{id}")
def delete_agent_property(id: str, request: Request, response: Response):
    mongo_client = MongoCRUDClient()
    delete_result = mongo_client.delete_document("agent_properties", id)

    if delete_result.deleted_count == 1:
        response.status_code = status.HTTP_204_NO_CONTENT
        return response

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"AgentProperty with ID {id} not found")
