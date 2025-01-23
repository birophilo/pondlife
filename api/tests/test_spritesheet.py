import pytest


spritesheet_1_post = {
    "name": "SomeCustomerWalkUp",
    "src": "/img/sprites/GirlSample_Walk_Up.png",
    "columns": 4,
    "rows": 3,
    "numImages": 9,
    "refreshInterval": 3
}


spritesheet_1_response = {
    "name": "SomeCustomerWalkUp",
    "src": "/img/sprites/GirlSample_Walk_Up.png",
    "columns": 4,
    "rows": 3,
    "numImages": 9,
    "refreshInterval": 3
}


@pytest.fixture(scope="module")
def test_spritesheet_id(test_app):
    """
    Create an item in the test database for the given API endpoint and object
    e.g. "/spritesheets" and Spritesheet.
    Then 'yield' the ID returned by the create operation so it can be used by
    other tests, i.e. read and update endpoint with the same ID. Then after
    those tests complete, the remainder of this function will execute, testing
    the delete endpoint for the given resource.
    """
    resp = test_app.post("/spritesheets", json=spritesheet_1_post)

    created_item = resp.json()
    item_id = created_item.pop("id")
    assert type(item_id) == str
    assert len(item_id) == 24
    assert resp.status_code == 201
    assert created_item == spritesheet_1_response

    yield item_id

    # test delete (all fixtures will be deleted after testing regardless)
    delete_response = test_app.delete(f"/spritesheet/{item_id}")
    assert delete_response.status_code == 204


def test_get_spritesheet(test_app, test_spritesheet_id):
    resp = test_app.get(f"/spritesheet/{test_spritesheet_id}")
    item = resp.json()
    item.pop("id")
    assert item == spritesheet_1_response


def test_update_spritesheet(test_app, test_spritesheet_id):
    updated_item = {
        **spritesheet_1_post,
        "id": test_spritesheet_id,
        "name": "SomeCustomerWalkSomewhere"
    }
    resp = test_app.put(f"/spritesheet/{test_spritesheet_id}", json=updated_item)
    assert resp.status_code == 200
    assert resp.json()["name"] == "SomeCustomerWalkSomewhere"
