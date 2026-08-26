# TinyMightyRPG — working notes

## Package manager: pnpm, always

This repo uses **pnpm** (see `packageManager` in the root `package.json`). Never use `npm`
or `yarn` in commands, docs, or examples. There is no `package-lock.json`, and `npm install`
would corrupt the workspace symlink layout pnpm relies on.

- Run scripts: `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm test`, `pnpm check-types`
- One workspace: `pnpm --filter web test`, `pnpm --filter @tmrpg/db db:migrate`
- One-off binaries: `pnpm exec <bin>` (not `npx`)
- Add a dependency: `pnpm add <pkg> --filter <workspace>`

## Local dev needs two things running

`pnpm dev` starts web (:3000), api-nest (:3001), api-hono (:3002), and `tsup --watch` for
the shared packages. It does **not** start Postgres — that's `pnpm db:up` (Docker).

Before debugging any "request failed" symptom in the UI, check the API is actually up:
`curl http://localhost:3001/health`. Web and the APIs are separate processes, so the
frontend loads and looks healthy while every request it makes fails.

Ports are allocated by `scripts/dev.mjs` before anything starts — preferred are web 3000,
api-nest 3001, api-hono 3002, and only a service whose own port is blocked moves. The map
reaches the apps as `WEB_PORT` / `NEST_PORT` / `HONO_PORT` / `NEXT_PUBLIC_*` / `APP_WEB_URL`,
which **must stay declared in the `dev` task's `passThroughEnv` in `turbo.json`** — Turborepo 2
runs in strict env mode and silently drops undeclared vars. Do not promote these to
`globalPassThroughEnv`: that would leak them into `build`, where passthrough vars are excluded
from the cache hash and a stale bundle could be reused with the wrong API URL baked in. All of
this is dev-only; `build`/`start` are untouched and production still reads plain `PORT`. Never let `next dev` pick its own port
(it climbs into Nest's range); it takes `-p ${WEB_PORT:-3000}` because Next cannot read
`PORT` from `.env`.

Turborepo leaves the *other* apps running when one dies, so a half-working stack — web fine,
an API dead — is the normal failure shape. Check the crashed app's pane, not the browser.

## Conventions worth knowing

- **Zod schemas live in `packages/schemas`** and are the single source of truth, imported by
  the web app and validated against by both APIs. Don't redefine input shapes locally.
- **Nest constructor-injected classes need runtime imports.** Biome's `useImportType` wants
  to convert them to `import type`, which silently breaks DI — hence the `biome-ignore`
  comments. Keep them when adding providers.
- **`/auth/forgot-password` deliberately returns `{ ok: true }` for unknown emails** so it
  can't be used to enumerate accounts. Don't "fix" this by surfacing errors for missing
  users; mail failures are logged server-side instead.
- **UI primitives in `components/ui/` are shared** by every screen. Restyling one changes
  login, register, character sheets, and edit at once — scope per-screen changes with a
  wrapper class instead.
- **Env vars load as a side effect of importing `@tmrpg/db`** (`packages/db/src/client.ts`
  does `import "dotenv/config"`). Nothing else calls dotenv and there's no `ConfigModule`, so
  a service reading `process.env` works only because `DatabaseModule` was imported first.
  Worth knowing before adding a process that doesn't touch the database.
- Run `pnpm lint && pnpm check-types && pnpm test` before calling work done.
