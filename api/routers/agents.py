import json
from typing import List

from fastapi import APIRouter, Request, Response, HTTPException, status
from fastapi.encoders import jsonable_encoder
from mongo_client import MongoCRUDClient

from schemas import AgentConstructor

# https://github.com/mongodb-developer/pymongo-fastapi-crud/blob/main/routes.py

router = APIRouter()


@router.post("/agents", status_code=status.HTTP_201_CREATED, response_model=AgentConstructor)
async def create_agent(request: Request):

    agent_data = json.loads(await request.body())

    agent = jsonable_encoder(agent_data)
    mongo_client = MongoCRUDClient()
    created_agent = mongo_client.create_document("agents", agent)
    return created_agent


@router.get("/agents", response_model=List[AgentConstructor])
def list_agents():
    mongo_client = MongoCRUDClient()
    agents = mongo_client.list_documents("agents")
    return agents


@router.get("/agent/{id}", response_model=AgentConstructor)
def get_agent(id: str):
    mongo_client = MongoCRUDClient()
    agent = mongo_client.get_document("agents", id)
    if agent is not None:
        return agent

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"AgentConstructor with ID {id} not found")


@router.put("/agent/{id}", response_model=AgentConstructor)
async def update_agent(id: str, request: Request):

    agent = json.loads(await request.body())
    agent_id = agent["id"]

    # agent = {k: v for k, v in agent_data.dict().items() if v is not None}

    if len(agent) >= 1:
        mongo_client = MongoCRUDClient()
        try:
            mongo_client.update_document("agents", agent)
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error updating {id}: {e}")

    item = mongo_client.get_document("agents", id=agent_id)
    if item is not None:
        return item

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"AgentConstructor with ID {id} not found")


@router.delete("/agent/{id}")
def delete_agent(id: str, response: Response):
    mongo_client = MongoCRUDClient()
    delete_result = mongo_client.delete_document("agents", id)

    if delete_result.deleted_count == 1:
        response.status_code = status.HTTP_204_NO_CONTENT
        return response

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"AgentConstructor with ID {id} not found")
