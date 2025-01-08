from typing import Optional

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class Condition(BaseModel):
    id: str
    name: str
    condition_type: str
    comparison: str
    # unify property and class_method into 'prop'?
    property: Optional[str]
    class_method: Optional[str]
    condition_value: str | bool | int | float

    model_config = ConfigDict(alias_generator=to_camel)
