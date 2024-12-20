import json
import os

from fastapi import APIRouter

router = APIRouter()

root_dir = os.path.dirname(os.path.dirname(__file__))
data_dir = os.path.join(root_dir, "data")

scene1_path = os.path.join(data_dir, "scene1.json")


@router.get("/scene-1", status_code=200)
async def scene1():

    with open(scene1_path) as f:
        data = json.load(f)

    return data
