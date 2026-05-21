# Appointment Booking App

A web-based appointment booking system for small service businesses. Clients book without creating an account; the business owner manages everything from an authenticated dashboard.

## Tech stack

- **Framework** — SvelteKit 5 (Svelte 5 runes, server actions)
- **Database** — Neon PostgreSQL via Drizzle ORM
- **Auth** — Better Auth (email + password, owner-only)
- **Email** — Resend (confirmation and reminder emails)
- **Deployment** — Netlify (serverless functions adapter)

## Routes

| Route | Who | What |
|---|---|---|
| `/book` | Clients | Book an appointment (no account needed) |
| `/book/success` | Clients | Post-booking confirmation page |
| `/confirm` | Clients | Confirm attendance from a reminder email link |
| `/dashboard` | Owner | Week-view calendar; create, reschedule, cancel, send reminders |
| `/dashboard/services` | Owner | Manage bookable services and durations |
| `/login` | Owner | Sign in |

## Local setup

### 1. Install dependencies

```sh
pnpm install
```

### 2. Configure environment

```sh
cp .env.example .env
```

Required:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Random 32-character secret |
| `ORIGIN` | Base URL (e.g. `http://localhost:5173`) |
| `BUSINESS_TIMEZONE` | IANA timezone (e.g. `America/New_York`) |

Optional — email (confirmation + reminders):

| Variable | Description |
|---|---|
| `RESEND_API_KEY` | Resend API key |
| `RESEND_FROM` | Verified sender address |
| `BUSINESS_NAME` | Shown in email copy |
| `DEFAULT_SERVICE_NAME` | Fallback service label |
| `APPOINTMENT_PREP_NOTES` | "What to bring" copy in confirmation emails |

### 3. Run migrations

```sh
pnpm db:migrate
```

### 4. Start the dev server

```sh
pnpm dev
```

## Database commands

```sh
pnpm db:generate   # generate migrations from schema changes
pnpm db:migrate    # apply pending migrations
pnpm db:push       # push schema directly (dev only)
pnpm db:studio     # open Drizzle Studio
```

## Testing

```sh
pnpm test:unit   # Vitest unit and component tests
pnpm test:e2e    # Playwright end-to-end tests
pnpm test        # run both
```

## Build and deploy

```sh
pnpm build     # production build via Netlify adapter
pnpm preview   # preview production build locally
```

Deploy by pushing to your Netlify-connected branch. Set all required environment variables in the Netlify dashboard under **Site settings → Environment variables**.
