# syntax=docker/dockerfile:1

FROM ghcr.io/astral-sh/uv:python3.14-alpine AS server
WORKDIR /app/server

ENV PYTHONUNBUFFERED=1
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy
ENV PATH="/app/server/.venv/bin:${PATH}"
ENV DATABASE_URL=sqlite:////data/prod.db
ENV CLIENT_ORIGIN=http://localhost:3000
ENV PORT=4000

COPY server/pyproject.toml server/uv.lock ./
RUN uv sync --frozen --no-dev

COPY server/app app

EXPOSE 4000
CMD ["sh", "-c", "python -m app.migrate && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-4000}"]

FROM node:alpine AS client-build
WORKDIR /app

COPY package*.json ./
COPY client/package.json client/package.json
RUN npm ci

COPY client client

ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV INTERNAL_API_URL=http://server:4000

RUN npm run build -w client

FROM node:alpine AS client
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=client-build /app/client/.next/standalone ./
COPY --from=client-build /app/client/.next/static client/.next/static

EXPOSE 3000
CMD ["node", "client/server.js"]
