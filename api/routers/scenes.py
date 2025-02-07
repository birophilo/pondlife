
import json

from fastapi import APIRouter, Request, HTTPException, status

from mongo_client import MongoCRUDClient
from schemas import Scene
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
            "spritesheets": [],
            "animationSets": [],
            "actions": [],
            "agentProperties": [],
            "propertyChanges": [],
            "firstActions": scene["data"]["firstActions"]
        },
        "createdAt": scene["createdAt"],
        "lastModified": scene["lastModified"],
        "resource": scene["resource"]
    }

    agent_instances = {}
    agent_documents = mongo_client.get_documents_from_ids("agents", scene_data["agentInstances"])

    for instance in agent_documents:
        if instance["agentType"] in agent_instances:
            agent_instances[instance["agentType"]].append(instance)
        else:
            agent_instances[instance["agentType"]] = [instance]

    payload["data"]["agentInstances"] = agent_instances

    conditions = mongo_client.get_documents_from_ids("conditions", scene_data["conditions"])
    payload["data"]["conditions"] = conditions

    agent_types = mongo_client.get_documents_from_ids("agent_types", scene_data["agentTypes"])
    payload["data"]["agentTypes"] = agent_types

    spritesheets = mongo_client.get_documents_from_ids("spritesheets", scene_data["spritesheets"])
    payload["data"]["spritesheets"] = spritesheets

    animation_sets = mongo_client.get_documents_from_ids("animation_sets", scene_data["animationSets"])
    payload["data"]["animationSets"] = animation_sets

    actions = mongo_client.get_documents_from_ids("actions", scene_data["actions"])
    payload["data"]["actions"] = actions

    property_changes = mongo_client.get_documents_from_ids("property_changes", scene_data["propertyChanges"])
    payload["data"]["propertyChanges"] = property_changes

    agent_properties = mongo_client.get_documents_from_ids("agent_properties", scene_data["agentProperties"])
    payload["data"]["agentProperties"] = agent_properties

    return payload


@router.get("/scenes", status_code=200)
async def list_scenes():
    mongo_client = MongoCRUDClient()

    scenes = mongo_client.list_documents("scenes")

    sceneIds = [
        {
            "id": scene["id"],
            "name": scene["name"],
            "lastModified": scene["lastModified"]
        } for scene in scenes
    ]

    return sceneIds


@router.post("/scenes", status_code=status.HTTP_201_CREATED, response_model=Scene)
async def create_scene(request: Request):

    data = json.loads(await request.body())

    blank_scene = {
        "name": data["name"],
        "data": {
            "conditions": [],
            "agentTypes": [],
            "agentInstances": [],
            "spritesheets": [],
            "animationSets": [],
            "actions": [],
            "agentProperties": [],
            "propertyChanges": [],
            "firstActions": {}
        },
        "resource": "scene"
    }
    mongo_client = MongoCRUDClient()
    created_scene = mongo_client.create_document("scenes", blank_scene)
    return created_scene


@router.put("/scene/{id}", response_model=Scene)
async def update_scene(id: str, request: Request):

    scene = json.loads(await request.body())

    scene_id = scene["id"]

    if len(scene) >= 1:
        mongo_client = MongoCRUDClient()
        try:
            mongo_client.update_document("scenes", scene)
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error updating {id}: {e}")

    item = mongo_client.get_document("scenes", id=scene_id)
    if item is not None:
        return item

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Scene with ID {id} not found")
