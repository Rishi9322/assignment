# Support CRM

A full-stack customer support ticketing system for a whole organization: multiple agents log in with their own accounts, create and manage tickets, route them to internal teams/employees or hand them off to third-party vendors, and admins can configure SLAs, permissions, webhooks, and branding without touching code.

## Live demo

| | |
| --- | --- |
| **App** | <https://client-production-46db.up.railway.app> |
| **API** | <https://assignment-production-5291.up.railway.app/api> |
| **Login** | `admin@datastraw.test` / `password123` |

The demo account is an **Admin**, so it can see every admin page (Users, Permissions, Teams, Webhooks, SLA Rules, Settings, Audit Log). It's seeded with sample users, vendors, tickets, and contacts — feel free to poke at everything.

> This is a shared demo login on a public URL — don't put real/sensitive data in it. Deploying your own instance takes a few minutes; see [Deployment](#deployment) below.

## Stack

- **Client:** React 19 + TypeScript + Vite + Tailwind CSS v4 + TanStack Query + React Router
- **Server:** Node.js + Express + TypeScript, layered as Controllers → Services → Repositories
- **Database:** SQLite via Prisma ORM (swap `DATABASE_URL` to point at Postgres with no code changes)
- **Auth:** JWT sessions, Argon2id password hashing, optional WebAuthn passkey 2FA
- **Hosting:** Railway (both client and server), with a persistent volume for SQLite + uploaded attachments

## Project Structure

```
support-crm/
├── client/     # React frontend
├── server/     # Express API + Prisma schema
└── docs/
```

## Setup (local dev)

### 1. Server

```bash
cd server
npm install
cp .env.example .env
npm run prisma:migrate   # creates the SQLite DB and applies the schema
npm run seed              # optional: sample users, vendors, tickets, teams
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

## Environment variables

### Server (`server/.env`)

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | yes | Prisma connection string, e.g. `file:./dev.db` |
| `PORT` | no | defaults to `4000` |
| `CORS_ORIGIN` | yes | the client's origin, no trailing slash |
| `JWT_SECRET` | yes | long random string — never use the example value in production |
| `JWT_EXPIRES_IN` | no | fallback token lifetime; the effective session length is admin-configurable at runtime via **Settings → Security** and overrides this |
| `WEBAUTHN_RP_NAME` | no | display name shown during passkey registration |
| `WEBAUTHN_RP_ID` | yes for passkeys | must be the client's bare domain (e.g. `myapp.up.railway.app`) |
| `WEBAUTHN_ORIGIN` | yes for passkeys | the client's full HTTPS origin |
| `UPLOAD_DIR` | no | where ticket attachments are stored; defaults to `server/uploads`, point at a mounted volume in production |

### Client (`client/.env`)

| Variable | Required | Notes |
|---|---|---|
| `VITE_API_URL` | yes | the server's `/api` URL — baked in at **build time**, not runtime |

## Authentication

- **Accounts.** Every agent registers their own account (`name`, `email`, `password`, optional `team`). Passwords are hashed with **Argon2id** (memory-hard, salted per-hash automatically).
- **Sessions.** Login issues a JWT, sent as `Authorization: Bearer <token>`. All `/api/*` routes except `/api/auth/*`, `/api/teams`, and `/api/settings` (GET) require it. Session lifetime is admin-configurable at runtime (Settings → Security), not just via `JWT_EXPIRES_IN`.
- **Account lockout.** After a configurable number of failed login attempts (default 5), an account locks for a configurable duration (default 15 minutes) — both configurable from Settings → Security. Admins can unlock an account immediately from `/admin/users`.
- **Passkey 2FA (optional, per-user).** From the **Security** page, a user can register a WebAuthn passkey (Windows Hello, Touch ID, or a security key) via `@simplewebauthn`. Once registered, subsequent logins become two-step: password first, then a passkey assertion, before a full session token is issued. WebAuthn requires the RP ID/origin to match the serving domain — see the env var table above.

## Features

### Ticketing core

- Multi-user: every agent has their own account and logs in independently
- Create tickets with customer info, priority, auto-generated ticket ID, and an SLA-derived due date
- Persistent **contacts**: every ticket links to a `Contact` record keyed by customer email, so repeat-customer history is visible across tickets, not just per-ticket
- Paginated, sortable, filterable ticket list with **saved views** (all / mine / urgent / unassigned / blocked), free-text search, and status/team filters
- Ticket detail view: description, attachments, and full event timeline on one side; status/priority/SLA/assignment controls on the other
- Real audit trail: every status change, priority change, (re)assignment, note, reopen, next-action update, and attachment is a timestamped, attributed `TicketEvent`
- Assign a ticket to an internal team and/or specific employee, **or** hand it off to a third-party vendor (**Fixed** for long-term contracted vendors, **Temporary** for one-off outsourcing) — enforced single ownership between employee and vendor
- **Document management**: upload/download/delete attachments per ticket (15MB limit), stored on disk and logged in the timeline
- **SLA Risk Radar** — tickets within 25% of their remaining SLA window are flagged `at_risk` ahead of an actual breach
- **Vendor Reliability Score** — deterministic 0–100 score per vendor from average resolution time and reopen rate

### Admin & configuration

- **Team directory** (`/admin/teams`) — DB-backed, admin-managed team list (create/archive) instead of a hardcoded set, plus per-team backlog/pressure score
- **Roles & permissions matrix** (`/admin/permissions`, Admin-only) — grant Agents specific admin capabilities (`manage_teams`, `manage_sla`, `manage_webhooks`, `view_audit_log`) without promoting them to full Admin
- **SLA rule editor** (`/admin/sla-rules`) — per-priority resolution windows are admin-configurable at runtime, not hardcoded
- **Webhooks** (`/admin/webhooks`) — outbound HTTP callbacks on ticket events (`ticket.created`, `ticket.status_changed`, `ticket.priority_changed`, `ticket.assigned`, `ticket.note`, `ticket.reopened`, `ticket.blocked`, `ticket.next_action_set`, `ticket.attachment_added`), HMAC-SHA256 signed (`X-Webhook-Signature`), with a delivery log and a one-click test ping
- **System settings** (`/admin/settings`) — organization name, support email, accent color, and per-status/per-priority display-label overrides (the underlying workflow values never change, only what's shown)
- **Security settings** (same page) — configurable session timeout and login-lockout thresholds
- **Notification center** — in-app bell with unread count; agents are notified when assigned, when a ticket they own changes status, or gets a new note (never self-notified)
- Users admin (`/admin/users`): change roles, deactivate/reactivate accounts (revokes access on the very next request, not just future logins), unlock locked accounts
- `/admin/audit-log` — the same `TicketEvent` stream used per-ticket, unscoped, org-wide

### Everything else

- Voice-to-ticket demo (`/voice-ticket`, linked from the landing page) — browser Speech Recognition + a keyword-matching draft extractor (explicitly not AI), review-and-confirm creates a real ticket through the same API as the New Ticket form
- Light/Dark theme, persisted to `localStorage`, defaults to OS preference
- Public landing page at `/` with a live product preview
- Vendor directory page

## API

See `server/src/routes/*.routes.ts` for the full, current route list — the API surface has grown past what's practical to hand-maintain in a table (tickets, auth, teams, contacts, vendors, attachments, webhooks, SLA rules, permissions, notifications, settings, and admin all have their own router). A few entry points to start from:

| Method | Route | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` / `/api/auth/login` | Account creation / login (returns a token, or an MFA challenge if a passkey is registered) | none |
| GET/POST | `/api/tickets` | List (paginated/filtered/sorted) / create tickets | yes |
| GET/PUT | `/api/tickets/:ticketId` | Ticket detail (+ timeline) / update | yes |
| POST/GET | `/api/attachments/ticket/:ticketId` | Upload / list attachments | yes |
| GET | `/api/notifications` | Current user's notifications | yes |
| GET | `/api/settings` | Public branding + label config | none |
| GET/PATCH | `/api/admin/sla-rules`, `/api/admin/webhooks`, `/api/admin/team-directory` | Admin-configurable resources | yes (Admin, or delegated permission) |

## Database Schema

Defined in `server/prisma/schema.prisma`. Core models: `User`, `Passkey`, `Contact`, `Team`, `Vendor`, `Ticket`, `TicketEvent`, `Attachment`, `Webhook`, `WebhookDelivery`, `SlaRule`, `RolePermission`, `Notification`, `Settings` (singleton). Run `npx prisma studio` in `server/` for a live browsable view of your local DB.

### Lifecycle & business rules

- **Status lifecycle:** `Open → Triaged → InProgress → WaitingOnCustomer / WaitingOnVendor → Resolved → Closed`, freely transitionable. Moving from a terminal status back to a non-terminal one is a **reopen**: increments `reopenCount`, prompts for a reason, logs a `reopened` event.
- **Priority & SLA:** `Low | Medium | High | Urgent`, each with an admin-configurable resolution window (defaults: 4h / 24h / 72h / 168h) that sets `dueAt` on creation and recomputes it on priority change.
- **Single ownership:** a ticket is owned by either an internal employee **or** a vendor, never both — enforced server-side, auto-clears the other when one is set.
- **Race-safe ticket IDs:** `TKT-###` is derived from the row's own autoincrement `id` inside a transaction, not a pre-read `count()`, so concurrent creates can never collide.

## Testing

```bash
cd server && npm test
```

Vitest + Supertest against a dedicated SQLite test database (`prisma/test.db`, migrated fresh by `tests/globalSetup.ts`), covering the riskiest logic: ticket-ID concurrency under load, the single-ownership rule, and admin/permission gating (including that deactivation revokes an already-issued token on its very next use).

Test files run sequentially against one shared SQLite connection (`fileParallelism: false`, `singleFork: true` in `vitest.config.ts`) — running them concurrently races one file's `resetDb()` against another's in-flight inserts.

## Deployment

The live demo runs on **Railway**: two services (`server`, `client`) in one project, the server backed by a persistent volume (`/data`) for SQLite + attachments so they survive restarts and redeploys.

```bash
# Server
cd server && npm run build && npm start   # start = prisma migrate deploy && node dist/server.js

# Client
cd client && npm run build                 # outputs client/dist
npm run start                              # serves it with `serve` (or deploy dist/ to any static host)
```

Key points if you're setting up your own Railway deployment:

- Point each service's root directory at `support-crm/server` and `support-crm/client` respectively (or deploy via `railway up server --path-as-root` / `railway up client --path-as-root` from the repo root)
- Attach a volume to the server at `/data`, and set `DATABASE_URL=file:/data/prod.db`, `UPLOAD_DIR=/data/uploads`
- Set `VITE_API_URL` on the client **before** its first build — Vite inlines it at build time
- Set `CORS_ORIGIN`, `WEBAUTHN_RP_ID`, `WEBAUTHN_ORIGIN` on the server once the client's domain is known
- Nixpacks needs `engines.node >= 20` (already set in both `package.json`s) and `NIXPACKS_PKGS=python3 gcc gnumake` on the server so `argon2`'s native addon can build

`server/railway.json` and `client/railway.json` pin the build/start commands explicitly.
