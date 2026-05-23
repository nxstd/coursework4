from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class SocialLinkInput(BaseModel):
    platform: str
    url: str
    label: str | None = None


class BusinessCardInput(BaseModel):
    slug: str | None = None
    fullName: str | None = None
    jobTitle: str | None = None
    company: str | None = None
    bio: str | None = None
    email: str | None = None
    phone: str | None = None
    website: str | None = None
    location: str | None = None
    avatarUrl: str | None = None
    socialLinks: list[SocialLinkInput] | None = None


class SocialLinkRead(BaseModel):
    id: str
    platform: str
    url: str
    label: str | None
    businessCardId: str
    createdAt: datetime
    updatedAt: datetime

    model_config = ConfigDict(from_attributes=True)


class BusinessCardRead(BaseModel):
    id: str
    slug: str
    fullName: str
    jobTitle: str | None
    company: str | None
    bio: str | None
    email: str | None
    phone: str | None
    website: str | None
    location: str | None
    avatarUrl: str | None
    socialLinks: list[SocialLinkRead] = Field(default_factory=list)
    createdAt: datetime
    updatedAt: datetime

    model_config = ConfigDict(from_attributes=True)


class ApiData(BaseModel):
    data: BusinessCardRead | list[BusinessCardRead]

