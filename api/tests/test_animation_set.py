import pytest


animation_set_1_post = {
  "name": "Customer",
  "sheets": {
    "idle": "677b3381024c92f6b532eff8",
    "up": "677b3299024c92f6b532efe8",
    "upRight": "677b32c1024c92f6b532efec",
    "right": "677b32e9024c92f6b532eff0",
    "downRight": "677b3370024c92f6b532eff6",
    "down": "677b335e024c92f6b532eff4",
    "downLeft": "677b3347024c92f6b532eff2",
    "left": "677b32d3024c92f6b532efee",
    "upLeft": "677b32ad024c92f6b532efea"
  },
  "offset": {"x": 96, "y": 46},
  "scale": 0.7
}


animation_set_1_response = {
  "name": "Customer",
  "sheets": {
    "idle": "677b3381024c92f6b532eff8",
    "up": "677b3299024c92f6b532efe8",
    "upRight": "677b32c1024c92f6b532efec",
    "right": "677b32e9024c92f6b532eff0",
    "downRight": "677b3370024c92f6b532eff6",
    "down": "677b335e024c92f6b532eff4",
    "downLeft": "677b3347024c92f6b532eff2",
    "left": "677b32d3024c92f6b532efee",
    "upLeft": "677b32ad024c92f6b532efea"
  },
  "offset": {"x": 96, "y": 46},
  "scale": 0.7
}


@pytest.fixture(scope="module")
def test_animation_set_id(test_app):
    """
    Create an item in the test database for the given API endpoint and object
    e.g. "/animationSets" and AnimationSet.
    Then 'yield' the ID returned by the create operation so it can be used by
    other tests, i.e. read and update endpoint with the same ID. Then after
    those tests complete, the remainder of this function will execute, testing
    the delete endpoint for the given resource.
    """
    resp = test_app.post("/animationSets", json=animation_set_1_post)

    created_item = resp.json()
    item_id = created_item.pop("id")
    assert type(item_id) == str
    assert len(item_id) == 24
    assert resp.status_code == 201
    assert created_item == animation_set_1_response

    yield item_id

    # test delete (all fixtures will be deleted after testing regardless)
    delete_response = test_app.delete(f"/animationSet/{item_id}")
    assert delete_response.status_code == 204


def test_get_animation_set(test_app, test_animation_set_id):
    resp = test_app.get(f"/animationSet/{test_animation_set_id}")
    item = resp.json()
    item.pop("id")
    assert item == animation_set_1_response


def test_update_animation_set(test_app, test_animation_set_id):
    updated_item = {
        **animation_set_1_post,
        "id": test_animation_set_id,
        "name": "AlternativeCustomer"
    }
    resp = test_app.put(f"/animationSet/{test_animation_set_id}", json=updated_item)
    assert resp.status_code == 200
    assert resp.json()["name"] == "AlternativeCustomer"
