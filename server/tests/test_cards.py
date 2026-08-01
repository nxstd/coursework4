import os
from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import delete
from sqlmodel import Session, SQLModel, create_engine

from app.database import get_session
from app.main import app
from app.models import BusinessCard, SocialLink


@pytest.fixture()
def client(tmp_path) -> Generator[TestClient]:
    database_url = os.environ.get("TEST_DATABASE_URL")
    if database_url:
        engine = create_engine(database_url)
        with Session(engine) as session:
            session.exec(delete(SocialLink))
            session.exec(delete(BusinessCard))
            session.commit()
    else:
        engine = create_engine(
            f"sqlite:///{tmp_path / 'test.db'}",
            connect_args={"check_same_thread": False},
        )
        SQLModel.metadata.create_all(engine)

    def override_session() -> Generator[Session]:
        with Session(engine) as session:
            yield session

    app.dependency_overrides[get_session] = override_session
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
    if database_url:
        with Session(engine) as session:
            session.exec(delete(SocialLink))
            session.exec(delete(BusinessCard))
            session.commit()
    engine.dispose()


def test_get_cards_returns_business_cards(client: TestClient) -> None:
    client.post("/api/cards", json={"slug": "jordan-lee", "fullName": "Jordan Lee"})
    client.post("/api/cards", json={"slug": "mira-stone", "fullName": "Mira Stone"})

    response = client.get("/api/cards")

    assert response.status_code == 200
    names = sorted(card["fullName"] for card in response.json()["data"])
    assert names == ["Jordan Lee", "Mira Stone"]


def test_post_cards_creates_business_card_with_social_links(client: TestClient) -> None:
    response = client.post(
        "/api/cards",
        json={
            "slug": "jordan-lee",
            "fullName": "Jordan Lee",
            "jobTitle": "Founder",
            "socialLinks": [{"platform": "linkedin", "url": "https://linkedin.com/in/jordanlee"}],
        },
    )

    body = response.json()
    assert response.status_code == 201
    assert body["data"]["slug"] == "jordan-lee"
    assert body["data"]["socialLinks"][0]["platform"] == "linkedin"


def test_get_card_by_slug_returns_business_card(client: TestClient) -> None:
    created = client.post(
        "/api/cards",
        json={"slug": "mira-stone", "fullName": "Mira Stone"},
    ).json()

    response = client.get("/api/cards/slug/mira-stone")

    assert response.status_code == 200
    assert response.json()["data"]["id"] == created["data"]["id"]


def test_get_card_by_id_returns_business_card(client: TestClient) -> None:
    created = client.post(
        "/api/cards",
        json={"slug": "riley-park", "fullName": "Riley Park"},
    ).json()["data"]

    response = client.get(f"/api/cards/{created['id']}")

    assert response.status_code == 200
    assert response.json()["data"]["slug"] == "riley-park"


def test_patch_and_delete_card(client: TestClient) -> None:
    created = client.post("/api/cards", json={"slug": "casey-ng", "fullName": "Casey Ng"}).json()
    card_id = created["data"]["id"]

    updated = client.patch(
        f"/api/cards/{card_id}",
        json={
            "company": "Signal Works",
            "socialLinks": [{"platform": "github", "url": "https://github.com/caseyng"}],
        },
    )
    deleted = client.delete(f"/api/cards/{card_id}")
    missing = client.get(f"/api/cards/{card_id}")

    assert updated.status_code == 200
    assert updated.json()["data"]["company"] == "Signal Works"
    assert deleted.status_code == 204
    assert missing.status_code == 404


def test_validation_and_conflict_errors(client: TestClient) -> None:
    invalid = client.post("/api/cards", json={"slug": "", "fullName": "No Slug"})
    invalid_slug = client.post("/api/cards", json={"slug": "bad slug", "fullName": "Bad Slug"})
    client.post("/api/cards", json={"slug": "unique-card", "fullName": "Unique Card"})
    duplicate = client.post(
        "/api/cards",
        json={"slug": "unique-card", "fullName": "Duplicate Card"},
    )

    assert invalid.status_code == 400
    assert invalid.json()["error"]["message"] == "slug is required"
    assert invalid_slug.status_code == 400
    assert invalid_slug.json()["error"]["message"] == (
        "slug may contain only latin letters, digits and hyphens"
    )
    assert duplicate.status_code == 409
    assert duplicate.json()["error"]["message"] == "Slug is already in use"


def test_missing_card_operations_return_not_found(client: TestClient) -> None:
    missing_get = client.get("/api/cards/missing-id")
    missing_update = client.patch("/api/cards/missing-id", json={"company": "Acme"})
    missing_delete = client.delete("/api/cards/missing-id")

    assert missing_get.status_code == 404
    assert missing_update.status_code == 404
    assert missing_delete.status_code == 404


def test_update_rejects_duplicate_slug(client: TestClient) -> None:
    client.post("/api/cards", json={"slug": "first-card", "fullName": "First Card"})
    second = client.post(
        "/api/cards",
        json={"slug": "second-card", "fullName": "Second Card"},
    ).json()["data"]

    response = client.patch(f"/api/cards/{second['id']}", json={"slug": "first-card"})

    assert response.status_code == 409
    assert response.json()["error"]["message"] == "Slug is already in use"
