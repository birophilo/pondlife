import json
import os

from fastapi import APIRouter, Request

router = APIRouter()

root_dir = os.path.dirname(os.path.dirname(__file__))
data_dir = os.path.join(root_dir, "data")


@router.post("/scene/{scene_id}", status_code=200)
async def postSceneData(scene_id: str, request: Request):

    data = json.loads(await request.body())

    scene_path = os.path.join(data_dir, f"scene{scene_id}.json")

    with open(scene_path, 'w') as f:
        f.write(json.dumps(data, indent=2))

    return {'message': 'OK'}
