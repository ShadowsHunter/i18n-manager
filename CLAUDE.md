# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MultiLanguageManager is a full-stack web app for managing multilingual text entries across iOS, Android, and Web platforms. Supports 11 languages: CN, EN, DE, ES, FI, FR, IT, NL, NO, PL, SE.

## Development Commands

### Frontend (root directory)
```bash
npm run dev          # Vite dev server
npm run build        # tsc + vite build
npm run lint         # ESLint
npm run format       # Prettier
npm run typecheck    # tsc --noEmit
```

### Backend (backend/ directory)
```bash
npm run dev          # ts-node-dev with auto-restart
npm run build        # tsc + prisma generate
npm run start        # node dist/server.js
npm run test         # Jest with coverage
npm run test:watch   # Jest in watch mode
npm run lint         # ESLint
npm run format       # Prettier
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run migrations (dev)
npm run prisma:migrate:deploy  # Run migrations (prod)
npm run prisma:studio      # Open Prisma Studio GUI
```

### Running Both
Start backend on port 3001, then frontend. Frontend expects `VITE_API_BASE_URL` env var (defaults to `http://localhost:3001/api/v1`).

## Architecture

### Monorepo Structure
- **Root `/`** — React + Vite frontend
- **`/backend`** — Express.js API server

### Backend (`backend/src/`)
Express app with layered architecture: **routes → services → Prisma client**.

- `server.ts` → entry point, registers routes via `registerRoutes()`
- `app.ts` → Express setup (helmet, CORS, compression, morgan logging)
- `routes/` — route handlers grouped by resource: `projectRoutes`, `entryRoutes`, `exportRoutes`, `apiKeyRoutes`, `authRoutes`, `entryUpload`
- `services/` — business logic: `ProjectService`, `EntryService`, `ExportService`, `ApiKeyService`, `AuthService`
- `middleware/` — `auth` (JWT), `rateLimiter`, `errorHandler`, `fileUpload` (multer)
- `config/` — env-based config, defaults to SQLite dev mode
- `prisma/schema.prisma` — database schema (PostgreSQL prod, SQLite dev)

API prefix: `/api/v1/`. Key endpoints: `/projects`, `/projects/:id/entries`, `/exports`, `/api-keys`, `/auth`.

### Frontend (`src/`)
React SPA with client-side routing.

- `pages/` — route-level components: `Dashboard`, `ProjectDetail`, `UploadExcel`, `ExportDownload`, `Settings`, `ApiKeys`, `Login`
- `components/` — reusable UI: `Button`, `Input`, `Card`, `Modal`, `Badge`, `Alert`, `Loading`, `ErrorBoundary`, `Toast`
- `services/apiClient.ts` — Axios instance with JWT interceptor, all TypeScript interfaces (`Project`, `Entry`, `ApiKey`, `Export`, etc.)
- `services/api.ts` — API function calls
- `contexts/AuthContext.tsx` — auth state management
- `layouts/DashboardLayout.tsx` — main app shell
- `styles/design-system.css` — CSS custom properties for the design system

### Database (Prisma)
5 models: `Project`, `Entry`, `Export`, `ApiKey`, `User`, `RefreshToken`. Entry model has nullable columns per language (`cn`, `en`, `de`, etc.) with `@db.VarChar(500)`.

## Key Conventions

- Backend uses `express-async-errors` for async route handlers (no try/catch wrapping needed)
- Auth via JWT in `Authorization: Bearer <token>` header
- API responses use envelope: `{ success, data?, message?, error? }`
- Pagination response: `{ entries, pagination: { page, limit, total, totalPages } }`
- Frontend uses Tailwind CSS with custom CSS variables defined in `design-system.css`
- Rate limiting: 100 req/hour default, separate limit for uploads
- Environment config via `dotenv` in backend, Vite env vars in frontend
