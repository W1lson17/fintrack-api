# Fintrack API

A RESTful API for personal finance tracking built with Node.js, TypeScript, Express and Prisma ORM. Features JWT authentication with refresh token rotation, full CRUD operations for financial data, offset-based pagination, and monthly financial reports.

[![Tests](https://img.shields.io/badge/tests-102%20passing-brightgreen)](#testing)
[![Coverage](https://img.shields.io/badge/coverage-98.92%25-brightgreen)](#testing)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-24-green)](https://nodejs.org/)
[![Vitest](https://img.shields.io/badge/Vitest-4-yellow)](https://vitest.dev/)

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [API Endpoints](#api-endpoints)
- [Docker Environments](#docker-environments)
- [Testing](#testing)
- [Error Handling](#error-handling)

---

## Overview

Fintrack API allows users to track their personal finances by managing income and expenses through categorized transactions, saving goals with progress tracking, and monthly financial reports with category breakdowns.

**Key features:**
- JWT access token (15m) + refresh token rotation (7d) with logout support
- Full CRUD for categories, transactions and saving goals
- Offset-based pagination on all list endpoints
- Monthly income/expense summary with balance calculation
- Spending breakdown by category
- Rate limiting on auth and general endpoints
- Input validation with Zod schemas
- Three isolated Docker environments (dev, test, production)

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 24 | Runtime |
| TypeScript | 5.9 | Language (ES Modules) |
| Express | 5 | HTTP Framework |
| Prisma | 7 | ORM |
| PostgreSQL | 18 | Database |
| Zod | 4 | Validation |
| JWT + bcryptjs | — | Authentication |
| express-rate-limit | — | Rate Limiting |
| Vitest | 4 | Testing |
| Supertest | 7 | Integration Testing |
| Docker | — | Containerization |
| pnpm | — | Package Manager |

---

## Architecture

The project follows a **Layered Architecture** pattern with clear separation of concerns:
```
┌─────────────────────────────────────────────┐
│              Routes + Controllers            │  ← HTTP layer
├─────────────────────────────────────────────┤
│                  Services                    │  ← Business logic
├─────────────────────────────────────────────┤
│                Repositories                  │  ← Data access (Prisma)
├─────────────────────────────────────────────┤
│                 PostgreSQL                   │  ← Database
└─────────────────────────────────────────────┘
```

Each request flows through `validateRequest` middleware (Zod) → Controller → Service → Repository → Database. Errors bubble up through `AppError` and are handled by the global `errorHandler` middleware.

### Project Structure
```
src/
├── __tests__/
│   ├── integration/    # Route tests against real test database
│   ├── unit/           # Service and middleware tests with mocked dependencies
│   └── utils/          # Shared test utilities
├── controllers/        # HTTP layer — handles requests and responses
├── generated/          # Prisma generated client (do not edit)
├── lib/                # AppError, errorCodes, formatters, logger, prisma
├── middlewares/        # validateRequest, errorHandler, authenticateToken
├── repositories/       # Data access layer — Prisma queries
├── routes/             # Route definitions
├── schemas/            # Zod validation schemas
├── services/           # Business logic — validation, ownership checks
├── types/              # TypeScript type declarations
└── index.ts            # Application entry point
```

---

## Getting Started

### Prerequisites

- Node.js 24+
- pnpm
- Docker and Docker Compose

### 1. Clone and install dependencies
```bash
git clone https://github.com/W1lson17/fintrack-api
cd fintrack-api
pnpm install
```

### 2. Set up environment variables
```bash
cp .env.example .env
cp .env.test.example .env.test
```

Fill in the required values in both files. See [Environment Variables](#environment-variables) for details.

### 3. Start the development database
```bash
pnpm db:dev
```

### 4. Run database migrations
```bash
pnpm db:migrate
```

### 5. Generate Prisma client
```bash
pnpm db:generate
```

### 6. Start the development server
```bash
pnpm dev
```

The API will be available at `http://localhost:<PORT>` where `PORT` is the value set in your `.env` file.

---

## Environment Variables

### `.env` (development)

| Variable | Description | Example |
|----------|-------------|---------|
| `POSTGRES_USER` | PostgreSQL username | `fintrack` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `yourpassword` |
| `POSTGRES_DB` | PostgreSQL database name | `fintrack` |
| `DATABASE_URL` | Prisma connection string | `postgresql://user:pass@localhost:5432/fintrack` |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |

### `.env.test` (test)

Same variables as `.env` but pointing to the test database on port `5433`:
```env
DATABASE_URL=postgresql://user:pass@localhost:5433/fintrack_test
NODE_ENV=test
```

### `.env.production` (production)

Same variables but with `DATABASE_URL` using the Docker internal hostname:
```env
DATABASE_URL=postgresql://user:pass@postgres:5432/fintrack_prod
NODE_ENV=production
```

> Use `.env.example`, `.env.test.example` and `.env.production.example` as templates.

---

## Scripts

### Development

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server with hot reload |
| `pnpm build` | Compile TypeScript to JavaScript |
| `pnpm start` | Start production server from compiled files |

### Database

| Script | Description |
|--------|-------------|
| `pnpm db:dev` | Start development database container |
| `pnpm db:test` | Start test database container |
| `pnpm db:prod` | Start production environment (API + database) |
| `pnpm db:migrate` | Run Prisma migrations (development) |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:studio` | Open Prisma Studio for development database |
| `pnpm db:studio:test` | Open Prisma Studio for test database |
| `pnpm db:reset` | Reset development database |
| `pnpm db:reset:test` | Reset test database |

### Testing

| Script | Description |
|--------|-------------|
| `pnpm test` | Reset test DB and run all tests |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:coverage` | Run tests with coverage report |

---

## API Endpoints

All authenticated endpoints require the `Authorization: Bearer <accessToken>` header.

### Auth

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Login and receive tokens | No |
| `POST` | `/api/auth/refresh` | Rotate refresh token | No |
| `POST` | `/api/auth/logout` | Invalidate refresh token | No |

**Register request body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "StrongPass1!"
}
```

**Register / Login response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Refresh request body:**
```json
{
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Refresh response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "661f9511-f30c-52e5-b827-557766551111"
}
```

**Logout request body:**
```json
{
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000"
}
```

> Refresh token rotation is enforced — each refresh token can only be used once. Access tokens expire in 15 minutes. Refresh tokens expire in 7 days.

---

### Categories

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/categories` | Create a category | Yes |
| `GET` | `/api/categories` | Get paginated categories | Yes |
| `GET` | `/api/categories/:id` | Get category by ID | Yes |
| `DELETE` | `/api/categories/:id` | Delete a category | Yes |

**Request body (POST):**
```json
{
  "name": "Food",
  "type": "EXPENSE"
}
```

Category types: `INCOME` | `EXPENSE`

**Query params (GET /):**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | `number` | `1` | Page number (1-based) |
| `limit` | `number` | `10` | Records per page (max: 100) |

**Paginated response:**
```json
{
  "data": [...],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

### Transactions

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/transactions` | Create a transaction | Yes |
| `GET` | `/api/transactions` | Get paginated transactions | Yes |
| `GET` | `/api/transactions/:id` | Get transaction by ID | Yes |
| `DELETE` | `/api/transactions/:id` | Delete a transaction | Yes |

**Request body (POST):**
```json
{
  "amount": 500.00,
  "type": "EXPENSE",
  "categoryId": "uuid",
  "description": "Supermarket",
  "date": "2026-03-20T00:00:00.000Z"
}
```

**Query params (GET /):**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `type` | `INCOME` \| `EXPENSE` | — | Filter by transaction type |
| `categoryId` | `string` | — | Filter by category UUID |
| `page` | `number` | `1` | Page number (1-based) |
| `limit` | `number` | `10` | Records per page (max: 100) |

**Paginated response:**
```json
{
  "data": [...],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

### Saving Goals

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/saving-goals` | Create a saving goal | Yes |
| `GET` | `/api/saving-goals` | Get paginated saving goals | Yes |
| `GET` | `/api/saving-goals/:id` | Get saving goal by ID | Yes |
| `PATCH` | `/api/saving-goals/:id` | Update saving goal progress | Yes |
| `DELETE` | `/api/saving-goals/:id` | Delete a saving goal | Yes |

**Request body (POST):**
```json
{
  "name": "Vacation",
  "targetAmount": 10000,
  "deadline": "2027-12-31"
}
```

**Request body (PATCH):**
```json
{
  "amount": 500
}
```

The `amount` is added to `currentAmount`. Returns `400` if `currentAmount + amount` exceeds `targetAmount`.

**Query params (GET /):**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | `number` | `1` | Page number (1-based) |
| `limit` | `number` | `10` | Records per page (max: 100) |

**Paginated response:**
```json
{
  "data": [...],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

### Reports

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/reports/summary` | Monthly income/expense summary | Yes |
| `GET` | `/api/reports/categories` | Spending breakdown by category | Yes |

**Query params (both endpoints):**

| Param | Type | Description |
|-------|------|-------------|
| `month` | `number` (1-12) | Month to query |
| `year` | `number` (2000+) | Year to query |

**Summary response:**
```json
{
  "month": 3,
  "year": 2026,
  "totalIncome": 5000,
  "totalExpenses": 1500,
  "balance": 3500
}
```

**Categories response:**
```json
[
  { "categoryName": "Rent", "total": 1000 },
  { "categoryName": "Food", "total": 500 }
]
```

Results are sorted by highest spending.

---

## Docker Environments

The project has three completely isolated Docker environments, each with its own project name, network and volume:

| Environment | Compose file | Database port | API port |
|-------------|-------------|---------------|----------|
| Development | `docker-compose.dev.yml` | `5432` | — |
| Test | `docker-compose.test.yml` | `5433` | — |
| Production | `docker-compose.prod.yml` | internal | `3000` |

All three can run simultaneously without conflicts.

### Production Setup
```bash
cp .env.production.example .env.production
# Fill in production values
pnpm db:prod
```

The production image uses a **multi-stage Dockerfile** — build tools are excluded from the final image. On startup, `prisma migrate deploy` runs automatically before the server starts.

---

## Testing

The project uses **Vitest** with two types of tests:

**Unit tests** — test services and middlewares in isolation with mocked repositories. No database required.

**Integration tests** — test the complete HTTP request/response cycle against a real PostgreSQL test database. Each test suite registers a unique user to avoid conflicts.
```bash
# Start test database first
pnpm db:test

# Run all tests
pnpm test

# Run with coverage report
pnpm test:coverage
```

### Coverage

| Layer | Statements | Functions | Lines |
|-------|-----------|-----------|-------|
| Controllers | 100% | 100% | 100% |
| Services | 98.59% | 100% | 99.15% |
| Middlewares | 97.22% | 100% | 97.14% |
| Lib | 100% | 100% | 100% |
| **Global** | **98.92%** | **100%** | **99.20%** |

Coverage thresholds are enforced — the test suite fails if any metric drops below 80%.

---

## Error Handling

All errors follow a consistent JSON format:
```json
{
  "code": "ERROR_CODE",
  "message": "Human readable message",
  "statusCode": 404
}
```

Validation errors include field-level details:
```json
{
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email address" }
  ]
}
```

### Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Request body/params failed Zod validation |
| `UNAUTHORIZED` | 401 | Missing or invalid JWT token |
| `INVALID_CREDENTIALS` | 401 | Wrong email or password |
| `INVALID_REFRESH_TOKEN` | 401 | Refresh token does not exist or was already used |
| `REFRESH_TOKEN_EXPIRED` | 401 | Refresh token has expired |
| `EMAIL_ALREADY_EXISTS` | 409 | Email already registered |
| `CATEGORY_NOT_FOUND` | 404 | Category does not exist or belongs to another user |
| `CATEGORY_ALREADY_EXISTS` | 409 | Category with same name and type already exists |
| `TRANSACTION_NOT_FOUND` | 404 | Transaction does not exist or belongs to another user |
| `SAVING_GOAL_NOT_FOUND` | 404 | Saving goal does not exist or belongs to another user |
| `AMOUNT_EXCEEDS_TARGET` | 400 | Progress update would exceed the saving goal target |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error |