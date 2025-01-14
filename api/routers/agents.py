import json
from typing import List

from fastapi import APIRouter, Body, Request, Response, HTTPException, status
from fastapi.encoders import jsonable_encoder
from mongo_client import MongoCRUDClient

from schemas import AgentConstructor
from utils import transform_doc_id

# https://github.com/mongodb-developer/pymongo-fastapi-crud/blob/main/routes.py

router = APIRouter()


@router.post("/agents", status_code=status.HTTP_201_CREATED, response_model=AgentConstructor)
async def create_agent(request: Request):

    agent_data = json.loads(await request.body())

    agent = jsonable_encoder(agent_data)
    mongo_client = MongoCRUDClient()
    created_agent = mongo_client.create_document("agents", agent)
    agent = transform_doc_id(created_agent)
    return agent


@router.get("/agents", response_model=List[AgentConstructor])
def list_agents(request: Request):
    mongo_client = MongoCRUDClient()
    agents = mongo_client.list_documents("agents")
    payload = [transform_doc_id(agent) for agent in agents]
    return payload


@router.get("/agent/{id}", response_model=AgentConstructor)
def get_agent(id: str, request: Request):
    mongo_client = MongoCRUDClient()
    agent = mongo_client.get_document("agents", id)
    if agent is not None:
        return transform_doc_id(agent)

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"AgentConstructor with ID {id} not found")


@router.put("/agent/{id}", response_model=AgentConstructor)
async def update_agent(id: str, request: Request):

    agent = json.loads(await request.body())
    agent_id = agent["id"]

    # agent = {k: v for k, v in agent_data.dict().items() if v is not None}

    if len(agent) >= 1:
        mongo_client = MongoCRUDClient()
        update_result = mongo_client.update_document("agents", agent)

        if update_result.modified_count == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Data for ID: {id} already matches saved document")

    item = mongo_client.get_document("agents", id=agent_id)
    item = transform_doc_id(item)
    if item is not None:
        return item

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"AgentConstructor with ID {id} not found")


@router.delete("/agent/{id}")
def delete_agent(id: str, request: Request, response: Response):
    mongo_client = MongoCRUDClient()
    delete_result = mongo_client.delete_document("agents", id)

    if delete_result.deleted_count == 1:
        response.status_code = status.HTTP_204_NO_CONTENT
        return response

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"AgentConstructor with ID {id} not found")
