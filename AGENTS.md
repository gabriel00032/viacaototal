# Base44 sandbox notes — Viação Total

Next.js 14 (App Router) served by `next dev` from a bind-mounted checkout; no separate backend process.

## Run
- `docker compose -f docker-compose.base44.yml up -d` → http://localhost:3000
- Dependencies are installed on container start (`npm ci`) into a named volume at `/app/node_modules`; the repo's
  `node_modules/` is empty on the host, so host-side commands do not exist. Run everything inside the container:
  `docker compose -f docker-compose.base44.yml exec -T web npx vitest run`
- First request after a restart compiles the route (a few seconds); the healthcheck has a 180s grace period.
- `npx next build` is never needed for the preview; edits hot-reload.

## Storage
- No database. All site/admin data lives in `data/db.json` (read/write via `src/lib/store.ts`), which is part of the
  bind mount — admin edits persist on the host checkout and show up in `git status`.
- Image/schedule lookups are external HTTP calls (`/api/horarios`, `/api/poltronas`) that need the optional
  `VIAJETOTAL_API_TOKEN` / `VIAJETOTAL_API_TOKEN_MOTTA` secrets; without them the API answers 503 and the site
  degrades to its empty state. `prisma/schema.prisma` is documentation for a future PostgreSQL migration only and is
  not used by the app.
- Admin panel at `/admin`: credentials come from `data/db.json` (`adminCreds`) and fall back to
  `ADMIN_USER` + `ADMIN_PASS_HASH`, defaulting to `admin` / `admin123`.

## Sandbox overrides
- `.env.base44-defaults` holds dev placeholders for `SESSION_SECRET` and `ADMIN_USER` so sessions work locally; the
  platform secrets file `/run/base44/app.env` is loaded after it and wins. Nothing in the app is gated on
  `BASE44_PREVIEW_MODE`; the flag is only passed through to the container.
