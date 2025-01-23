import pytest


property_change_1_post = {
  "agent": None,
  "property": "onions",
  "change": "decrease",
  "value": 5,
  "target": "",
  "agentType": "self",
  "agentChoiceMethod": "nearest",
  "actionId": "678b3310fff047ac9c26fd8c"
}


property_change_1_response = {
  "agent": None,
  "property": "onions",
  "change": "decrease",
  "value": 5,
  "target": "",
  "agentType": "self",
  "agentChoiceMethod": "nearest",
  "actionId": "678b3310fff047ac9c26fd8c"
}


@pytest.fixture(scope="module")
def test_property_change_id(test_app):
    """
    Create an item in the test database for the given API endpoint and object
    e.g. "/propertyChanges" and PropertyChange.
    Then 'yield' the ID returned by the create operation so it can be used by
    other tests, i.e. read and update endpoint with the same ID. Then after
    those tests complete, the remainder of this function will execute, testing
    the delete endpoint for the given resource.
    """
    resp = test_app.post("/propertyChanges", json=property_change_1_post)

    created_item = resp.json()
    item_id = created_item.pop("id")
    assert type(item_id) == str
    assert len(item_id) == 24
    assert resp.status_code == 201
    assert created_item == property_change_1_response

    yield item_id

    # test delete (all fixtures will be deleted after testing regardless)
    delete_response = test_app.delete(f"/propertyChange/{item_id}")
    assert delete_response.status_code == 204


def test_get_property_change(test_app, test_property_change_id):
    resp = test_app.get(f"/propertyChange/{test_property_change_id}")
    item = resp.json()
    item.pop("id")
    assert item == property_change_1_response


def test_update_property_change(test_app, test_property_change_id):
    updated_item = {
        **property_change_1_post,
        "id": test_property_change_id,
        "value": 7
    }
    resp = test_app.put(f"/propertyChange/{test_property_change_id}", json=updated_item)
    assert resp.status_code == 200
    assert resp.json()["value"] == 7
