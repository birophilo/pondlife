
import os

from fastapi import APIRouter

from mongo_client import MongoCRUDClient
from utils import transform_doc_id, flatten_oid_list


router = APIRouter()

root_dir = os.path.dirname(os.path.dirname(__file__))
data_dir = os.path.join(root_dir, "data")

scene1_path = os.path.join(data_dir, "scene1.json")
scene2_path = os.path.join(data_dir, "scene2.json")


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

    for instance in agent_documents:
        if instance["agentType"] in agent_instances:
            agent_instances[instance["agentType"]].append(instance)
        else:
            agent_instances[instance["agentType"]] = [instance]

    payload["data"]["agentInstances"] = agent_instances

    conditions = mongo_client.list_documents("conditions")  # return all items for now
    payload["data"]["conditions"] = conditions

    agent_types = mongo_client.get_documents_from_ids("agent_types", scene_data["agentTypes"])
    payload["data"]["agentTypes"] = agent_types

    spritesheets = mongo_client.list_documents("spritesheets")  # return all items for now
    payload["data"]["spriteSheets"] = spritesheets

    animation_sets = mongo_client.list_documents("animation_sets")  # return all items for now
    payload["data"]["animationSets"] = animation_sets

    actions = mongo_client.list_documents("actions")  # return all items for now
    payload["data"]["actions"] = actions

    property_changes = mongo_client.list_documents("property_changes")  # return all items for now
    payload["data"]["propertyChanges"] = property_changes

    agent_properties = mongo_client.list_documents("agent_properties")  # return all items for now
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
