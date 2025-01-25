import pytest


action_1_go_to_post = {
  "agent": None,
  "actionName": "go to shop",
  "actionType": "goTo",
  "inProgress": False,
  "isComplete": False,
  "conditions": [],
  "transitions": [],
  "agentType": {
    "name": "lemonadeStall",
    "width": 130,
    "height": 104,
    "offset": {
      "x": 0,
      "y": 0
    },
    "scale": 1,
    "nominalSpeed": 0.02,
    "previewImage": "/img/sprites/stall-1.png",
    "animationSet": None,
    "thumbnail": "/img/thumbnails/lemonade-stall-thumbnail.png",
    "id": "677b31b1024c92f6b532efe0"
  },
  "destinationType": "agent",
  "agentChoiceMethod": "nearest",
  "target": {}
}


action_1_go_to_response = {
  "agent": None,
  "actionName": "go to shop",
  "actionType": "goTo",
  "inProgress": False,
  "isComplete": False,
  "conditions": [],
  "transitions": [],
  "agentType": {
    "name": "lemonadeStall",
    "width": 130,
    "height": 104,
    "offset": {
      "x": 0,
      "y": 0
    },
    "scale": 1,
    "nominalSpeed": 0.02,
    "previewImage": "/img/sprites/stall-1.png",
    "animationSet": None,
    "thumbnail": "/img/thumbnails/lemonade-stall-thumbnail.png",
    "id": "677b31b1024c92f6b532efe0"
  },
  "destinationType": "agent",
  "agentChoiceMethod": "nearest",
  "target": {}
}


action_1_property_changes_post = {
  "agent": None,
  "actionName": "pay",
  "actionType": "change",
  "inProgress": None,
  "isComplete": None,
  "conditions": [],
  "transitions": [],
  "propertyChanges": []
}


action_1_property_changes_response = {
  "agent": None,
  "actionName": "pay",
  "actionType": "change",
  "inProgress": None,
  "isComplete": None,
  "conditions": [],
  "transitions": [],
  "propertyChanges": []
}


action_1_interval_post = {
  "agent": None,
  "actionName": "pause a bit",
  "actionType": "interval",
  "inProgress": False,
  "isComplete": False,
  "conditions": [],
  "transitions": [],
  "spriteSheet": "",
  "duration": 50
}


action_1_interval_response = {
  "agent": None,
  "actionName": "pause a bit",
  "actionType": "interval",
  "inProgress": False,
  "isComplete": False,
  "conditions": [],
  "transitions": [],
  "spriteSheet": "",
  "duration": 50
}


@pytest.fixture(scope="module")
def test_action_go_to_id(test_app):
    """
    Create an item in the test database for the given API endpoint and object
    e.g. "/agentProperties" and AgentProperty.
    Then 'yield' the ID returned by the create operation so it can be used by
    other tests, i.e. read and update endpoint with the same ID. Then after
    those tests complete, the remainder of this function will execute, testing
    the delete endpoint for the given resource.
    """
    resp = test_app.post("/actions", json=action_1_go_to_post)

    created_item = resp.json()
    item_id = created_item.pop("id")
    assert type(item_id) == str
    assert len(item_id) == 24
    assert resp.status_code == 201
    assert created_item == action_1_go_to_response

    yield item_id

    # test delete (all fixtures will be deleted after testing regardless)
    delete_response = test_app.delete(f"/action/{item_id}")
    assert delete_response.status_code == 204


def test_get_action_go_to(test_app, test_action_go_to_id):
    resp = test_app.get(f"/action/{test_action_go_to_id}")
    item = resp.json()
    item.pop("id")
    assert item == action_1_go_to_response


def test_update_action_go_to(test_app, test_action_go_to_id):
    updated_item = {
        **action_1_go_to_post,
        "id": test_action_go_to_id,
        "actionName": "anotherAction"
    }
    resp = test_app.put(f"/action/{test_action_go_to_id}", json=updated_item)
    assert resp.status_code == 200
    assert resp.json()["actionName"] == "anotherAction"
