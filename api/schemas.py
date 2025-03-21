from typing import Any, List

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class DefaultInterval:
    name: str = "day"
    type: str = "frame"  # only option for now, later support "clock" time
    interval: float = 1.0


class XY(BaseModel):
    x: float
    y: float


class Condition(BaseModel):
    id: str
    name: str
    condition_type: str
    comparison: str
    # unify property and class_method into 'prop'?
    property: str | None = None
    class_method: str | None = None
    condition_value: str | bool | int | float

    # specific to 'vicinity'-based conditions
    agent_type: str | None = None
    count: float | None = None

    model_config = ConfigDict(alias_generator=to_camel)


class Spritesheet(BaseModel):
    id: str
    name: str
    src: str
    columns: int
    rows: int
    num_images: int
    refresh_interval: float

    model_config = ConfigDict(alias_generator=to_camel)


class AnimationSet(BaseModel):
    id: str
    name: str
    sheets: dict
    offset: XY
    scale: float


class AgentType(BaseModel):
    id: str
    name: str
    width: float
    height: float
    offset: XY
    nominal_speed: float
    animation_set: str | None = None
    thumbnail: str
    sensor: str | None = None
    first_action: str | None = None

    model_config = ConfigDict(alias_generator=to_camel)


class AgentConstructor(BaseModel):
    # note: this contains the bare minimum to construct an Agent instance
    # i.e. carries no simulation state (to add later)
    id: str
    agent_type: str
    position: XY
    # state_data: dict

    model_config = ConfigDict(alias_generator=to_camel)


class AgentProperty(BaseModel):
    id: str
    name: str
    value_type: str
    initial_value: str | bool | int | float | None
    apply_to: str
    agent_types: List[str]
    description: str | None = None

    model_config = ConfigDict(alias_generator=to_camel)


# ACTIONS


class BaseAction(BaseModel):
    id: str
    agent: str | None = None  # Agent instance ID
    args: dict
    action_name: str
    action_type: str
    in_progress: bool
    is_complete: bool
    conditions: List[Any]
    transitions: List[Any]
    sprite_sheet: Spritesheet
    property_changes: List[Any]

    model_config = ConfigDict(alias_generator=to_camel)


class ActionGoTo(BaseAction):
    destination: dict


class ActionPropertyChangeSet(BaseAction):
    pass


class ActionInterval(BaseAction):
    start_frame: int
    interval_type: str


class ActionSpawnAgent(BaseModel):
    spawn_agent_placement: str


class ActionRemoveAgent(BaseModel):
    pass


class ActionTransition(BaseModel):
    pass


class PropertyChange(BaseModel):
    # NOTE: these are items that comprise the ActionPropertyChangeSet
    id: str
    agent: str | None = None
    property: str
    change: str
    value: str | bool | int | float
    target: dict | str | None = None
    agent_type: str | None = None
    agent_choice_method: str | None = None
    action_id: str

    model_config = ConfigDict(alias_generator=to_camel)


class Scene(BaseModel):
    id: str
    resource: str = "scene"
    name: str
    data: dict

    created_at: int
    last_modified: int

    model_config = ConfigDict(alias_generator=to_camel)


class Sensor(BaseModel):
    name: str | None = None
    type: str  # e.g. "spatial"
    range_type: str  # e.g. "circle"
    radius: float
    sample_interval: float

    model_config = ConfigDict(alias_generator=to_camel)


class UserSignup(BaseModel):
    username: str
    password: str
    email: str

    model_config = ConfigDict(alias_generator=to_camel)
