# ShiftSync Frontend - https://shiftsync-by-semilogo.netlify.app/

Next.js web app for ShiftSync, the multi-location staff scheduling platform. Provides the manager schedule builder, staff schedule and swap workflows, on-duty dashboard, analytics, notifications, and admin user management.

## Stack

- Next.js 16 (App Router, Turbopack, server components where useful)
- React 19, TypeScript strict
- Tailwind CSS v4 + shadcn/ui (Radix primitives, lucide-react icons)
- TanStack Query v5 for server state (cache, mutations, invalidations)
- axios with an auto-unwrap interceptor (`{data: T}` and pagination envelopes)
- Socket.IO client for live invalidation and toast notifications
- Luxon for timezone-aware rendering
- sonner for toasts, react-hook-form + zod for forms

## Project layout

```
src/
  app/                     route segments (App Router)
    (app)/                 authenticated shell — dashboard, schedule, swaps, etc.
    login, register, ...   public pages and marketing routes
    layout.tsx, page.tsx   root layout + landing
  common/                  shared components, hooks, utils, types
  components/ui/           shadcn primitives (button, dialog, table, ...)
  config/env.ts            typed access to NEXT_PUBLIC_* vars
  lib/api-client.ts        axios instance with cookie auth + auto-unwrap
  modules/                 feature folders, each with components/, services/, types/
    analytics/             overtime, distribution, fairness panels
    app-shell/             sidebar, top nav, RealtimeBridge, RoleGate
    audit/                 audit log table + CSV export
    auth/                  auth-shell, login/register/forgot/reset forms
    availability/          recurring + exception editor
    certifications/        admin grant / revoke
    dashboard/             role-aware home
    landing/               marketing pages
    notifications/         center, bell, prefs
    on-duty/               live who-is-clocked-in view
    schedule/              week grid, shift drawer, validation findings
    settings/              profile + notification prefs
    swaps/                 request swap, drop shift, claim drop, manager queue
    users/                 admin CRUD + cross-team directory lookups
```

## Local development

```bash
cp .env.local.example .env.local   # or create .env.local manually
npm ci
npm run dev                        # http://localhost:3000
```

Required environment variables (Vercel and local):

| Variable | Example | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:3001/api/v1` | REST base URL |
| `NEXT_PUBLIC_REALTIME_URL` | `http://localhost:3001` | Socket.IO origin |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Used in OG tags + email links |

## Deployment (Vercel)

1. Import the repo in Vercel, leaving the root directory at `./` (the repo itself is `shiftsync-frontend`).
2. Set the three `NEXT_PUBLIC_*` variables for Production and Preview.
3. Vercel detects Next.js automatically; build is `next build`, install is `npm ci`.
4. Each preview deploy gets a unique `*.vercel.app` URL — the backend's CORS allow-list matches the wildcard, so previews work out of the box without redeploying the API.

## Key design notes

- **Auth in cookies**: tokens are HTTP-only cookies set by the backend; the axios client uses `withCredentials: true`. There is no localStorage token store.
- **Auto-unwrap interceptor**: backend returns `{data: T}` or `{data: {items, total, page, ...}}`. `apiGet`/`apiPost`/etc. unwrap to `T` directly. Paginated tables use `apiGetPage` to opt out and read the envelope.
- **RoleGate**: routes under `(app)` are gated by a small `RoleGate` wrapper; admin-only pages render an explicit guard so 403s from the API never surface as broken UIs.
- **Realtime bridge**: `RealtimeBridge` mounts once in the shell, joins `/realtime`, and translates server events into TanStack Query invalidations and toasts. Pages don't subscribe individually.
- **Constraint findings**: shift drawer surfaces backend validation findings as a list with explanations and an alternatives panel that suggests staff who pass all constraints. Overridable findings (e.g. 7th consecutive day) prompt the manager for a documented reason before submit.
- **Optimistic concurrency UX**: when the API returns 409 with a stale-version error, the client shows a "another manager updated this shift" toast and refetches; the user sees the latest state without losing their pending edits.
- **Timezone rendering**: shift times are rendered in the location's IANA zone via Luxon, regardless of the viewer's local zone; this makes the manager's display consistent with the staff member's wall clock.

## Seed credentials

| Email | Password | Role | Scoped to |
| --- | --- | --- | --- |
| `testadmin@coastal.test` | `Password!23Secure` | ADMIN | All locations |
| `manager.west@coastal.test` | `Password!23Secure` | MANAGER | Santa Monica, San Diego |
| `manager.east@coastal.test` | `Password!23Secure` | MANAGER | Brooklyn, Boston |
| `alice@coastal.test` | `Password!23Secure` | EMPLOYEE | Santa Monica (Bartender, Server), San Diego (Bartender) |
| `bob@coastal.test` | `Password!23Secure` | EMPLOYEE | Santa Monica (Line cook, Host) |
| `carol@coastal.test` | `Password!23Secure` | EMPLOYEE | San Diego (Server, Host) |
| `david@coastal.test` | `Password!23Secure` | EMPLOYEE | San Diego (Bartender, Line cook) |
| `erin@coastal.test` | `Password!23Secure` | EMPLOYEE | Brooklyn (Bartender, Server), Boston (Server) |
| `frank@coastal.test` | `Password!23Secure` | EMPLOYEE | Brooklyn (Line cook, Host) |
| `grace@coastal.test` | `Password!23Secure` | EMPLOYEE | Boston (Bartender, Server) |
| `henry@coastal.test` | `Password!23Secure` | EMPLOYEE | Boston (Line cook, Host) |

## Scripts

```bash
npm run dev          # turbopack dev server
npm run build        # next build
npm start            # next start
npm run lint         # eslint
./push.sh "msg"      # stage, commit (skipping hooks), push to origin
```

The 5 intentional-ambiguity decisions documented in the brief are recorded in `../DECISIONS.txt` at the repo root and `../shiftsync-backend/DECISIONS.md` for the long-form rationale.

## Decisions on the 5 intentional ambiguities

These are the 5 deliberately-unspecified items from the assignment brief and the choice made for each, with the engineering rationale.

### 1. What happens to historical data when a staff member is de-certified from a location?

Soft delete. Certification rows are never removed; a `decertifiedAt` timestamp is set and the `CertificationSkill` join rows are preserved. Past shift assignments and audit-log entries reference the certification implicitly, so hard-deleting it would orphan history and break "who worked where, when" reporting. Future assignment validation reads `decertifiedAt IS NULL`, so re-certification just nulls the field again. The same row is reused (unique on `userId+locationId`), so re-certifying after a gap restores the original record without duplication.

### 2. How should "desired hours" interact with availability windows?

Availability is a hard constraint; desired hours is a soft preference. Availability is a labor-law and reliability concern — assigning someone outside their stated hours is wrong even if they're under target. Desired hours is a fairness signal: it drives the analytics "Over / Under" status and the fairness score, but never blocks an assignment. Managers see a warning when a staff member is well below their desired hours; they don't see a hard error.

### 3. When calculating consecutive days, does a 1-hour shift count the same as an 11-hour shift?

Binary by calendar day in the location's timezone. Any shift that touches a given local date counts that date as "worked". The labor-law rule the spec is invoking ("7th consecutive day") is a calendar-day rule, not an hours rule. Weighting duration would make a 30-min coffee shift count less than an 8-hour one, but both still legally constitute a worked day. Overnight shifts are attributed to their start date to avoid a single shift counting twice.

### 4. If a shift is edited after swap approval but before it occurs, what should happen?

The approved swap stands. The edited shift triggers a `SHIFT_CHANGED_AFTER_SWAP` notification to both swap parties and re-runs all assignment validators against the new staff member. If the edit invalidates that staff member (e.g. a skill was added they don't have), the manager sees a finding and can override or reassign. Cancelling an approved swap on every minor edit would create churn; the spec only asks for auto-cancel on PENDING swaps. Once approved, the business commitment is made, so the cleaner rule is "notify, re-validate, let the manager act if needed". Pending swaps still auto-cancel immediately on shift edit, exactly as the spec requires.

### 5. How should the system handle a location that spans a timezone boundary?

One IANA timezone per Location, stored on the row. Times are presented in that single zone for that location. A restaurant operates on a single wall clock — staff, customers, and POS all share one local time. Splitting a venue across two zones creates ambiguous shift starts and breaks DST handling. Corporate sets the zone at provisioning. If policy ever changes (e.g. a venue legally adopts a different zone), the field is editable; historical shifts retain UTC instants and render in the new zone going forward.
