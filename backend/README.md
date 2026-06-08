<div align="center">

# ⚙️ Lokkho — Backend API

### Express 5 + TypeScript + MongoDB REST API

[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/Mongoose-9-47A248?logo=mongodb&logoColor=white)](https://mongoosejs.com)
[![Zod](https://img.shields.io/badge/Validation-Zod-3E67B1)](https://zod.dev)
[![Swagger](https://img.shields.io/badge/Docs-Swagger_UI-85EA2D?logo=swagger&logoColor=black)](http://localhost:5000/api/docs)

</div>

---

## 📖 Overview

A modular REST API where every feature is a self-contained unit following a strict layered flow:

```
HTTP request
   │
   ▼
routes ──▶ middleware (auth · validate · rateLimit)
   │
   ▼
controller ──▶ service ──▶ model (Mongoose)
   │                          │
   ▼                          ▼
JSON response            MongoDB
```

- **routes** – declare paths + attach middleware
- **controller** – thin HTTP layer (`req`/`res`), wrapped in `asyncHandler`
- **service** – business logic & data access
- **model** – Mongoose schema + types
- **schema** – Zod request validation

---

## 🚀 Getting Started

```bash
cd backend
npm install
cp .env.example .env     # configure MONGODB_URI + JWT secrets
npm run seed             # (optional) sample data → demo@lokkho.com / demo123
npm run dev              # http://localhost:5000
```

| Endpoint | URL |
|---|---|
| API base | http://localhost:5000/api |
| Health check | http://localhost:5000/api/health |
| **Swagger UI** | **http://localhost:5000/api/docs** |
| **OpenAPI JSON** | **http://localhost:5000/api/docs.json** |

---

## 📚 API Documentation (Swagger)

Interactive docs are generated from a hand-authored **OpenAPI 3.0** spec
([`src/docs/openapi.ts`](src/docs/openapi.ts)) and served with
[`swagger-ui-express`](https://www.npmjs.com/package/swagger-ui-express).

```ts
// src/docs/swagger.ts (wired into app.ts)
import swaggerUi from "swagger-ui-express";
import { openapiSpec } from "./openapi";

app.get("/api/docs.json", (_req, res) => res.json(openapiSpec));
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openapiSpec, {
  customSiteTitle: "Lokkho API Docs",
  swaggerOptions: { persistAuthorization: true, filter: true, displayRequestDuration: true },
}));
```

**Try a protected endpoint:**

1. `POST /api/auth/login` → copy `accessToken` from the response.
2. Click **Authorize** 🔓 in Swagger UI and paste the token.
3. Every secured request now sends `Authorization: Bearer <token>` (the token persists across reloads).

> Docs are mounted **before** Helmet & the rate limiter so Swagger's bundled assets aren't blocked
> by the Content-Security-Policy and don't consume the API quota.

---

## 🔐 Authentication

| Token | Storage | Lifetime | Purpose |
|---|---|---|---|
| **Access token** | `Authorization: Bearer …` header | 15m (`ACCESS_TOKEN_EXPIRES`) | Authorise API calls |
| **Refresh token** | httpOnly cookie (`/api/auth`) | 7d (`REFRESH_TOKEN_EXPIRES`) | Rotate the session |

**Flow:** `register`/`login` → returns access token + sets refresh cookie → on 401 the client calls
`POST /auth/refresh` → the stored refresh token (SHA-256 hashed in MongoDB) is validated, **rotated**,
and a fresh access token is returned. `logout` revokes it; a password reset revokes **all** sessions.

---

## 🌐 Route Reference

> 🔒 = requires Bearer access token  ·  🌍 = public  ·  👤 = owner-only (creator) for `PUT`/`DELETE`

### Auth — `/api/auth`
| Method | Path | Access | Body |
|---|---|:---:|---|
| POST | `/auth/register` | 🌍 | `name, email, password` |
| POST | `/auth/login` | 🌍 | `email, password` |
| POST | `/auth/refresh` | 🌍 (cookie) | — |
| POST | `/auth/logout` | 🌍 (cookie) | — |
| POST | `/auth/forgot-password` | 🌍 | `email` |
| POST | `/auth/reset-password` | 🌍 | `token, password` |
| POST | `/auth/verify-email` | 🌍 | `token` |
| POST | `/auth/resend-verification` | 🔒 | — |

### Account — `/api/auth`
| Method | Path | Access | Body |
|---|---|:---:|---|
| GET | `/auth/me` | 🔒 | — |
| PUT | `/auth/profile` | 🔒 | `name` |
| PUT | `/auth/password` | 🔒 | `currentPassword, newPassword` |
| DELETE | `/auth/account` | 🔒 | — |

### Exam Modules — `/api/modules`
| Method | Path | Access |
|---|---|:---:|
| GET | `/modules` | 🔒 |
| GET | `/modules/:id` | 🔒 👤 |
| POST | `/modules` | 🔒 |
| PUT / DELETE | `/modules/:id` | 🔒 👤 |

### Subjects
| Method | Path | Access |
|---|---|:---:|
| GET | `/modules/:id/subjects` | 🔒 👤 |
| POST | `/modules/:id/subjects` | 🔒 |
| PUT / DELETE | `/subjects/:id` | 🔒 👤 |

### Topics
| Method | Path | Access |
|---|---|:---:|
| GET | `/subjects/:id/topics` | 🔒 👤 |
| POST | `/subjects/:id/topics` | 🔒 |
| GET | `/topics/:id` | 🔒 👤 |
| PUT / DELETE | `/topics/:id` | 🔒 👤 |

### Progress — `/api/progress`
| Method | Path | Access |
|---|---|:---:|
| GET | `/progress` | 🔒 |
| GET | `/progress/analytics` | 🔒 |
| PUT | `/progress/:topicId` | 🔒 |
| GET | `/subject-progress` | 🔒 |
| PUT | `/subject-progress/:subjectId` | 🔒 |

### Questions — `/api/questions`
| Method | Path | Access |
|---|---|:---:|
| GET | `/questions` *(filters: moduleId, subjectId, topicId, year, type, page, limit)* | 🔒 |
| POST | `/questions` | 🔒 |
| PUT / DELETE | `/questions/:id` | 🔒 👤 |

### Notes — `/api/notes`
| Method | Path | Access |
|---|---|:---:|
| GET / POST | `/notes` | 🔒 |
| PUT / DELETE | `/notes/:id` | 🔒 👤 |

### Study Plans — `/api/study-plans`
| Method | Path | Access |
|---|---|:---:|
| GET | `/study-plans` *(filter: date)* | 🔒 |
| POST | `/study-plans` *(upsert by date)* | 🔒 |
| DELETE | `/study-plans/:id` | 🔒 👤 |

### Mock Tests — `/api/mock-tests`
| Method | Path | Access |
|---|---|:---:|
| GET / POST | `/mock-tests` | 🔒 |

### Books — `/api/books`
| Method | Path | Access |
|---|---|:---:|
| GET / POST | `/books` | 🔒 |
| PUT / DELETE | `/books/:id` | 🔒 👤 |

### Jobs — `/api/jobs`
| Method | Path | Access |
|---|---|:---:|
| GET | `/jobs` *(filters: category, pension, search, page, limit)* | 🔒 |
| GET | `/jobs/:id` | 🔒 👤 |
| POST | `/jobs` | 🔒 |
| PUT / DELETE | `/jobs/:id` | 🔒 👤 |

### Resources — `/api/resources`
| Method | Path | Access |
|---|---|:---:|
| GET / POST | `/resources` | 🔒 |
| PUT / DELETE | `/resources/:id` | 🔒 👤 |

### Important Topics — `/api/important-*`
| Method | Path | Access |
|---|---|:---:|
| GET / POST | `/important-subjects` | 🔒 |
| GET | `/important-subjects/:id` | 🔒 👤 |
| PUT / DELETE | `/important-subjects/:id` | 🔒 👤 |
| GET | `/important-subjects/:id/topics` | 🔒 👤 |
| POST | `/important-subjects/:id/topics` | 🔒 |
| GET | `/important-progress` | 🔒 |
| PUT | `/important-progress/:topicId` | 🔒 |
| GET | `/important-topics` | 🔒 |
| PUT / DELETE | `/important-topics/:id` | 🔒 👤 |

### Applications — `/api/applications`
| Method | Path | Access |
|---|---|:---:|
| GET / POST | `/applications` | 🔒 |
| PUT / DELETE | `/applications/:id` | 🔒 👤 |

> For exact request/response shapes, enums, and examples, use the **[Swagger UI](http://localhost:5000/api/docs)**.

---

## 📦 Standard Response Shape

```jsonc
// Success
{ "success": true, "data": "..." }

// List (paginated)
{ "success": true, "count": 10, "total": 42, "page": 1, "limit": 10, "totalPages": 5, "jobs": [ ... ] }

// Error
{ "success": false, "message": "Validation failed", "details": [ { "field": "email", "message": "Valid email required" } ] }
```

| Status | Meaning |
|---|---|
| `400` | Validation failed / bad ObjectId |
| `401` | Missing / invalid / expired access token |
| `403` | Authenticated, but not the owner |
| `404` | Not found |
| `409` | Duplicate (e.g. email already registered) |

---

## ⚙️ Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | API port |
| `NODE_ENV` | `development` | `development` \| `production` |
| `CLIENT_URL` | `http://localhost:3000` | Frontend origin for CORS — set to `http://localhost:3010` in dev |
| `MONGODB_URI` | `mongodb://localhost:27017/lokkho` | MongoDB connection string |
| `JWT_ACCESS_SECRET` | `dev_access_secret` | **Set a strong value in production** |
| `JWT_REFRESH_SECRET` | `dev_refresh_secret` | **Set a strong value in production** |
| `ACCESS_TOKEN_EXPIRES` | `15m` | Access-token lifetime |
| `REFRESH_TOKEN_EXPIRES` | `7d` | Refresh-token lifetime |
| `SMTP_HOST` … `SMTP_FROM` | — | Optional SMTP; if unset, emails are logged to the console |

---

## 📜 Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start with hot reload (`node --watch` + ts-node) |
| `npm start` | Start once (ts-node) |
| `npm run typecheck` | `tsc --noEmit` type check |
| `npm run seed` | Seed full sample dataset |
| `npm run seed:jobs` | Seed jobs only |
| `npm run seed:topics` | Seed important topics |
| `npm run seed:applications` | Seed applications |
| `npm run seed:books` / `:questions` / `:subjects` / `:modules` / `:resources` / `:planner` | Seed individual datasets |

---

## 📁 Structure

```
backend/src/
├── app.ts                 # express app: middleware, swagger, routes, error handling
├── server.ts              # bootstrap: connect DB + listen
├── config/
│   ├── env.ts             # typed environment config
│   └── db.ts              # mongoose connection
├── middleware/
│   ├── auth.ts            # requireAuth (Bearer → req.user)
│   ├── validate.ts        # Zod body validation
│   ├── rateLimit.ts       # apiLimiter + stricter authLimiter
│   └── errorHandler.ts    # 404 + central error formatter
├── docs/
│   ├── openapi.ts         # OpenAPI 3.0 specification
│   └── swagger.ts         # swagger-ui-express setup
├── modules/<feature>/     # routes · controller · service · model · schema · types
├── utils/                 # ApiError, asyncHandler, token, mailer, pagination, ownership
└── seed/                  # seed scripts + sample data
```

---

## 🛡️ Security

Helmet · CORS (credentials) · rate limiting (stricter on auth) · `trust proxy` · `Cache-Control: no-store`
on API responses · bcrypt password hashing · hashed + rotated refresh tokens · Zod validation on all writes ·
no email enumeration on password reset.
