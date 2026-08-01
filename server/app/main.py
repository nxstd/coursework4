import re
from datetime import UTC, datetime
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Response, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select

from app.config import settings
from app.database import get_session
from app.models import BusinessCard, SocialLink
from app.schemas import BusinessCardInput, BusinessCardRead, SocialLinkInput

SLUG_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


app = FastAPI(
    title="Digital Card Platform API",
    description="REST API for creating and publishing digital business cards.",
    version="1.0.0",
)
SessionDep = Annotated[Session, Depends(get_session)]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.client_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "digital-card-platform-api"}


@app.get("/api/cards")
def get_cards(session: SessionDep) -> dict[str, list[BusinessCardRead]]:
    cards = session.exec(
        select(BusinessCard)
        .options(selectinload(BusinessCard.socialLinks))
        .order_by(BusinessCard.createdAt.desc())
    ).all()
    return {"data": [BusinessCardRead.model_validate(card) for card in cards]}


@app.get("/api/cards/{card_id}")
def get_card(card_id: str, session: SessionDep) -> dict[str, BusinessCardRead]:
    card = find_card_by_id(session, card_id)
    return {"data": BusinessCardRead.model_validate(card)}


@app.get("/api/cards/slug/{slug}")
def get_card_by_slug(
    slug: str, session: SessionDep
) -> dict[str, BusinessCardRead]:
    card = find_card_by_slug(session, slug)
    return {"data": BusinessCardRead.model_validate(card)}


@app.post("/api/cards", status_code=status.HTTP_201_CREATED)
def create_card(
    payload: BusinessCardInput, session: SessionDep
) -> dict[str, BusinessCardRead]:
    slug = valid_slug(payload.slug)
    full_name = required_string(payload.fullName, "fullName")
    ensure_slug_available(session, slug)

    card = BusinessCard(
        slug=slug,
        fullName=full_name,
        jobTitle=optional_string(payload.jobTitle, "jobTitle"),
        company=optional_string(payload.company, "company"),
        bio=optional_string(payload.bio, "bio"),
        email=optional_string(payload.email, "email"),
        phone=optional_string(payload.phone, "phone"),
        website=optional_string(payload.website, "website"),
        location=optional_string(payload.location, "location"),
        avatarUrl=optional_string(payload.avatarUrl, "avatarUrl"),
    )
    card.socialLinks = build_social_links(payload.socialLinks)

    session.add(card)
    commit_or_conflict(session)
    session.refresh(card)
    return {"data": BusinessCardRead.model_validate(card)}


@app.patch("/api/cards/{card_id}")
def update_card(
    card_id: str, payload: BusinessCardInput, session: SessionDep
) -> dict[str, BusinessCardRead]:
    card = find_card_by_id(session, card_id)

    update_fields = {
        "slug": payload.slug,
        "fullName": payload.fullName,
        "jobTitle": payload.jobTitle,
        "company": payload.company,
        "bio": payload.bio,
        "email": payload.email,
        "phone": payload.phone,
        "website": payload.website,
        "location": payload.location,
        "avatarUrl": payload.avatarUrl,
    }

    for field_name, value in update_fields.items():
        # PATCH should only touch fields that were present in the request body.
        if field_name not in payload.model_fields_set:
            continue

        if field_name in {"slug", "fullName"}:
            if field_name == "slug":
                slug = valid_slug(value)
                ensure_slug_available(session, slug, current_card_id=card.id)
                setattr(card, field_name, slug)
            else:
                setattr(card, field_name, required_string(value, field_name))
        else:
            setattr(card, field_name, optional_string(value, field_name))

    if payload.socialLinks is not None:
        card.socialLinks = build_social_links(payload.socialLinks)

    card.updatedAt = datetime.now(UTC)
    session.add(card)
    commit_or_conflict(session)
    session.refresh(card)
    return {"data": BusinessCardRead.model_validate(card)}


@app.delete("/api/cards/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_card(card_id: str, session: SessionDep) -> Response:
    card = find_card_by_id(session, card_id)
    session.delete(card)
    session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.exception_handler(HTTPException)
def http_exception_handler(_request, exc: HTTPException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"message": exc.detail}},
    )


@app.exception_handler(RequestValidationError)
def validation_exception_handler(_request, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"error": {"message": "Invalid request body", "details": exc.errors()}},
    )


def find_card_by_id(session: Session, card_id: str) -> BusinessCard:
    card = session.exec(
        select(BusinessCard)
        .options(selectinload(BusinessCard.socialLinks))
        .where(BusinessCard.id == card_id)
    ).first()
    if card is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Business card not found")
    return card


def find_card_by_slug(session: Session, slug: str) -> BusinessCard:
    card = session.exec(
        select(BusinessCard)
        .options(selectinload(BusinessCard.socialLinks))
        .where(BusinessCard.slug == slug)
    ).first()
    if card is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Business card not found")
    return card


def ensure_slug_available(
    session: Session, slug: str, current_card_id: str | None = None
) -> None:
    existing = session.exec(select(BusinessCard).where(BusinessCard.slug == slug)).first()
    if existing is not None and existing.id != current_card_id:
        raise HTTPException(status.HTTP_409_CONFLICT, "Slug is already in use")


def build_social_links(values: list[SocialLinkInput | dict] | None) -> list[SocialLink]:
    if values is None:
        return []

    links: list[SocialLink] = []
    for value in values:
        # Seed data passes dictionaries, API requests pass Pydantic models.
        platform_value = value["platform"] if isinstance(value, dict) else value.platform
        url_value = value["url"] if isinstance(value, dict) else value.url
        label_value = value.get("label") if isinstance(value, dict) else value.label

        platform = required_string(platform_value, "socialLinks.platform")
        url = required_string(url_value, "socialLinks.url")
        links.append(
            SocialLink(
                platform=platform,
                url=url,
                label=optional_string(label_value, "socialLinks.label"),
            )
        )
    return links


def required_string(value: str | None, field_name: str) -> str:
    if value is None or not isinstance(value, str):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"{field_name} is required")

    trimmed = value.strip()
    if trimmed == "":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"{field_name} is required")
    return trimmed


def valid_slug(value: str | None) -> str:
    slug = required_string(value, "slug").lower()
    if SLUG_PATTERN.fullmatch(slug) is None:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "slug may contain only latin letters, digits and hyphens",
        )
    return slug


def optional_string(value: str | None, field_name: str) -> str | None:
    if value is None:
        return None
    if not isinstance(value, str):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"{field_name} must be a string")

    trimmed = value.strip()
    return trimmed or None


def commit_or_conflict(session: Session) -> None:
    try:
        session.commit()
    except IntegrityError as error:
        session.rollback()
        # The database unique index is the final guard against concurrent slug writes.
        raise HTTPException(status.HTTP_409_CONFLICT, "Slug is already in use") from error
