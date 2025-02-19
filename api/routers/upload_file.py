import time
from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, Form, status, UploadFile


UPLOAD_FOLDER = Path("media")
UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)


router = APIRouter()


@router.post("/uploadImage", status_code=status.HTTP_201_CREATED)
async def upload_file(
    resource: Annotated[str, Form()],
    imageType: Annotated[str, Form()],
    file: UploadFile
):

    timestamp = int(time.time() * 3)
    filename = f"{imageType}-{resource}-{timestamp}.png"
    file_path = UPLOAD_FOLDER / filename

    with file_path.open("wb") as buffer:
        buffer.write(await file.read())

    return {"result": "success", "filename": filename}
