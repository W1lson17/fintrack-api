# fintrack-api

REST API for personal finance tracking built with Node.js, TypeScript, Express and Prisma

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- Docker

### Installation

1. Clone the repository
2. Install dependencies

```bash
   pnpm install
```

3. Copy the environment file and fill in the values

```bash
   cp .env.example .env
```

4. Generate Prisma client

```bash
   pnpm db:generate
```

5. Start the database

```bash
   docker-compose up -d
```

6. Run migrations

```bash
   pnpm db:migrate
```

7. Start the server

```bash
   pnpm dev
```
