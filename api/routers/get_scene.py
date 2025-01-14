
import os

from fastapi import APIRouter

from mongo_client import MongoCRUDClient
from utils import transform_doc_id


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
            "agentProperties": []
        }
    }

    agent_instances = {}
    agent_documents = mongo_client.list_documents("agents")

    for instance in agent_documents:
        instance = transform_doc_id(instance)
        if instance["agentType"] in agent_instances:
            agent_instances[instance["agentType"]].append(instance)
        else:
            agent_instances[instance["agentType"]] = [instance]

    conditions = mongo_client.list_documents("conditions")  # return all items for now
    payload["data"]["conditions"] = [transform_doc_id(condition) for condition in conditions]

    agent_types = mongo_client.get_documents_from_ids("agent_types", scene_data["agentTypes"])
    payload["data"]["agentTypes"] = [transform_doc_id(agent_type) for agent_type in agent_types]

    spritesheets = mongo_client.list_documents("spritesheets")  # return all items for now
    payload["data"]["spriteSheets"] = [transform_doc_id(spritesheet) for spritesheet in spritesheets]

    animation_sets = mongo_client.list_documents("animation_sets")  # return all items for now
    payload["data"]["animationSets"] = [transform_doc_id(anim_set) for anim_set in animation_sets]

    actions = mongo_client.list_documents("actions")  # return all items for now
    payload["data"]["actions"] = [transform_doc_id(action) for action in actions]

    agent_properties = mongo_client.list_documents("agent_properties")  # return all items for now
    payload["data"]["agentProperties"] = [transform_doc_id(prop) for prop in agent_properties]

    payload["data"]["agentInstances"] = agent_instances

    return payload
