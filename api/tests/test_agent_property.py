import pytest


agent_property_1_post = {
  "name": "money",
  "valueType": "int",
  "initialValue": 100,
  "applyTo": "agentType",
  "agentTypes": ["customer"],
  "description": "customer money"
}


agent_property_1_response = {
  "name": "money",
  "valueType": "int",
  "initialValue": 100,
  "applyTo": "agentType",
  "agentTypes": ["customer"],
  "description": "customer money"
}


@pytest.fixture(scope="module")
def test_agent_property_id(test_app):
    """
    Create an item in the test database for the given API endpoint and object
    e.g. "/agentProperties" and AgentProperty.
    Then 'yield' the ID returned by the create operation so it can be used by
    other tests, i.e. read and update endpoint with the same ID. Then after
    those tests complete, the remainder of this function will execute, testing
    the delete endpoint for the given resource.
    """
    resp = test_app.post("/agentProperties", json=agent_property_1_post)

    created_item = resp.json()
    item_id = created_item.pop("id")
    assert type(item_id) == str
    assert len(item_id) == 24
    assert resp.status_code == 201
    assert created_item == agent_property_1_response

    yield item_id

    # test delete (all fixtures will be deleted after testing regardless)
    delete_response = test_app.delete(f"/agentProperty/{item_id}")
    assert delete_response.status_code == 204


def test_get_agent_property(test_app, test_agent_property_id):
    resp = test_app.get(f"/agentProperty/{test_agent_property_id}")
    item = resp.json()
    item.pop("id")
    assert item == agent_property_1_response


def test_update_agent_property(test_app, test_agent_property_id):
    updated_item = {
        **agent_property_1_post,
        "id": test_agent_property_id,
        "name": "someOtherAgent"
    }
    resp = test_app.put(f"/agentProperty/{test_agent_property_id}", json=updated_item)
    assert resp.status_code == 200
    assert resp.json()["name"] == "someOtherAgent"
