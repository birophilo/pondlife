from fastapi import APIRouter

router = APIRouter()


@router.get("/hello", status_code=200)
async def hello():
    return {"message": "hello"}
