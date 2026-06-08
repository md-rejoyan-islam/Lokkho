<div align="center">

# 🖥️ Lokkho — Frontend

### Next.js 16 (App Router) + React 19 + Tailwind CSS 4

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)

</div>

---

## 📖 Overview

The Lokkho web client — a responsive, dark-mode-ready dashboard built on the **Next.js App Router**.
Routes are split into **`(public)`** (auth screens) and **`(private)`** (the app) route groups, with a
lightweight cookie-based route guard and a React context that manages the JWT session.

---

## 🚀 Getting Started

```bash
cd frontend
npm install
```

Create **`.env.local`** pointing at the backend API:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Run the dev server:

```bash
npm run dev      # http://localhost:3010
```

> Make sure the backend's `CLIENT_URL` is set to `http://localhost:3010` so CORS + cookies work.

---

## 📜 Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the dev server on port **3010** |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | Lint with Next.js ESLint |

---

## 🔐 Auth Flow

| Concern | How it works |
|---|---|
| **Access token** | Stored in memory + `localStorage`; sent as `Authorization: Bearer …` by the API client |
| **Refresh token** | httpOnly cookie managed by the backend; refreshed automatically on `401` |
| **Auto refresh** | [`lib/api.ts`](lib/api.ts) retries once via `POST /auth/refresh` on a `401`, then replays the request |
| **Session state** | [`lib/auth.tsx`](lib/auth.tsx) — `AuthProvider` + `useAuth()` (`login`, `register`, `logout`, `user`) |
| **Route guard** | [`proxy.ts`](proxy.ts) (Next.js middleware) redirects guests away from `(private)` routes and authed users away from auth screens, using a non-httpOnly presence cookie |

> The cookie guard is a **UX redirect only** — real authorization is always enforced server-side by the API.

---

## 📁 Structure

```
frontend/
├── app/
│   ├── (public)/            # login, register, forgot/reset password, verify-email
│   ├── (private)/           # dashboard, modules, subjects, topics, questions,
│   │   │                    # planner, jobs, books, resources, applications, settings…
│   │   └── layout.tsx       # private shell (sidebar, app chrome)
│   ├── layout.tsx           # root layout + providers
│   ├── page.tsx             # entry redirect
│   ├── robots.ts            # robots.txt
│   └── sitemap.ts           # sitemap.xml
│
├── components/
│   ├── (public)/            # auth forms
│   ├── (private)/           # feature views (Dashboard, Jobs, Planner, …) + Sidebar, ThemeToggle
│   └── shared/              # Modal, ConfirmDialog, Pagination, Skeleton, ui primitives
│
├── lib/
│   ├── api.ts               # fetch wrapper + token handling + auto-refresh
│   ├── auth.tsx             # AuthProvider / useAuth()
│   ├── constants.ts         # shared constants (cookie name, etc.)
│   └── theme.ts             # theme helpers
│
├── proxy.ts                 # route-guard middleware
├── tailwind.config.ts       # Tailwind config
└── next.config.ts           # Next.js config
```

---

## 🌐 API Client

All requests go through the [`api()`](lib/api.ts) helper:

```ts
import { api } from "@/lib/api";

// GET (auth by default)
const { jobs } = await api("/jobs?category=government");

// POST
await api("/applications", { method: "POST", body: { jobName: "44th BCS" } });

// Public / no-auth call
await api("/auth/login", { method: "POST", auth: false, body: { email, password } });
```

It automatically attaches the Bearer token, includes the refresh cookie (`credentials: "include"`),
disables caching, and transparently refreshes the session on a `401`.

For the full list of endpoints, see the backend **[Swagger UI](http://localhost:5000/api/docs)**
and [`backend/README.md`](../backend/README.md).
