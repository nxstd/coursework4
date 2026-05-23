# Digital Card Platform

Платформа цифровых визиток: можно создать визитку, отредактировать контакты и соцссылки, открыть публичную страницу по slug, скопировать ссылку и показать QR-код.

Аутентификация намеренно не включена: проект сфокусирован на CRUD, публичном просмотре и локальном SQLite-хранилище.

## Стек

- Frontend: Next.js App Router, React, TypeScript, Tailwind CSS
- Backend: Python, FastAPI, SQLModel, SQLite
- Package/runtime tools: npm для client, uv для server
- Tests: Vitest + Testing Library на frontend, pytest + TestClient на backend
- Docker: multi-stage `Dockerfile`, `docker-compose.yml`, frontend на `node:alpine`

## Структура

- `client` - Next.js приложение
- `server/app` - FastAPI приложение, модели, seed и инициализация схемы
- `server/tests` - минимальные API-тесты backend
- `server/pyproject.toml` - зависимости uv
- `Dockerfile` - targets `client` и `server`

## Требования

- Node.js 26+
- npm 11+
- uv
- Python 3.13+ локально, Docker использует Python 3.14 Alpine
- Docker Desktop, если нужен запуск в контейнерах

## Переменные окружения

Server:

```env
DATABASE_URL=sqlite:///./dev.db
PORT=4000
CLIENT_ORIGIN=http://localhost:3000
```

Client:

```env
INTERNAL_API_URL=http://server:4000
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`DATABASE_URL` в Docker: `sqlite:////data/prod.db`.
`INTERNAL_API_URL` нужен Next.js server components внутри Docker-сети.
Для Docker Compose пример значений лежит в корневом `.env.example`; перед запуском его можно скопировать в `.env` и адаптировать публичные URL/порты.

## Установка

```bash
npm install
cd server
uv sync
copy .env.example .env
uv run python -m app.migrate
uv run python -m app.seed
```

На macOS/Linux вместо `copy`:

```bash
cp server/.env.example server/.env
```

## Запуск Server

```bash
npm run server:dev
```

API доступен на `http://localhost:4000`.

Проверка:

```bash
curl http://localhost:4000/api/health
curl http://localhost:4000/api/cards
```

## Запуск Client

```bash
npm run dev -w client
```

Frontend доступен на `http://localhost:3000`.

Основные страницы:

- `/` - главная
- `/cards` - список визиток
- `/cards/new` - создание визитки
- `/cards/[id]/edit` - редактирование
- `/v/[slug]` - публичная страница визитки

## SQLite И Seed

Создать таблицы:

```bash
npm run server:migrate
```

Загрузить 3 тестовые визитки:

```bash
npm run server:seed
```

Seed идемпотентный: существующие визитки обновляются по `slug`.

## Тесты

Все тесты:

```bash
npm test
```

Только frontend:

```bash
npm run test -w client
```

Только backend:

```bash
npm run server:test
```

Дополнительные проверки:

```bash
npm run lint
npm run typecheck
```

## Сборка

Frontend:

```bash
npm run build -w client
```

Backend не требует отдельной компиляции: FastAPI запускается напрямую через uv/venv.

## Docker

Собрать образы:

```bash
docker compose build
```

Запустить:

```bash
docker compose up
```

Запустить в фоне:

```bash
docker compose up -d
```

Остановить:

```bash
docker compose down
```

Удалить контейнеры и SQLite volume:

```bash
docker compose down -v
```

Адреса в compose:

- Client: `http://localhost` при `CLIENT_HOST_PORT=80`
- Server: `http://localhost:8080` при `SERVER_HOST_PORT=8080`
- Health: `http://localhost:8080/api/health`

SQLite база хранится в Docker volume `sqlite-data` и подключается в server-контейнер как `/data/prod.db`.

При старте server-контейнер выполняет:

```bash
python -m app.migrate
uvicorn app.main:app --host 0.0.0.0 --port 4000
```

Seed в Docker:

```bash
docker compose exec server python -m app.seed
```

## Скриншоты Для Отчета

Скриншоты готовятся в `report-assets/screenshots/`:

- `01-home-desktop.png` - главная страница
- `02-cards-list-desktop.png` - список визиток
- `03-cards-search-desktop.png` - список визиток с поиском
- `04-card-create-form.png` - форма создания визитки
- `05-card-form-validation.png` - пример ошибки валидации
- `06-card-live-preview.png` - live-preview визитки
- `07-public-card-desktop.png` - публичная страница визитки
- `08-public-card-qr.png` - блок с QR-кодом
- `09-public-card-mobile.png` - мобильная версия публичной визитки
- `10-frontend-tests.png` - успешный запуск frontend-тестов
- `11-backend-tests.png` - успешный запуск backend-тестов
- `12-build-success.png` - успешная сборка проекта

## Production

Минимальная схема:

- Собрать `server` и `client` targets из `Dockerfile`.
- Хранить SQLite файл на persistent volume.
- Выполнять `python -m app.migrate` перед стартом backend.
- Выставить backend наружу за reverse proxy или оставить только внутри сети.
- Выставить frontend наружу через HTTPS.
- Указать реальные публичные URL в env.

Пример env:

```env
# server
DATABASE_URL=sqlite:////data/prod.db
PORT=4000
CLIENT_ORIGIN=https://cards.example.com

# client
INTERNAL_API_URL=http://api.cards.internal:4000
NEXT_PUBLIC_API_URL=https://api.cards.example.com
NEXT_PUBLIC_SITE_URL=https://cards.example.com
```

Для реального production лучше добавить HTTPS/reverse proxy, резервное копирование SQLite volume и отдельный миграционный шаг перед rollout.
