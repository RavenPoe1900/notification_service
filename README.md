<!-- Optional – add your own logo -->
<!-- <p align="center"><img src="docs/logo.png" width="180" alt="Notification Service logo" /></p> -->

# 📣 Notification Service

![language](https://img.shields.io/badge/language-TypeScript-blue?style=flat-square)
![build](https://img.shields.io/github/actions/workflow/status/your-org/notification-service/ci.yml?label=build&style=flat-square)
![license](https://img.shields.io/github/license/your-org/notification-service?style=flat-square)

A **NestJS + Prisma + BullMQ** micro-service that receives HTTP requests and delivers notifications **via Email** or the **System feed** (database).  
Built with **Domain-Driven Design (DDD)** and **Clean Architecture** to be extensible (plug-in email providers), efficient (batch processing) and secure (JWT).

---

## 📑 Table of Contents

1. [Features](#-features)  
2. [Architecture](#-architecture)  
3. [Environment Variables](#-environment-variables)  
4. [System Requirements](#-system-requirements)  
5. [Quick Start](#-quick-start)  
6. [Key Endpoints](#-key-endpoints)  
7. [Batch-Processing Flow](#-batch-processing-flow)  
8. [Adding New Email Providers](#-adding-new-email-providers)  
9. [Testing](#-testing)  
10. [Contributing](#-contributing)  
11. [License](#-license)

---

## ✨ Features

- **Instant or batched delivery** controlled by `BATCH_MAX_SIZE` and `BATCH_MAX_WAIT_TIME`.
- **Supported channels**  
  - `EMAIL` – Gmail & Mailgun ready; easy to add Sendgrid, etc.  
  - `SYSTEM` – stored in PostgreSQL, full CRUD.
- **JWT security** (access + refresh tokens).
- **Swagger/OpenAPI** auto-generated (`/api-docs`).
- **Health checks** (`/health`) out of the box.
- Async jobs with **BullMQ** on **Redis**.
- Fully typed TypeScript & DTO ↔ Prisma mapping via AutoMapper.

---

## 🏗️ Architecture

### Big-Picture (C4 – Context Diagram)



[Client] ⇄ REST ⇄ [NestJS API] │ ┌───────────────┼──────────────────┐ │ │ │ [Auth Module] [Users Module] [Notifications Module] │ ┌──────┴───────┐ │ Domain Logic │ └──────┬───────┘ │ ┌────────────┴────────────┐ │ Prisma ORM | BullMQ │ │ PostgreSQL | Redis │ └─────────────┴───────────┘


### DDD / Clean Architecture Layers

| Layer | Directory | Responsibility |
|-------|-----------|----------------|
| **Domain** | `domain/` | Entities, VOs, domain services, contracts |
| **Application** | `application/` | Use-cases, DTOs, orchestration |
| **Infrastructure** | `infrastructure/` | Persistence, external providers, mappers |
| **Presentation** | `presentation/` | HTTP controllers, guards, pipes |

---

## 🛠️ Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | – | PostgreSQL connection string |
| `PORT` | `3000` | HTTP port |
| `NODE_ENV` | `development` | `development | production | test` |
| `JWT_SECRET` | – | Key (≥ 32 chars) to sign JWT |
| `JWT_EXPIRES_IN` | `15m` | Access-token lifespan |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh-token lifespan |
| `EMAIL_PROVIDER` | `gmail` | `gmail | mailgun` |
| `GMAIL_USER` / `GMAIL_APP_PASSWORD` | – | Gmail credentials |
| `MAILGUN_API_KEY` / `MAILGUN_DOMAIN` | – | Mailgun credentials |
| `BATCH_MAX_SIZE` | `5` | Max similar notifications per batch |
| `BATCH_MAX_WAIT_TIME` | `7200` | Max wait (seconds) before forcing batch |
| `REDIS_HOST/PORT/PASSWORD` | `localhost/6379/-` | Redis connection |
| `RATE_LIMIT_TTL` / `RATE_LIMIT_LIMIT` | `60 / 100` | Global rate-limit |
| `LOG_LEVEL` | `info` | `debug info warn error` |

Create your local file:

```bash
cp .env.example .env && nano .env

🖥️ System Requirements
Node.js ≥ 16
PostgreSQL ≥ 12 (PostGIS optional)
Redis ≥ 6 (for BullMQ)
npm ≥ 8

(Optional) Docker & docker-compose to spin up local infra.

🚀 Quick Start
git clone https://github.com/your-org/notification-service.git
cd notification-service
npm install                         # install deps
cp .env.example .env && nano .env   # add your secrets
npx prisma migrate dev              # DB migrations
npx prisma db seed                  # seed data (optional)
docker compose up -d redis          # start Redis
npm run start:dev                   # watch mode
open http://localhost:3000/api-docs


Production:

npm run build && NODE_ENV=production node dist/main.js

🔗 Key Endpoints
Method	Route	Description
POST	/auth/login	Get tokens
POST	/notifications	Create notification
GET	/notifications/system	List user system notifications
PATCH	/notifications/system/:id/read|unread	Mark read/unread
DELETE	/notifications/:id	Delete notification
GET	/notifications/queue/stats	Bull queue stats
GET	/health	Global health-check

Full contract in Swagger UI.

📦 Batch-Processing Flow
Similarity key = eventName + channel + recipient.
Every notification is queued as PENDING.
BullMQ triggers a batch when either:
Number of similar items ≥ BATCH_MAX_SIZE, or
First item has waited BATCH_MAX_WAIT_TIME seconds.
A single aggregated message (HTML for Email, list for System) is sent and traces marked SENT/ERROR.

System channel is always processed as instant, regardless of requested type.

🔌 Adding New Email Providers
Create my-provider.service.ts implementing EmailProvider (sendEmail(to, subject, body, meta) → { success, error?, id? }).
Register it in EmailProviderFactory.
Export it from the providers/ index. No other layers need changes.
🧪 Testing
npm run test        # unit
npm run test:e2e    # end-to-end
npm run test:cov    # coverage


External services (SMTP/API) are mocked to keep tests deterministic.

🤝 Contributing
Open an issue or fork → create a feature branch.
Follow Conventional Commits.
Make sure npm run lint && npm run test pass.
Submit PR – CI (GitHub Actions) runs lint, tests and build.
📜 License

Distributed under the MIT license. See LICENSE for details.

Crafted with ❤️ and ☕ by the your-org team.