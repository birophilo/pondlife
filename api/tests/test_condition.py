def test_condition(test_app):
    conditions = test_app.get("/conditions")
    print(conditions.json())
    assert conditions is not None
