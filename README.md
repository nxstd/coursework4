# Digital Card Platform

Digital Card Platform is a portfolio web application for creating, editing, publishing, and sharing digital business cards. It combines a typed Next.js interface with a FastAPI REST API, persistent PostgreSQL storage, reproducible Alembic migrations, and automated test and build checks.

## Features

- Create, browse, update, and delete digital business cards.
- Publish a card at a stable, unique slug such as `/v/alex-morgan`.
- Add ordered social links to each card.
- Search and manage cards from a responsive web interface.
- Share public profiles with a generated QR code and copyable URL.
- Return consistent API validation, conflict, and not-found responses.
- Explore the API through generated Swagger UI and ReDoc documentation.

## Technology Stack

| Area | Technology |
| --- | --- |
| Backend | Python 3.13, FastAPI, SQLModel, SQLAlchemy |
| Database | PostgreSQL 17, Psycopg 3; SQLite for fast local tests |
| Migrations | Alembic |
| Frontend | Next.js 16 App Router, React 19, TypeScript, Tailwind CSS |
| Testing | pytest, FastAPI TestClient, Vitest, Testing Library |
| Quality | Ruff, ESLint, TypeScript compiler |
| Tooling | uv, npm, Docker Compose, GitHub Actions |

## Architecture

```mermaid
flowchart LR
    Browser["Browser"] --> Frontend["Next.js frontend"]
    Frontend --> Backend["FastAPI backend"]
    Backend --> Database["PostgreSQL"]
```

The frontend uses the public API URL in browser code and the internal Docker service URL in server-rendered code. FastAPI owns the REST contract and database sessions. SQLModel defines the relational metadata, while Alembic is the only schema-management mechanism used by the application runtime.

## Project Structure

```text
.
|-- client/                    # Next.js application and frontend tests
|   `-- src/
|       |-- app/               # App Router pages and routes
|       |-- components/        # Forms, card views, and shared UI
|       `-- lib/api.ts         # Typed REST client
|-- server/
|   |-- app/                   # FastAPI, settings, database, models, schemas
|   |-- migrations/            # Alembic environment and revisions
|   |-- tests/                 # Backend API tests
|   |-- alembic.ini
|   |-- pyproject.toml
|   `-- uv.lock
|-- .github/workflows/ci.yml   # Test, quality, build, and image workflow
|-- Dockerfile                 # Backend and frontend image targets
`-- docker-compose.yml         # Frontend, backend, and PostgreSQL services
```

## Domain Model

`BusinessCard` is the main entity. It has a generated string ID, a unique indexed slug, profile and contact fields, and UTC creation/update timestamps. A card owns zero or more `SocialLink` rows. Each social link references its card through a foreign key; deleting a card removes its links through ORM and database cascades.

```mermaid
erDiagram
    BusinessCard ||--o{ SocialLink : owns
    BusinessCard {
        string id PK
        string slug UK
        string fullName
        datetime createdAt
        datetime updatedAt
    }
    SocialLink {
        string id PK
        string businessCardId FK
        string platform
        string url
        string label
    }
```

## Requirements

For the containerized setup, install Docker with the Compose plugin. For local development, install Python 3.13, [uv](https://docs.astral.sh/uv/), and Node.js 26 with npm.

## Run with Docker Compose

No local `.env` file is required for the demonstration configuration. Optional overrides can be copied from `.env.example`.

```bash
docker compose up --build
```

Compose waits for PostgreSQL, starts the backend, applies `alembic upgrade head`, and then starts the frontend. The default URLs are:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:4000`
- Health check: `http://localhost:4000/api/health`
- Swagger UI: `http://localhost:4000/docs`
- ReDoc: `http://localhost:4000/redoc`

PostgreSQL is intentionally available only inside the Compose network. For local database inspection, use `docker compose exec postgres psql -U postgres -d digital_cards`. Stop the stack without deleting data with:

```bash
docker compose down
```

To remove the local demonstration database volume as well, run `docker compose down -v`.

## Local Backend Development

The default backend configuration uses SQLite, which keeps local setup short while exercising the same SQLModel layer:

```bash
cd server
uv sync
uv run alembic upgrade head
uv run fastapi dev app/main.py --host 0.0.0.0 --port 4000
```

To use a local PostgreSQL instance instead, set `DATABASE_URL` before running migrations and the server:

```env
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/digital_cards
```

Optional demonstration records can be loaded after migrations with `uv run python -m app.seed`.

## Local Frontend Development

From the repository root:

```bash
npm ci
npm run dev -w client
```

The defaults expect the API at `http://localhost:4000`. Override the URLs with values from `client/.env.example` when needed.

## Database Migrations

Alembic reads the same `DATABASE_URL` setting as FastAPI and imports the SQLModel metadata. Apply all migrations from the `server` directory:

```bash
uv run alembic upgrade head
```

Inspect the active revision with `uv run alembic current` and verify that model metadata does not require a new revision with `uv run alembic check`.

## Tests and Quality Checks

Backend tests use an isolated temporary SQLite database by default and leave no database file in the repository:

```bash
cd server
uv run pytest
uv run ruff check .
```

To exercise the suite against a migrated PostgreSQL test database, set both `DATABASE_URL` and `TEST_DATABASE_URL` to that dedicated database, run `uv run alembic upgrade head`, and then run pytest. Never point `TEST_DATABASE_URL` at a database containing valuable data because the fixture clears the two application tables.

Frontend checks run from the repository root:

```bash
npm run lint -w client
npm run typecheck -w client
npm run test -w client
npm run build -w client
```

Run all tests with `npm test` after both uv and npm dependencies are installed.

## API Overview

All successful entity responses use a `{ "data": ... }` envelope. Error responses use `{ "error": { "message": ... } }`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Service health check |
| `GET` | `/api/cards` | List cards |
| `POST` | `/api/cards` | Create a card and optional social links |
| `GET` | `/api/cards/{card_id}` | Read a card by ID |
| `PATCH` | `/api/cards/{card_id}` | Partially update a card |
| `DELETE` | `/api/cards/{card_id}` | Delete a card and its social links |
| `GET` | `/api/cards/slug/{slug}` | Read a public card by slug |

The interactive OpenAPI documentation at `/docs` contains request and response schemas for the complete contract.

## Environment Variables

| Variable | Used by | Description | Demonstration default |
| --- | --- | --- | --- |
| `DATABASE_URL` | Backend, Alembic | SQLAlchemy database URL | SQLite locally; PostgreSQL in Compose |
| `CLIENT_ORIGIN` | Backend | Allowed browser origin for CORS | `http://localhost:3000` |
| `PORT` / `BACKEND_PORT` | Backend | Internal API port | `4000` |
| `POSTGRES_DB` | Compose | PostgreSQL database name | `digital_cards` |
| `POSTGRES_USER` | Compose | PostgreSQL demonstration user | `postgres` |
| `POSTGRES_PASSWORD` | Compose | Local-only demonstration password | `postgres` |
| `INTERNAL_API_URL` | Frontend | API URL used during server rendering | `http://backend:4000` in Compose |
| `NEXT_PUBLIC_API_URL` | Frontend | API URL used in the browser | `http://localhost:4000` |
| `NEXT_PUBLIC_SITE_URL` | Frontend | Base URL for public card links | `http://localhost:3000` |

`.env` files are ignored by Git. The committed `.env.example` files contain local demonstration values only; use environment-specific secrets outside the repository for any deployed environment.

## Continuous Integration

The GitHub Actions workflow runs on pushes to the primary branch and on pull requests. It:

1. installs locked backend dependencies with uv;
2. starts a healthy PostgreSQL service container;
3. applies `alembic upgrade head` to an empty test database;
4. runs Ruff and the backend suite against PostgreSQL;
5. installs frontend dependencies with `npm ci`;
6. runs ESLint, TypeScript checks, Vitest, and the production Next.js build;
7. builds the frontend and backend container images after checks pass.

Image publishing remains available on pushes. The existing deployment job is opt-in and runs only when the repository variable `ENABLE_DEPLOYMENT` is set to `true` and its required GitHub secrets are configured.

## What I Implemented

- Designed and implemented the FastAPI CRUD API and stable error contract.
- Modelled cards and owned social links with SQLModel relationships, indexes, uniqueness, and cascades.
- Added centralized environment configuration compatible with PostgreSQL and SQLite.
- Replaced runtime table creation with a reviewed Alembic initial migration.
- Added a health-checked PostgreSQL Compose service and bounded database startup wait.
- Built isolated CRUD, validation, conflict, relationship, and not-found backend tests.
- Added PostgreSQL integration testing and frontend production builds to CI.
- Built the responsive Next.js management and public-card experience.

## Current Limitations

- Authentication, authorization, and per-user ownership are not implemented.
- Images are referenced by URL; the application does not upload or process files.
- The card list is not paginated and is intended for a portfolio-scale dataset.
- Public card analytics, custom domains, and advanced privacy controls are outside the current scope.

## Possible Next Improvements

- Add user accounts and ownership-aware authorization.
- Introduce cursor pagination and server-side search for larger datasets.
- Add object-storage-backed avatar uploads with validation.
- Add browser-level end-to-end tests for the primary create-and-share flow.
- Add accessibility auditing and localized English/Russian UI content.

This repository is a portfolio project and does not claim to represent a production deployment used by real customers.
