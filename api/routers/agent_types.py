import json
import time
from pathlib import Path
from typing import Annotated, List

from fastapi import APIRouter, File, Form, Request, Response, HTTPException, status, UploadFile
from fastapi.encoders import jsonable_encoder
from mongo_client import MongoCRUDClient

from schemas import AgentType

# https://github.com/mongodb-developer/pymongo-fastapi-crud/blob/main/routes.py

router = APIRouter()

UPLOAD_FOLDER = Path("media")
UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)


@router.post("/agentTypes", status_code=status.HTTP_201_CREATED, response_model=AgentType)
async def create_agent_type(request: Request):

    agent_type_data = json.loads(await request.body())

    agent_type = jsonable_encoder(agent_type_data)
    mongo_client = MongoCRUDClient()
    created_agent_type = mongo_client.create_document("agent_types", agent_type)
    return created_agent_type


@router.post("/agentTypesMultipart", status_code=status.HTTP_201_CREATED)
async def create_agent_type_multipart(
    jsondata: Annotated[str, Form()],
    file: UploadFile
):

    agent_type_data = json.loads(jsondata)
    print(json.loads(jsondata))
    print(file)

    timestamp = int(time.time() * 3)

    filename = f"agent-type-{timestamp}.png"

    file_path = UPLOAD_FOLDER / filename

    # Save file
    with file_path.open("wb") as buffer:
        buffer.write(await file.read())

    agent_type = jsonable_encoder(agent_type_data)
    agent_type["thumbnail"] = filename
    mongo_client = MongoCRUDClient()
    created_agent_type = mongo_client.create_document("agent_types", agent_type)
    return created_agent_type


@router.get("/agentTypes", response_model=List[AgentType])
def list_agent_types(request: Request):
    mongo_client = MongoCRUDClient()
    agent_types = mongo_client.list_documents("agent_types")
    return agent_types


@router.get("/agentType/{id}", response_model=AgentType)
def get_agent_type(id: str, request: Request):
    mongo_client = MongoCRUDClient()
    agent_type = mongo_client.get_document("agent_types", id)
    if agent_type is not None:
        return agent_type

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"AgentType with ID {id} not found")


@router.put("/agentType/{id}", response_model=AgentType)
async def update_agent_type(id: str, request: Request):

    agent_type = json.loads(await request.body())
    agent_type_id = agent_type["id"]

    # agent_type = {k: v for k, v in agent_type_data.dict().items() if v is not None}

    if len(agent_type) >= 1:
        mongo_client = MongoCRUDClient()
        try:
            mongo_client.update_document("agent_types", agent_type)
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error updating {id}: {e}")

    item = mongo_client.get_document("agent_types", id=agent_type_id)
    if item is not None:
        return item

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"AgentType with ID {id} not found")


@router.delete("/agentType/{id}")
def delete_agent_type(id: str, request: Request, response: Response):
    mongo_client = MongoCRUDClient()
    delete_result = mongo_client.delete_document("agent_types", id)

    if delete_result.deleted_count == 1:
        response.status_code = status.HTTP_204_NO_CONTENT
        return response

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"AgentType with ID {id} not found")
