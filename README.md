# Digital Card Platform

Веб-сервис для создания, редактирования и публикации цифровых визитных карточек.

## Стек

- Frontend: Next.js App Router, React, TypeScript, Tailwind CSS
- Backend: FastAPI, SQLModel, SQLite
- Пакетные менеджеры: npm для frontend, uv для backend
- Тесты: Vitest, Testing Library, pytest
- Docker: `Dockerfile`, `docker-compose.yml`

## Структура

- `client/` - frontend-приложение Next.js
- `client/src/app/` - страницы App Router
- `client/src/components/` - React-компоненты
- `client/src/lib/api.ts` - клиент API
- `server/app/` - FastAPI-приложение, модели, схемы, миграция и seed
- `server/tests/` - backend-тесты
- `docker-compose.yml` - запуск frontend, backend и SQLite volume

## Переменные окружения

Примеры находятся в:

- `.env.example` - значения для Docker Compose
- `client/.env.example` - значения frontend
- `server/.env.example` - значения backend

Frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
INTERNAL_API_URL=http://localhost:4000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Backend:

```env
DATABASE_URL=sqlite:///./dev.db
CLIENT_ORIGIN=http://localhost:3000
PORT=4000
```

Docker Compose:

```env
DATABASE_URL=sqlite:////data/prod.db
SERVER_PORT=4000
SERVER_HOST_PORT=8080
CLIENT_HOST_PORT=80
CLIENT_ORIGIN=http://localhost:3000
INTERNAL_API_URL=http://server:4000
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_SITE_URL=http://localhost
```

## Установка

```bash
npm install
cd server
uv sync
```

## Backend

Инициализация БД:

```bash
npm run server:migrate
```

Seed-данные:

```bash
npm run server:seed
```

Запуск:

```bash
npm run server:dev
```

API доступен на `http://localhost:4000`.

## Frontend

Запуск:

```bash
npm run dev -w client
```

Frontend доступен на `http://localhost:3000`.

## Страницы

- `/` - главная
- `/cards` - список визиток
- `/cards/new` - создание визитки
- `/cards/[id]/edit` - редактирование визитки
- `/v/[slug]` - публичная страница визитки
- `/v/random` - переход на случайную публичную визитку

## Тесты

Все тесты:

```bash
npm test
```

Frontend:

```bash
npm run test -w client
```

Backend:

```bash
npm run server:test
```

## Проверки

```bash
npm run lint
npm run typecheck
```

## Сборка

```bash
npm run build -w client
```

Backend не требует отдельной сборки.

## Docker

Перед запуском можно создать `.env` из примера:

```bash
copy .env.example .env
```

Сборка:

```bash
docker compose build
```

Запуск:

```bash
docker compose up
```

Запуск в фоне:

```bash
docker compose up -d
```

Остановка:

```bash
docker compose down
```

Остановка с удалением SQLite volume:

```bash
docker compose down -v
```

Адреса по умолчанию:

- Frontend: `http://localhost`
- Backend: `http://localhost:8080`
- Healthcheck: `http://localhost:8080/api/health`

Seed в Docker:

```bash
docker compose exec server python -m app.seed
```

## Production

- Использовать постоянный volume для SQLite.
- Выполнять миграцию перед запуском backend.
- Указать публичные URL в `.env`.
- Размещать frontend и backend за HTTPS/reverse proxy.
