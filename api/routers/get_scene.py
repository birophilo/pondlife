import json
import os

from fastapi import APIRouter

router = APIRouter()

root_dir = os.path.dirname(os.path.dirname(__file__))
data_dir = os.path.join(root_dir, "data")

scene1_path = os.path.join(data_dir, "scene1.json")
scene2_path = os.path.join(data_dir, "scene2.json")


@router.get("/scene/{scene_id}", status_code=200)
async def getSceneData(scene_id):

    scene_path = os.path.join(data_dir, f"scene{scene_id}.json")

    with open(scene_path) as f:
        data = json.load(f)

    return data
