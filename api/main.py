import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


from routers import (
    hello,
    scenes,
    conditions,
    spritesheets,
    animation_sets,
    agent_types,
    agents,
    actions,
    property_changes,
    agent_properties,
    upload_file
)


def create_application() -> FastAPI:
    application = FastAPI()
    application.include_router(hello.router)
    application.include_router(scenes.router)
    application.include_router(conditions.router)
    application.include_router(spritesheets.router)
    application.include_router(animation_sets.router)
    application.include_router(agent_types.router)
    application.include_router(agents.router)
    application.include_router(actions.router)
    application.include_router(property_changes.router)
    application.include_router(agent_properties.router)
    application.include_router(upload_file.router)
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
