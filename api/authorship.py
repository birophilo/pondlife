"""Author fields on Mongo sim documents (maps from Postgres User)."""

from typing import Any


def author_fields_from_user(user: dict[str, Any]) -> dict[str, Any]:
    """Server-side author metadata for create; client cannot spoof (applied after body parse)."""
    return {
        "authorId": user.get("sim_user_id") or "pondlife",
        # Optional in schema; default label when username unknown matches authorId default.
        "authorUsername": user.get("username") or "pondlife",
    }


def apply_author_on_create(payload: dict[str, Any], user: dict[str, Any]) -> None:
    payload.update(author_fields_from_user(user))


def preserve_author_on_update(
    body: dict[str, Any], existing: dict[str, Any] | None
) -> None:
    """Keep original author when client omits fields on replace-style update."""
    if not existing:
        return
    body.setdefault("authorId", existing.get("authorId", "pondlife"))
    body.setdefault("authorUsername", existing.get("authorUsername", "pondlife"))
