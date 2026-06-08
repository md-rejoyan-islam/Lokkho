<div align="center">

# 🎯 Lokkho

### One place to manage your entire government & private job-exam preparation

BCS · Bank · Primary · NTRCA · Railway — modules, progress, question bank, planner & more.

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)](https://nextjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![Swagger](https://img.shields.io/badge/API_Docs-Swagger-85EA2D?logo=swagger&logoColor=black)](http://localhost:5000/api/docs)
[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red.svg)](#-license)

[**Quick Start**](#-quick-start) · [**API Docs**](#-api-documentation) · [**Architecture**](#-architecture) · [**Project Structure**](#-project-structure)

</div>

---

## 📖 Overview

**Lokkho** is a full-stack monorepo that helps job seekers organise every part of their exam
preparation in one workspace. There is **no admin** — any user can contribute content
(exam modules, subjects, questions), but **only the creator can edit or delete** their own records.
Every new account is seeded with its own editable copy of a demo starter dataset.

> বাংলা: BCS / Bank / Primary / NTRCA / Railway সহ যেকোনো সরকারি-বেসরকারি চাকরির প্রস্তুতি এক জায়গায় manage করার full-stack app।

---

## ✨ Features

| | Feature | Description |
|---|---|---|
| 🔐 | **Auth** | JWT access + httpOnly refresh tokens, rotation & revocation, bcrypt hashing, email verification & password reset |
| 🧩 | **Exam modules** | Community-built modules (e.g. *Railway Exam*) with subjects, exam pattern & mark distribution |
| 📊 | **Progress tracking** | Per-topic & per-subject status (5 states), revision dates, aggregated analytics |
| ❓ | **Question bank** | Previous-year + practice questions, filter by module / subject / year / type |
| 📝 | **Notes & planner** | Personal notes and a day-wise study planner |
| 🧪 | **Mock tests** | Record attempts and scores |
| 📚 | **Books** | Curated, recommended reading list |
| 💼 | **Jobs** | Government / non-government / pension-included listings with search & filters |
| 📄 | **Resources** | Documents, processes and tips every job seeker should know |
| ⭐ | **Important topics** | High-priority subjects & topics with personal status |
| 🗂️ | **Application tracker** | Track each application's stages, dates & status |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16 (App Router), React 19, Tailwind CSS 4, TypeScript |
| **Backend** | Node.js, Express 5, TypeScript, Zod validation |
| **Database** | MongoDB + Mongoose 9 |
| **Auth** | JWT (access + refresh), bcryptjs, httpOnly cookies |
| **Security** | Helmet, CORS, express-rate-limit |
| **Docs** | OpenAPI 3.0 + Swagger UI (`swagger-ui-express`) |
| **Email** | Nodemailer (console fallback in dev) |

---

## 🏗️ Architecture

```
┌──────────────────────────┐         HTTP / JSON         ┌──────────────────────────┐
│   Frontend (Next.js)     │  ───────────────────────▶   │   Backend (Express API)  │
│   http://localhost:3010  │   Bearer access token       │   http://localhost:5000  │
│                          │   + httpOnly refresh cookie │                          │
│  • App Router pages      │  ◀───────────────────────   │  • 15 feature modules    │
│  • AuthProvider context  │                             │  • Zod-validated routes  │
│  • proxy.ts route guard  │                             │  • JWT auth middleware   │
└──────────────────────────┘                             └────────────┬─────────────┘
                                                                       │ Mongoose
                                                                       ▼
                                                          ┌──────────────────────────┐
                                                          │         MongoDB          │
                                                          └──────────────────────────┘
```

Each backend feature is a self-contained module: `routes → controller → service → model → schema`.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+**
- **MongoDB** — local (`mongodb://localhost:27017/lokkho`) or [MongoDB Atlas](https://www.mongodb.com/atlas)

### 1. Install everything

```bash
# from the repo root
npm run install:all
```

> Installs root, `backend/` and `frontend/` dependencies in one step.

### 2. Configure the backend environment

```bash
cd backend
cp .env.example .env
```

Then edit `.env` — at minimum set `MONGODB_URI` and the JWT secrets. Make sure `CLIENT_URL`
matches the frontend dev port (**3010**):

```env
CLIENT_URL=http://localhost:3010
MONGODB_URI=mongodb://localhost:27017/lokkho
JWT_ACCESS_SECRET=<long-random-string>
JWT_REFRESH_SECRET=<another-long-random-string>
```

<details>
<summary>MongoDB Atlas connection string format</summary>

```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/lokkho?retryWrites=true&w=majority
```

The database name (`/lokkho`) comes **after the host** and **before** the query string (`?...`).
</details>

### 3. (Optional) Seed sample data

```bash
npm run seed        # demo account → demo@lokkho.com / demo123
```

### 4. Run both apps

```bash
# from the repo root — runs backend + frontend together
npm run dev
```

| App | URL |
|---|---|
| 🖥️ Frontend | http://localhost:3010 |
| ⚙️ Backend API | http://localhost:5000 |
| 📚 API Docs (Swagger) | http://localhost:5000/api/docs |

---

## 📚 API Documentation

Interactive **Swagger UI** is served by the backend:

| Resource | URL |
|---|---|
| Swagger UI (try-it-out) | **http://localhost:5000/api/docs** |
| Raw OpenAPI 3.0 spec | **http://localhost:5000/api/docs.json** |

**Authorize in Swagger UI:**

1. Call `POST /api/auth/login` (or `register`) and copy the `accessToken` from the response.
2. Click **Authorize** 🔓 (top-right) and paste the token.
3. All protected endpoints now send `Authorization: Bearer <token>`.

The raw `/api/docs.json` spec can be imported into Postman / Insomnia or used for client code generation.
See [`backend/README.md`](backend/README.md) for the full route reference.

---

## 📜 Root Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Run backend + frontend together (hot reload) |
| `npm start` | Run both in production mode |
| `npm run build` | Build the frontend |
| `npm run install:all` | Install root + backend + frontend dependencies |
| `npm run seed` | Seed the database with sample data |
| `npm run seed:jobs` | Seed job listings only |

---

## 📁 Project Structure

```
lokkho/
├── backend/                # Express + Mongoose REST API  →  see backend/README.md
│   └── src/
│       ├── config/         # env & database connection
│       ├── middleware/     # auth, validation, rate limit, error handling
│       ├── modules/        # 15 feature modules (routes/controller/service/model/schema)
│       ├── docs/           # OpenAPI spec + Swagger UI setup
│       ├── utils/          # tokens, mailer, pagination, ownership helpers
│       └── seed/           # seed scripts & sample data
│
├── frontend/               # Next.js App Router UI       →  see frontend/README.md
│   ├── app/                # routes — (public) & (private) groups
│   ├── components/         # views, shared UI primitives
│   └── lib/                # api client, auth context, theme
│
├── package.json            # monorepo scripts (concurrently)
└── README.md               # you are here
```

---

## 🔒 Security Notes

- Refresh tokens are stored **hashed (SHA-256)**, rotated on every use, and revocable server-side.
- Passwords are hashed with **bcrypt**; `passwordHash` is never returned in responses.
- All mutating routes are **Zod-validated**; rate limiting protects the API (stricter on auth routes).
- **Set strong `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` in production** — the defaults are for local dev only.

---

## 📄 License

**Proprietary — All Rights Reserved.** © 2026 Md Rejoyan Islam.

This project and its source code, design, and logic are proprietary. No copying,
use, modification, distribution, reverse engineering, or reuse of its logic is
permitted without prior written permission. See the [LICENSE](LICENSE) file for
full terms. For licensing inquiries: **rejoyanislam0014@gmail.com**.

<div align="center">

Made with ❤️ for Bangladeshi job aspirants.

</div>
