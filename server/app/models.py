from datetime import UTC, datetime
from uuid import uuid4

from sqlalchemy import DateTime
from sqlmodel import Field, Relationship, SQLModel


def new_id() -> str:
    return uuid4().hex


def now() -> datetime:
    return datetime.now(UTC)


class SocialLink(SQLModel, table=True):
    __tablename__ = "SocialLink"

    id: str = Field(default_factory=new_id, primary_key=True)
    platform: str
    url: str
    label: str | None = None
    businessCardId: str = Field(
        foreign_key="BusinessCard.id",
        index=True,
        ondelete="CASCADE",
    )
    createdAt: datetime = Field(default_factory=now, sa_type=DateTime(timezone=True))
    updatedAt: datetime = Field(default_factory=now, sa_type=DateTime(timezone=True))

    businessCard: "BusinessCard" = Relationship(back_populates="socialLinks")


class BusinessCard(SQLModel, table=True):
    __tablename__ = "BusinessCard"

    id: str = Field(default_factory=new_id, primary_key=True)
    slug: str = Field(index=True, unique=True)
    fullName: str
    jobTitle: str | None = None
    company: str | None = None
    bio: str | None = None
    email: str | None = None
    phone: str | None = None
    website: str | None = None
    location: str | None = None
    avatarUrl: str | None = None
    createdAt: datetime = Field(
        default_factory=now,
        index=True,
        sa_type=DateTime(timezone=True),
    )
    updatedAt: datetime = Field(default_factory=now, sa_type=DateTime(timezone=True))

    socialLinks: list[SocialLink] = Relationship(
        back_populates="businessCard",
        sa_relationship_kwargs={
            "cascade": "all, delete-orphan",
            "order_by": "SocialLink.createdAt",
        },
    )

