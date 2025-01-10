import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


from routers import (
    hello,
    get_scene,
    save_scene,
    conditions,
    spritesheets,
    animation_sets,
    agent_types,
    actions
)


def create_application() -> FastAPI:
    application = FastAPI()
    application.include_router(hello.router)
    application.include_router(get_scene.router)
    application.include_router(save_scene.router)
    application.include_router(conditions.router)
    application.include_router(spritesheets.router)
    application.include_router(animation_sets.router)
    application.include_router(agent_types.router)
    application.include_router(actions.router)
    return application


app = create_application()

origins = [
    "http://localhost:8000",
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
