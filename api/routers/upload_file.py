import time
from pathlib import Path
from typing import Annotated, Any

from fastapi import APIRouter, Depends, Form, status, UploadFile

from deps import get_current_user


UPLOAD_FOLDER = Path("../public/media")
UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)


router = APIRouter()


@router.post("/uploadImage", status_code=status.HTTP_201_CREATED)
async def upload_file(
    resource: Annotated[str, Form()],
    imageType: Annotated[str, Form()],
    file: UploadFile,
    _user: Annotated[dict[str, Any], Depends(get_current_user)],
):

    timestamp = int(time.time() * 3)
    filename = f"{imageType}-{resource}-{timestamp}.png"
    file_path = UPLOAD_FOLDER / filename

    with file_path.open("wb") as buffer:
        buffer.write(await file.read())

    return {"result": "success", "filename": filename}
