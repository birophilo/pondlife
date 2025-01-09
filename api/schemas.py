from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class Condition(BaseModel):
    id: str
    name: str
    condition_type: str
    comparison: str
    # unify property and class_method into 'prop'?
    property: str | None = None
    class_method: str | None = None
    condition_value: str | bool | int | float

    model_config = ConfigDict(alias_generator=to_camel)


class Spritesheet(BaseModel):
    id: str
    name: str
    src: str
    columns: int
    rows: int
    num_images: int
    refresh_interval: int

    model_config = ConfigDict(alias_generator=to_camel)
