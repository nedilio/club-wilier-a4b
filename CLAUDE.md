# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

Club Wilier Chile: a membership app for Wilier cyclists. Members log in with RUT + email (OTP code by email), see a digital membership card with a QR code, and can add it to Apple/Google Wallet. Admins can broadcast push notifications to Apple Wallet passes. UI copy, error messages and docs (`docs/`) are in Spanish.

Stack: Next.js 16 App Router (React 19), Tailwind v4 + shadcn/ui (radix), Drizzle ORM on Neon Postgres, `jose` JWT, Resend email, BSale (Chilean ERP) as the source of member data. Package manager is **pnpm**.

## Commands

```bash
pnpm dev                     # dev server on :3000
pnpm build                   # production build
pnpm lint                    # eslint
pnpm test                    # vitest run (unit + integration; needs a test DB)
pnpm test src/__tests__/unit/lib/auth/rut.test.ts   # single file
pnpm test -t "name of test"  # filter by test name
pnpm test:notifications      # notification/push tests only; fully mocked, no DB needed
pnpm test:e2e                # playwright (starts `pnpm dev` itself; :3000 must be free)
pnpm drizzle-kit generate    # create a migration in src/db/migrations from schema.ts changes
pnpm drizzle-kit migrate     # apply migrations to DATABASE_URL
```

### Test environment

- Vitest and Playwright both load `.env.test.local`, which must define `DATABASE_URL_TEST` (a separate Neon branch/DB). The vitest config maps it to `DATABASE_URL` and stubs `JWT_SECRET`, `RESEND_API_KEY`, `BSALE_ACCESS_TOKEN`.
- `src/__tests__/global-setup.ts` runs `drizzle-kit push --force` against the test DB before every run. Without `DATABASE_URL_TEST` it only warns, and integration tests then fail.
- Test files run serially (`fileParallelism: false`) because they share one DB. Use `src/__tests__/helpers/db.ts` (`cleanDb`, `seedUser`, `seedOtpForTest`, `seedSession`); e2e tests import the same helpers.
- Default vitest environment is `node`. Component tests opt into `happy-dom` per file.

## Architecture

**Auth flow** (`src/app/api/auth/*`, `src/lib/auth/*`):
1. `request-otp`: validate/clean the RUT (`rut.ts` `cleanRut` strips dots/spaces and lowercases, keeping any dash), look up the local `users` row and fall back to BSale `getClientByRut`, store a hashed 6-digit OTP (expires in 5 min), and email it via Resend.
2. `verify`: check the OTP. On first login, fetch the BSale client and membership (`getMembershipName`), create the user with a `qrToken` (only for club members), then sign a JWT and insert a `sessions` row holding the **SHA-256 hash** of the token. The session goes in an httpOnly `session` cookie (7d).
3. There are two levels of checking. `src/proxy.ts` (the Next 16 replacement for `middleware.ts`) only checks the JWT signature, redirecting `/` → `/login` and guarding `/card` and `/notifications`. Sensitive server code must also check the DB session row; see `authorizeNotifications()` in `lib/auth/admin.ts`.

**Admin / notifications**: an admin is any user whose email is in the comma-separated `ADMIN_EMAILS` env var. `/notifications` uses a server action (`app/notifications/actions.ts`) that calls `authorizeNotifications()`, then `sendAppleWalletPushNotification` in `app/api/wallet/apple/push/push.ts`. That function sends APNs pushes to every `wallet_registrations` row through the `apn` package and records the message in `notifications`. The pass then shows the latest notification message when it is regenerated.

**Wallet**:
- Apple: `lib/wallet/apple.ts` builds `.pkpass` files with `passkit-generator`, using images from `public/` (`getImageBuffer`). `app/api/wallet/apple/v1/**` implements Apple's PassKit web service protocol: device registration, fetching updated passes, and logging. Those routes authenticate with the `ApplePass <token>` header, where the token is the user's `qrToken`. Certificates and keys come from `APPLE_*` env vars.
- Google: `lib/wallet/google.ts` produces a signed save-to-wallet JWT from the `GOOGLE_WALLET_*` service-account env vars. The button in the UI is currently disabled.

**QR verification**: the QR on the card points to `/api/verify/[qrToken]`, a public route that redirects to the `/verify` page with the RUT and membership in the query string.

**DB**: `src/db/schema.ts` is the single source of truth. `src/db/index.ts` creates one Neon `Pool` over WebSockets (`ws`), cached on `globalThis` outside production, and exports `db` and `schema`. Columns use camelCase names in SQL.

## Conventions

- Route handlers validate request bodies with zod and return `{ success: boolean, error?: string }` JSON with Spanish messages.
- Dynamic route `params` and `cookies()` are async (Next 16). Read `node_modules/next/dist/docs/` before relying on any Next API (see AGENTS.md).
- Path alias `@/*` → `src/*`. shadcn components live in `src/components/ui`.
- Project-specific agent skills are vendored in `.agents/skills/` (drizzle, neon, next, shadcn, tailwind v4, playwright, commit-message, etc.).
