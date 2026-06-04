# SafeSchool

SafeSchool is a full-stack school safety platform built as a monorepo.

It contains:

- `backend/` - Laravel API
- `frontend/` - React + Vite web dashboard
- `mobile/` - Expo React Native app
- `docker-compose.yml` - local infrastructure for backend services

## Tech Stack

- Backend: Laravel 12, PHP 8.3
- Frontend: React, Vite, TypeScript
- Mobile: Expo, React Native, TypeScript
- Database: MySQL 8.4
- Cache/Queue: Redis
- Mail: Mailpit
- CI: GitHub Actions

## Requirements

Install these before starting:

- Docker
- Docker Compose
- Node.js
- npm
- Git

Composer is installed inside the backend Docker container, so you do not need Composer locally for normal backend setup.

## Branch Flow

This project uses:

```txt
main -> dev -> feat/your-feature-name
```

Use `main` for stable code, `dev` for integrated work, and `feat/...` branches for individual changes.

## Setup

Clone the repository:

```bash
git clone https://github.com/Leart-C/SafeSchool.git
cd SafeSchool
```

Create backend environment file:

```bash
cp backend/.env.example backend/.env
```

Start Docker services:

```bash
docker compose up -d --build
```

Install backend dependencies if needed:

```bash
docker compose exec app composer install
```

Generate Laravel app key:

```bash
docker compose exec app php artisan key:generate
```

Run migrations:

```bash
docker compose exec app php artisan migrate
```

## Backend

The backend runs through Docker:

```txt
http://localhost:8000
```

Useful commands:

```bash
docker compose exec app php artisan test
docker compose exec app php artisan migrate
docker compose exec app php artisan migrate:status
docker compose exec app php artisan pint
```

## Frontend

Install dependencies:

```bash
cd frontend
npm install
```

Run locally:

```bash
npm run dev
```

Frontend URL:

```txt
http://localhost:5173
```

Build and lint:

```bash
npm run lint
npm run build
```

## Mobile

Install dependencies:

```bash
cd mobile
npm install
```

Run Expo:

```bash
npx expo start
```

Check code:

```bash
npm run lint
npm run typecheck
```

## Local Services

Docker Compose starts:

| Service | URL / Port |
|---|---|
| Laravel via nginx | `http://localhost:8000` |
| MySQL | `localhost:3306` |
| Redis | `localhost:6379` |
| Mailpit UI | `http://localhost:8025` |
| Mailpit SMTP | `localhost:1025` |

## CI

GitHub Actions runs on pushes to `main`, `dev`, and pull requests.

CI checks:

- Laravel dependencies and tests
- Frontend install, lint, and build
- Mobile install, lint, and typecheck

## Environment Files

Do not commit real secrets.

Use:

```txt
.env.example
backend/.env.example
```

as documentation only.

Real local secrets belong in ignored `.env` files.
