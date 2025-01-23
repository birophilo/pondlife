import pytest


condition_1_post = {
    "conditionType": "preset",
    "name": "is complete",
    "classMethod": "actionIsComplete",
    "comparison": "isIdentical",
    "conditionValue": True
}


condition_1_response = {
    "name": "is complete",
    "conditionType": "preset",
    "comparison": "isIdentical",
    "property": None,
    "classMethod": "actionIsComplete",
    "conditionValue": True
}


@pytest.fixture(scope="module")
def test_condition_id(test_app):
    """
    Create an item in the test database for the given API endpoint and object
    e.g. "/conditions" and Condition.
    Then 'yield' the ID returned by the create operation so it can be used by
    other tests, i.e. read and update endpoint with the same ID. Then after
    those tests complete, the remainder of this function will execute, testing
    the delete endpoint for the given resource.
    """
    resp = test_app.post("/conditions", json=condition_1_post)

    created_item = resp.json()
    item_id = created_item.pop("id")
    assert type(item_id) == str
    assert len(item_id) == 24
    assert resp.status_code == 201
    assert created_item == condition_1_response

    yield item_id

    # test delete (all fixtures will be deleted after testing regardless)
    delete_response = test_app.delete(f"/condition/{item_id}")
    assert delete_response.status_code == 204


def test_get_condition(test_app, test_condition_id):
    resp = test_app.get(f"/condition/{test_condition_id}")
    item = resp.json()
    item.pop("id")
    assert item == condition_1_response


def test_update_condition(test_app, test_condition_id):
    updated_item = {
        **condition_1_post,
        "id": test_condition_id,
        "name": "something else"
    }
    resp = test_app.put(f"/condition/{test_condition_id}", json=updated_item)
    assert resp.status_code == 200
    assert resp.json()["name"] == "something else"
