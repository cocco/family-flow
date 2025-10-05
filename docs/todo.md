# Family Flow — Prioritized TODO

Goal: ship visible core flows fast using mocked data. Defer auth and DB until later phases. Aligns with docs in `docs/` (PRD, architecture, backend, frontend).

## Phase 1 — Child Functionality (mocked, with seed data; no auth, no DB)
- [x] Bootstrap frontend (React + TypeScript + Vite)
  - [x] Add Tailwind CSS
  - [x] Add React Router (routes for child dashboard)
  - [x] Add Context for app/session (temporary role switcher)
  - [x] Configure ESLint/Prettier (TS strict)
  - [x] Env validation at startup (safe defaults)
- [x] Mock API client and fixtures (child-focused)
  - [x] Define API response shape `{ data }` / `{ error: { code, message, details? } }`
  - [x] Create in-memory stores for users, chores, bonus tasks
  - [x] Simulate network latency and error cases
  - [x] Enforce role gating for child actions
- [x] Child Dashboard (UI only, mock-backed)
  - [x] Monthly chores and bonus tasks checklist (mark complete)
  - [x] Available bonus tasks list (reserve)
  - [x] Earnings tracker (monthly allowance + approved bonus rewards)
- [x] Child flows (mock services)
  - [x] List chores by child for current month
  - [x] Reserve bonus task — prevent double reservation in-memory
  - [x] Mark chore/task completed (child)
- [x] Allowance summary (client-calculated)
  - [x] Show monthly base allowance + approved bonus totals
  - [x] Display combined total in child dashboard footer
- [x] Accessibility & mobile-first (scope: child screens)
  - [x] Keyboard navigation, labels, focus rings, contrast
  - [x] Responsive layout for child dashboard and lists
- [x] Testing (scope: child flows)
  - [x] Unit tests for allowance calculation and reservation logic
  - [x] Component tests for chores checklist interactions
- [x] Seed data (child scope)
  - [x] Seed 1 parent (placeholder) + 2 children, chores, and available bonus tasks

Exit criteria (Phase 1): A child can use the app with mocked data to view chores, reserve/complete bonus tasks, complete chores, and see monthly earnings.

## Phase 2 — Parent Functionality (mocked, with seed data; no auth, no DB)
- [x] Parent Dashboard (UI only, mock-backed)
  - [x] Family overview: list children with base allowance and totals
  - [x] Trust-based: no approvals UI or flow
  - [x] Create chore modal (client-side only)
  - [x] Create bonus task modal (client-side only)
  - [x] Family totals card (base, bonus, total)
- [x] Parent flows (mock services)
  - [x] Create/update/delete bonus tasks
  - [x] Create/update/delete chores
- [x] Allowance roll-ups (client-calculated)
  - [x] Per-child monthly summaries (base, bonus, total)
  - [x] Family overview totals
- [x] Accessibility & mobile-first (scope: parent screens)
  - [x] Responsive layout for parent dashboard cards and lists
  - [x] Keyboard navigation, labels, focus rings, contrast
- [x] Testing (scope: parent flows)
  - [x] Component tests for creation modals and summaries
- [x] Seed data (parent scope)
  - [x] Preload pending approvals and a mix of completed/pending items

Exit criteria (Phase 2): A parent can manage chores and bonus tasks and see allowance summaries using mocked data. No approvals are required (trust-based).

## Phase 3 — Thin Backend Scaffold (still in-memory)
- [ ] Create Node.js Express server (TypeScript)
  - [ ] Centralized error handler using docs error shape
  - [ ] CORS, request logging (redacted), input validation (reject unknown fields)
  - [ ] Health endpoint `/health`
- [ ] Implement routes per `docs/backend.md` (mock stores)
  - [ ] `GET/POST/PUT/DELETE /api/chores`
  - [ ] `GET/POST/PUT/DELETE /api/tasks`
  - [ ] `POST /api/tasks/:id/reserve`, `PUT /api/tasks/:id/complete`, `PUT /api/tasks/:id/approve`
  - [ ] `PUT /api/chores/:id/complete`, `PUT /api/chores/:id/approve`
  - [ ] `GET /api/allowances` and child summaries (calculated from in-memory data)
- [ ] Align frontend to call backend instead of local mocks (feature flag)
- [ ] Basic integration tests for key endpoints (Jest + supertest)

Exit criteria (Phase 3): Frontend optionally talks to an in-memory backend with the same API contracts.

## Phase 4 — Authentication & RBAC
- [ ] Implement JWT auth (login, logout, me)
- [ ] Enforce role-based access on all endpoints
- [ ] Secure password hashing (bcrypt), session invalidation
- [ ] Frontend auth flows (login, role-based routing/guards)

Exit criteria (Phase 4): All sensitive operations protected; UI adapts to role.

## Phase 5 — Persistence & Data Model
- [ ] SQLite for dev, PostgreSQL for prod
- [ ] Migrations for users, chores, bonus tasks, reservations, allowances
- [ ] Repository layer with parameterized queries
- [ ] Replace in-memory stores with DB persistence
- [ ] Server-side allowance calculations (consistent with Phase 1 logic)
- [ ] Seed scripts for dev

Exit criteria (Phase 5): Data persists across restarts; same behavior as mocks.

## Phase 6 — Quality, Deployment, and Docs
- [ ] Validation hardening and input sanitization
- [ ] Centralized logging with request IDs; redact sensitive fields
- [ ] Test coverage on critical paths (unit + integration)
- [ ] E2E happy-path flows (parent approve, child reserve/complete)
- [ ] CI: build, lint, type-check, tests on PRs and main
- [ ] Deploy: Frontend (Vercel/Netlify), Backend (Railway/Render), DB (managed Postgres)
- [ ] `.env.example` and README updates with setup and envs

## Nice-to-haves / Future (from PRD)
- [ ] Notifications (task completed, task available)
- [ ] PWA/offline enhancements
- [ ] Gamification (badges, levels)
- [ ] Mobile apps
- [ ] Payment provider integrations

---

Notes
- Follow API contracts and error shapes exactly as defined in `docs/backend.md`.
- Do not log secrets or PII; reject unknown fields at the edge.
- Keep implementation lightweight and responsive per `docs/architecture.md` and `docs/frontend.md`.


