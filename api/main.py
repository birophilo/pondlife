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
    upload_file,
    auth
)


def create_app() -> FastAPI:
    app = FastAPI()
    app.include_router(hello.router)
    app.include_router(scenes.router)
    app.include_router(conditions.router)
    app.include_router(spritesheets.router)
    app.include_router(animation_sets.router)
    app.include_router(agent_types.router)
    app.include_router(agents.router)
    app.include_router(actions.router)
    app.include_router(property_changes.router)
    app.include_router(agent_properties.router)
    app.include_router(upload_file.router)
    app.include_router(auth.router)
    return app


app = create_app()

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
