
import json
import os

from fastapi import APIRouter, Request

from mongo_client import MongoCRUDClient
from schemas import Scene
from utils import transform_doc_id

import json
from typing import List

from fastapi import APIRouter, Body, Request, Response, HTTPException, status
from fastapi.encoders import jsonable_encoder
from mongo_client import MongoCRUDClient

from schemas import AgentType
from utils import transform_doc_id


router = APIRouter()


@router.get("/scene/{scene_id}", status_code=200)
async def get_scene_data(scene_id):

    mongo_client = MongoCRUDClient()

    scene = mongo_client.get_document("scenes", scene_id)

    scene = transform_doc_id(scene)

    scene_data = scene["data"]

    payload = {
        "id": scene["id"],
        "name": scene["name"],
        "data": {
            "conditions": [],
            "agentTypes": [],
            "agentInstances": [],
            "spriteSheets": [],
            "animationSets": [],
            "actions": [],
            "agentProperties": [],
            "propertyChanges": []
        }
    }

    agent_instances = {}
    agent_documents = mongo_client.list_documents("agents")
    agent_documents = mongo_client.get_documents_from_ids("agents", scene_data["agentInstances"])

    for instance in agent_documents:
        if instance["agentType"] in agent_instances:
            agent_instances[instance["agentType"]].append(instance)
        else:
            agent_instances[instance["agentType"]] = [instance]

    payload["data"]["agentInstances"] = agent_instances

    conditions = mongo_client.list_documents("conditions")  # return all items for now
    payload["data"]["conditions"] = conditions

    agent_types = mongo_client.list_documents("agent_types")  # return all items for now
    payload["data"]["agentTypes"] = agent_types

    spritesheets = mongo_client.list_documents("spritesheets")  # return all items for now
    payload["data"]["spriteSheets"] = spritesheets

    animation_sets = mongo_client.list_documents("animation_sets")  # return all items for now
    payload["data"]["animationSets"] = animation_sets

    actions = mongo_client.list_documents("actions")  # return all items for now
    payload["data"]["actions"] = actions

    property_changes = mongo_client.list_documents("property_changes")  # return all items for now
    payload["data"]["propertyChanges"] = property_changes

    agent_properties = mongo_client.get_documents_from_ids("agent_properties", scene_data["agentProperties"])
    payload["data"]["agentProperties"] = agent_properties

    return payload


@router.get("/scenes", status_code=200)
async def list_scenes():
    mongo_client = MongoCRUDClient()

    scenes = mongo_client.list_documents("scenes")

    sceneIds = [
        {"id": scene["id"], "name": scene["name"]} for scene in scenes
    ]

    return sceneIds


@router.post("/scenes", status_code=status.HTTP_201_CREATED, response_model=Scene)
async def create_scene(request: Request):

    data = json.loads(await request.body())

    scene_name = data["name"]

    blank_scene = {
        "name": scene_name,
        "data": {
            "conditions": [],
            "agentTypes": [],
            "agentInstances": [],
            "spriteSheets": [],
            "animationSets": [],
            "actions": [],
            "agentProperties": [],
            "propertyChanges": []
        }
    }
    mongo_client = MongoCRUDClient()
    created_scene = mongo_client.create_document("scenes", blank_scene)
    return created_scene


@router.put("/scene/{scene_id}", status_code=200)
async def post_scene_data(scene_id: str, request: Request):

    data = json.loads(await request.body())

    scene_path = os.path.join(data_dir, f"scene{scene_id}.json")

    with open(scene_path, 'w') as f:
        f.write(json.dumps(data, indent=2))

    return {'message': 'OK'}
