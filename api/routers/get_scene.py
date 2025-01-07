
import os

from fastapi import APIRouter

from mongo_client import MongoCRUDClient


router = APIRouter()

root_dir = os.path.dirname(os.path.dirname(__file__))
data_dir = os.path.join(root_dir, "data")

scene1_path = os.path.join(data_dir, "scene1.json")
scene2_path = os.path.join(data_dir, "scene2.json")


@router.get("/scene/{scene_id}", status_code=200)
async def get_scene_data(scene_id):

    mongo_client = MongoCRUDClient()

    scene = mongo_client.get_document("scenes", scene_id)

    scene_data = scene["data"]

    payload = {
        "_id": scene["_id"],
        "id": scene["id"],
        "name": scene["name"],
        "data": {
            "conditions": [],
            "agentTypes": [],
            "agentInstances": [],
            "spriteSheets": [],
            "animationSets": []
        }
    }

    agent_instances = {}
    agent_documents = mongo_client.get_documents_from_ids("agent_instances", scene_data["agentInstances"])

    for instance in agent_documents:
        if instance["agentType"] in agent_instances:
            agent_instances[instance["agentType"]].append(instance)
        else:
            agent_instances[instance["agentType"]] = [instance]

    payload["data"]["conditions"] = mongo_client.list_documents("conditions")
    payload["data"]["agentTypes"] = mongo_client.get_documents_from_ids("agent_types", scene_data["agentTypes"])
    payload["data"]["spriteSheets"] = mongo_client.get_documents_from_ids("sprite_sheets", scene_data["spriteSheets"])
    payload["data"]["animationSets"] = mongo_client.get_documents_from_ids("animation_sets", scene_data["animationSets"])
    payload["data"]["agentInstances"] = agent_instances

    return payload
