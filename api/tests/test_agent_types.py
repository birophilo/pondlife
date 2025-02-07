import pytest


agent_type_1_post = {
  "name": "someAgent",
  "width": 30,
  "height": 40,
  "offset": {"x": 96, "y": 46},
  "scale": 0.7,
  "nominalSpeed": 0.02,
  "previewImage": "/img/thumbnails/customer-thumbnail.png",
  "animationSet": None,
  "thumbnail": "/img/thumbnails/customer-thumbnail.png"
}


agent_type_1_response = {
  "name": "someAgent",
  "width": 30,
  "height": 40,
  "offset": {"x": 96, "y": 46},
  "scale": 0.7,
  "nominalSpeed": 0.02,
  "previewImage": "/img/thumbnails/customer-thumbnail.png",
  "animationSet": None,
  "thumbnail": "/img/thumbnails/customer-thumbnail.png"
}


@pytest.fixture(scope="module")
def test_agent_type_id(test_app):
    """
    Create an item in the test database for the given API endpoint and object
    e.g. "/agentTypes" and AgentType.
    Then 'yield' the ID returned by the create operation so it can be used by
    other tests, i.e. read and update endpoint with the same ID. Then after
    those tests complete, the remainder of this function will execute, testing
    the delete endpoint for the given resource.
    """
    resp = test_app.post("/agentTypes", json=agent_type_1_post)

    created_item = resp.json()
    item_id = created_item.pop("id")
    assert type(item_id) == str
    assert len(item_id) == 24
    assert resp.status_code == 201
    assert created_item == agent_type_1_response

    yield item_id

    # test delete (all fixtures will be deleted after testing regardless)
    delete_response = test_app.delete(f"/agentType/{item_id}")
    assert delete_response.status_code == 204


def test_get_agent_type(test_app, test_agent_type_id):
    resp = test_app.get(f"/agentType/{test_agent_type_id}")
    item = resp.json()
    item.pop("id")
    assert item == agent_type_1_response


def test_update_agent_type(test_app, test_agent_type_id):
    updated_item = {
        **agent_type_1_post,
        "id": test_agent_type_id,
        "name": "someOtherAgent"
    }
    resp = test_app.put(f"/agentType/{test_agent_type_id}", json=updated_item)
    assert resp.status_code == 200
    assert resp.json()["name"] == "someOtherAgent"
