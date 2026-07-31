# Support CRM

A full-stack customer support ticketing system for a whole organization: multiple agents log in with their own accounts, create and manage tickets, and route them to an internal team/employee or hand them off to a third-party vendor.

## Stack

- **Client:** React + TypeScript + Vite + Tailwind CSS v4 + TanStack Query + React Router
- **Server:** Node.js + Express + TypeScript, layered as Controllers → Services → Repositories
- **Database:** SQLite via Prisma ORM (swap `DATABASE_URL` to point at Postgres with no code changes)
- **Auth:** JWT sessions, Argon2id password hashing, optional WebAuthn passkey 2FA

## Project Structure

```
support-crm/
├── client/     # React frontend
├── server/     # Express API + Prisma schema
└── docs/
```

## Setup

### 1. Server

```bash
cd server
npm install
cp .env.example .env
npm run prisma:migrate   # creates the SQLite DB and applies the schema
npm run seed              # optional: sample users, vendors, tickets
npm run dev                # http://localhost:4000
```

Sample login after seeding: `admin@datastraw.test` / `password123`.

### 2. Client

```bash
cd client
npm install
cp .env.example .env
npm run dev               # http://localhost:5173
```

Open http://localhost:5173, register an account (or use the seeded login above). The client talks to the API at the URL in `client/.env` (`VITE_API_URL`, defaults to `http://localhost:4000/api`).

## Authentication

- **Accounts.** Every agent registers their own account (`name`, `email`, `password`, optional `team`). Passwords are hashed with **Argon2id** (memory-hard, salted per-hash automatically).
- **Sessions.** Login issues a JWT (`JWT_SECRET`/`JWT_EXPIRES_IN` in `.env`), sent as `Authorization: Bearer <token>`. All `/api/*` routes except `/api/auth/*` require it.
- **Passkey 2FA (optional, per-user).** From the **Security** page, a user can register a WebAuthn passkey (Windows Hello, Touch ID, or a security key) via `@simplewebauthn`. Once registered, subsequent logins become two-step: password first, then a passkey assertion, before a full session token is issued. Users with no passkey registered continue to log in with just a password. WebAuthn requires the RP ID/origin to match the serving domain — see `WEBAUTHN_RP_ID` / `WEBAUTHN_ORIGIN` below (defaults are set for local dev over `localhost`).

## API

| Method | Route                            | Body / Query                                                       | Description                              | Auth |
|--------|-----------------------------------|----------------------------------------------------------------------|--------------------------------------------|------|
| POST   | `/api/auth/register`              | `{ name, email, password, team? }`                                  | Create an account                          | none |
| POST   | `/api/auth/login`                 | `{ email, password }`                                                | Login; returns a token, or an MFA challenge if a passkey is registered | none |
| POST   | `/api/auth/login/passkey/verify`  | `{ mfa_token, response }`                                            | Complete passkey 2FA, returns full token   | none |
| GET    | `/api/auth/me`                    | —                                                                    | Current user                               | yes |
| POST   | `/api/auth/passkeys/register/options` / `/verify` | —  / `{ response, nickname? }`                      | Register a new passkey                     | yes |
| GET/DELETE | `/api/auth/passkeys` / `/api/auth/passkeys/:id` | —                                                | List / remove passkeys                     | yes |
| POST   | `/api/tickets`                    | `{ customer_name, customer_email, subject, description, priority? }` | Create a ticket (creator = logged-in user) | yes |
| GET    | `/api/tickets`                     | query: `?status=...&search=...&team=...`                             | List tickets (search + filter)             | yes |
| GET    | `/api/tickets/:ticketId`           | —                                                                    | Get ticket details + full event timeline   | yes |
| PUT    | `/api/tickets/:ticketId`           | `{ status?, notes?, priority?, team?, assigned_to_user_id?, vendor_id? }` | Update status/priority/notes, or assign — logs an event for each change | yes |
| POST   | `/api/tickets/:ticketId/notes`     | `{ message }`                                                        | Append a note (logged as an event)         | yes |
| GET    | `/api/teams`                       | —                                                                    | List of assignable teams                   | yes |
| GET    | `/api/users`                       | —                                                                    | Employee directory (for assignment)        | yes |
| GET/POST | `/api/vendors`                   | — / `{ name, type: "Fixed"\|"Temporary", contact_email?, contact_phone?, notes? }` | Third-party vendor directory | yes |
| GET    | `/api/stats`                       | —                                                                    | Ticket counts: total, open, in_progress, closed, unassigned, overdue, waiting_on_vendor, resolved_today | yes |
| GET    | `/api/stats/trend`                 | —                                                                    | Tickets created per day, last 14 days      | yes |

## Database Schema

**User**: `id, name, email, passwordHash, role (Admin/Agent), team, createdAt`

**Passkey**: `id, userId (fk), credentialId, publicKey, counter, deviceType, backedUp, transports, nickname, createdAt`

**Vendor**: `id, name, type (Fixed/Temporary), contactEmail, contactPhone, notes, createdAt`

**Ticket**: `id, ticketId (TKT-001…), customerName, customerEmail, subject, description, status, priority, team, dueAt, firstRespondedAt, resolvedAt, reopenCount, createdByUserId (fk User), assignedToUserId (fk User, nullable), vendorId (fk Vendor, nullable), createdAt, updatedAt`

**TicketEvent**: `id, ticketId (fk), actorUserId (fk User, nullable), type (created/status_changed/priority_changed/assigned/note/reopened), fromValue, toValue, message, createdAt` — the full audit trail; replaces the old standalone Note model (notes are now `type: "note"` events, unified with everything else that happens to a ticket)

### Lifecycle & business rules

- **Status lifecycle:** `Open → Triaged → InProgress → WaitingOnCustomer / WaitingOnVendor → Resolved → Closed`, freely transitionable (no forced linear path). Moving from a terminal status (`Resolved`/`Closed`) back to a non-terminal one is a **reopen**: it increments `reopenCount`, prompts for a reason client-side, and logs a `reopened` event.
- **Priority & SLA:** `Low | Medium | High | Urgent`, each with a resolution SLA (7d / 3d / 1d / 4h) that sets `dueAt` on creation and recomputes it on priority change. `overdue` is computed on read (`status` not terminal AND `dueAt` in the past), not stored.
- **Single ownership:** a ticket is owned by either an internal employee **or** a vendor, never both. Setting one via `PUT /api/tickets/:id` auto-clears the other if it was previously set; explicitly setting both in the same request is rejected with 400. `team` is a separate routing label and can coexist with either.
- **Race-safe ticket IDs:** `TKT-###` is derived from the row's own autoincrement `id` inside a transaction (create → read back `id` → set `ticketId`), not from a pre-read `count()` — so concurrent creates can never collide.

## Features

1. Multi-user: every agent has their own account and logs in independently — the app supports a whole organization working concurrently against the same ticket data
2. Create tickets with customer info, priority, auto-generated ticket ID, and an SLA-derived due date
3. List all tickets (ID, name, title, priority, status, assignee, age) with an overdue-tinted row and left-border cue
4. Live search across name, ID, email, and description; filter by status and by team
5. Ticket detail view: two-column layout — description + full event timeline on the left, status/priority/SLA/assignment controls on the right
6. Real audit trail: every status change, priority change, (re)assignment, note, and reopen is a timestamped, attributed `TicketEvent` — not just a flat note list
7. Assign a ticket to an internal team and/or specific employee, **or** hand it off to a third-party vendor (marked **Fixed** for long-term contracted vendors or **Temporary** for one-off outsourcing) — enforced single ownership between employee and vendor
8. Vendor directory page to register third-party companies
9. Optional passkey (WebAuthn) two-factor login per account, managed from the Security page
10. Operational dashboard: stat cards, a "Needs Attention" row (Unassigned / Overdue / Waiting on Vendor / Resolved Today), a 14-day ticket-volume chart, and a recent-activity feed
11. Light/Dark theme — an animated toggle in the navbar, persisted to `localStorage` (defaults to the OS preference on first visit). Colors run through CSS custom properties (`--color-*` in `client/src/index.css`) rather than per-component overrides, so the whole app re-themes from one `.dark` class swap
12. Admin panel (`/admin/users`, `/admin/teams`, `/admin/audit-log`, gated by `role === "Admin"` both client-side and server-side): manage roles, deactivate/reactivate accounts (deactivation revokes access on the very next request, not just future logins), per-team backlog/pressure, and a global audit log across every ticket
13. Public landing page at `/` explaining the product with a styled dashboard preview; authenticated users land on `/dashboard`
14. **SLA Risk Radar** — tickets within 25% of their remaining SLA window (and not yet overdue) are flagged `at_risk`, surfaced on the dashboard, ticket table (amber left-border), and ticket detail, ahead of an actual breach
15. **Vendor Reliability Score** — deterministic 0-100 score per vendor from average resolution time and reopen rate on tickets currently assigned to them (`server/src/utils/vendorReliability.ts`) — not a prediction, shown on the Vendors page
16. **Team pressure score** (`/admin/teams`) — deterministic 0-100 backlog-pressure score per team from backlog size, urgent load, SLA breaches, and tickets aging 3+ days (`server/src/utils/queuePressure.ts`)

## Admin panel

- Any user's `role` can be changed between `Admin`/`Agent`, and accounts can be deactivated/reactivated, from `/admin/users` — self-modification is blocked (`400`) so an admin can't lock themselves out.
- Deactivating a user is enforced in `requireAuth` itself (a DB check per request), not just at login — so it takes effect immediately even against an already-issued JWT that hasn't expired yet.
- `/admin/teams` shows backlog and a deterministic pressure score per team.
- `/admin/audit-log` is the same `TicketEvent` stream used per-ticket, but unscoped — every status change, assignment, and note across the whole organization, most recent first.

## Testing

```bash
cd server && npm test
```

A real (not smoke-only) suite using Vitest + Supertest against a dedicated SQLite test database (`prisma/test.db`, migrated fresh by `tests/globalSetup.ts`), covering the riskiest logic in the app:

- **Ticket ID concurrency** — 10 concurrent `POST /api/tickets` produce 10 unique, sequential `TKT-###` ids.
- **Single-ownership rule** — rejects setting both an employee and a vendor in one request; confirms auto-clear behavior when one is set after the other.
- **Admin gating** — 403 for non-admins, 200 for admins, 401 for unauthenticated, self-modification blocked, and deactivation revokes an already-issued token on its very next use.

Test files run sequentially against one shared SQLite connection (`fileParallelism: false`, `singleFork: true` in `vitest.config.ts`) — running them concurrently causes one file's `resetDb()` to race another's in-flight inserts against the same tables, which isn't a real app bug, just a fixture-sharing hazard.

## Build for production

```bash
cd server && npm run build && npm start
cd client && npm run build   # outputs client/dist, deploy as a static site
```

## Deployment notes

- **Server:** deploy to Railway/Render. Set `DATABASE_URL`, `CORS_ORIGIN` (the deployed client URL), `JWT_SECRET`, `WEBAUTHN_RP_ID` (the client's domain, e.g. `myapp.vercel.app`), and `WEBAUTHN_ORIGIN` (the client's full origin, e.g. `https://myapp.vercel.app`) as env vars. Run `npm run prisma:deploy` on release to apply migrations.
- **Client:** deploy to Vercel/Netlify. Set `VITE_API_URL` to the deployed server's `/api` URL.
- **WebAuthn in production:** the RP ID must match the domain serving the client, and the origin must be HTTPS (browsers treat `localhost` as a secure context for dev, but production requires TLS).
- **Passkey challenge storage** is in-memory, scoped to a single server instance — fine for one instance, but a horizontally-scaled deployment should back it with Redis so challenges survive across instances within their 5-minute TTL.
