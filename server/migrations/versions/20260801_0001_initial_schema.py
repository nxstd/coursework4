"""Create the initial digital card schema.

Revision ID: 20260801_0001
Revises:
Create Date: 2026-08-01 00:00:00
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260801_0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "BusinessCard",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("slug", sa.String(), nullable=False),
        sa.Column("fullName", sa.String(), nullable=False),
        sa.Column("jobTitle", sa.String(), nullable=True),
        sa.Column("company", sa.String(), nullable=True),
        sa.Column("bio", sa.String(), nullable=True),
        sa.Column("email", sa.String(), nullable=True),
        sa.Column("phone", sa.String(), nullable=True),
        sa.Column("website", sa.String(), nullable=True),
        sa.Column("location", sa.String(), nullable=True),
        sa.Column("avatarUrl", sa.String(), nullable=True),
        sa.Column("createdAt", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updatedAt", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_BusinessCard_createdAt"),
        "BusinessCard",
        ["createdAt"],
        unique=False,
    )
    op.create_index(
        op.f("ix_BusinessCard_slug"),
        "BusinessCard",
        ["slug"],
        unique=True,
    )
    op.create_table(
        "SocialLink",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("platform", sa.String(), nullable=False),
        sa.Column("url", sa.String(), nullable=False),
        sa.Column("label", sa.String(), nullable=True),
        sa.Column("businessCardId", sa.String(), nullable=False),
        sa.Column("createdAt", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updatedAt", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["businessCardId"],
            ["BusinessCard.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_SocialLink_businessCardId"),
        "SocialLink",
        ["businessCardId"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_SocialLink_businessCardId"), table_name="SocialLink")
    op.drop_table("SocialLink")
    op.drop_index(op.f("ix_BusinessCard_slug"), table_name="BusinessCard")
    op.drop_index(op.f("ix_BusinessCard_createdAt"), table_name="BusinessCard")
    op.drop_table("BusinessCard")
