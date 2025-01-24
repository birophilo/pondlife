import pytest

from schemas import (
    AgentProperty,
    AgentType,
    AnimationSet,
    Condition,
    PropertyChange,
    Spritesheet
)


resource_list = [
    {"endpoint": "/conditions", "pydantic_class": Condition},
    {"endpoint": "/spritesheets", "pydantic_class": Spritesheet},
    {"endpoint": "/animationSets", "pydantic_class": AnimationSet},
    {"endpoint": "/agentTypes", "pydantic_class": AgentType},
    # {"endpoint": "/actions", "pydantic_class": Action},
    # {"endpoint": "/agents", "pydantic_class": Agent},
    {"endpoint": "/agentProperties", "pydantic_class": AgentProperty},
    {"endpoint": "/propertyChanges", "pydantic_class": PropertyChange},
]


@pytest.mark.parametrize("fixture", resource_list)
def test_list_items(test_app, fixture):
    """
    Test that list resource endpoint items can be converted into Pydantic objects,
    i.e. that objects serialized from different Pydantic classes were served from API.
    e.g. test_list_items("/conditions", Condition)
    """
    resp = test_app.get(fixture["endpoint"])
    payload_objects = resp.json()

    items = [fixture["pydantic_class"](**item) for item in payload_objects]

    assert items
