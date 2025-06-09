import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


from routers import (
    actions,
    agents,
    agent_properties,
    agent_types,
    animation_sets,
    auth,
    conditions,
    hello,
    property_changes,
    scenes,
    sensors,
    utility_functions,
    recurring_changes,
    spritesheets,
    upload_file
)


def create_app() -> FastAPI:
    app = FastAPI()
    app.include_router(actions.router)
    app.include_router(agents.router)
    app.include_router(agent_properties.router)
    app.include_router(agent_types.router)
    app.include_router(animation_sets.router)
    app.include_router(auth.router)
    app.include_router(conditions.router)
    app.include_router(hello.router)
    app.include_router(property_changes.router)
    app.include_router(scenes.router)
    app.include_router(sensors.router)
    app.include_router(utility_functions.router)
    app.include_router(spritesheets.router)
    app.include_router(upload_file.router)
    app.include_router(recurring_changes.router)
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
