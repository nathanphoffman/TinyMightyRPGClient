# TinyMightyRPG

An RPG webclient for character creation, character sheet management, and (eventually) live online play.

## Stack

| Layer | Choice |
|---|---|
| Monorepo | pnpm workspaces + Turborepo |
| Frontend | Next.js (App Router) + TanStack Query + Zustand + React Hook Form |
| UI | Tailwind CSS + shadcn/ui (Radix primitives) |
| Domain API | NestJS + nestjs-zod, hand-rolled JWT auth via Passport |
| Real-time API | Hono + WebSockets (Node), for live play sessions |
| Database | PostgreSQL + Prisma (via `@prisma/adapter-pg`) |
| Shared validation | Zod, in `packages/schemas`, imported by every app |
| Lint/format | Biome |
| Tests | Vitest (unit) + Playwright (e2e, web only) |

### Why two APIs?

- **`apps/api-nest`** is the core domain service: auth, characters, campaigns, and the
  character-sheet rules engine. Nest's module/DI structure earns its keep here.
- **`apps/api-hono`** is a real-time gateway: one WebSocket room per campaign for live play
  (dice rolls, turn order, chat, presence). Hono's low overhead suits that workload better
  than Nest, and it shares the same Postgres database.

Both APIs verify JWTs signed with the same `JWT_SECRET` — a token issued by Nest's
`/auth/login` is also valid for authenticating a WebSocket connection to the Hono gateway.

## Folder structure

```
apps/
  web/            Next.js frontend
  api-nest/       Domain API (auth, characters, campaigns)
  api-hono/       Real-time gateway (live play over WebSocket)
packages/
  schemas/        Shared Zod schemas — single source of truth for validation + types
  db/             Prisma schema, client, and driver adapter setup
  config/         Shared tsconfig base and Biome base config
```

## Prerequisites

- Node.js 22+
- pnpm (`corepack enable && corepack prepare pnpm@latest --activate`)
- Docker, for local Postgres (**not installed in this environment** — install it before
  running migrations or starting the APIs against a real database)

## Setup

```bash
pnpm install

# copy env files
cp packages/db/.env.example packages/db/.env
cp apps/api-nest/.env.example apps/api-nest/.env
cp apps/api-hono/.env.example apps/api-hono/.env
cp apps/web/.env.example apps/web/.env

# start Postgres
pnpm db:up

# generate the Prisma client and apply the schema
pnpm --filter @tmrpg/db db:generate
pnpm --filter @tmrpg/db db:migrate

# run everything
pnpm dev
```

- Web: http://localhost:3000
- Nest API: http://localhost:3001 (`/health`, `/auth/*`, `/characters`, `/campaigns`)
- Hono gateway: http://localhost:3002 (`/health`, `/campaigns/:id/live` WebSocket)

### What `pnpm dev` does and doesn't start

`pnpm dev` runs Turborepo's `dev` task in every workspace that defines one:

- `apps/web` — Next.js on :3000
- `apps/api-nest` — Nest on :3001
- `apps/api-hono` — Hono on :3002
- `packages/schemas` and `packages/db` — `tsup --watch`, so edits to the shared
  packages rebuild and the apps pick them up

It also allocates the ports first — see [Port coordination](#port-coordination).

**It does not start Postgres.** The database runs in Docker and is started separately
with `pnpm db:up`. It has `restart: unless-stopped`, so once started it comes back on
its own after a reboot and you rarely think about it again — which is exactly why it's
easy to forget it's a separate thing.

So a full cold start is two commands:

```bash
pnpm db:up   # once; persists across reboots
pnpm dev     # every session
```

## Troubleshooting

**A form says "Couldn't reach the server" or "Something went wrong."** The Nest API on
:3001 isn't running. The web app on :3000 is a separate process, so the UI loads and
looks completely healthy while every request it makes fails. Check with:

```bash
curl http://localhost:3001/health
```

Nothing listening means `pnpm dev` isn't running, or the Nest process died on its own
while web kept going. Turborepo's TUI shows each app in its own pane — check the
`api-nest` pane for a crash before assuming the whole thing is up.

**A port is already in use.** `pnpm dev` handles this for you. Before starting anything it
probes every service's port, moves only the ones that are actually blocked, and passes the
resolved map to all three apps — so an app that had to move is still reachable by everything
that talks to it. It prints what it chose:

```
  web       :3000
  api-nest  :3004   ← :3001 was taken
  api-hono  :3002

  1 service moved. Every app has been told the new addresses.
```

Read the banner rather than assuming :3001. See
[Port coordination](#port-coordination) for how it works and what it does not cover.

**Password reset emails never arrive.** `/auth/forgot-password` always returns
`{ ok: true }`, even for unregistered emails, so it can't be used to discover which
accounts exist — which also means a success response is not proof an email was sent.
Real send failures are logged server-side by `MailService`; look for
`Password reset email failed` in the `api-nest` output. The usual causes are a bad
`RESEND_API_KEY` or a `MAIL_FROM` on a domain you haven't verified in Resend (it must
stay `onboarding@resend.dev` until you do).

## Port coordination

Ports are resolved once, by `scripts/dev.mjs`, *before* any app starts:

1. Each service has a preferred port — web 3000, api-nest 3001, api-hono 3002.
2. Every service whose own preferred port is free keeps it.
3. Only the blocked ones move, walking upward while skipping the other services'
   preferred ports. One busy port doesn't shove everything else along.
4. The finished map is handed to Turborepo as `WEB_PORT`, `NEST_PORT`, `HONO_PORT`,
   `NEXT_PUBLIC_NEST_API_URL`, `NEXT_PUBLIC_HONO_API_URL`, and `APP_WEB_URL`.

So the apps never negotiate with each other — a launcher decides for all of them up front,
which is the only point at which the browser can still be told the answer.
`NEXT_PUBLIC_*` values are inlined into the client bundle when `next dev` boots, so nothing
learned later could reach it.

Two details worth knowing if you change this:

- **`turbo.json` must declare these in the `dev` task's `passThroughEnv`.** Turborepo 2 runs
  tasks in `strict` env mode and drops anything undeclared, so the apps would silently fall
  back to their defaults. Keep it on `dev`, not `globalPassThroughEnv` — global would also
  hand these to `build`, and passthrough vars are excluded from the cache hash, so a
  production build could reuse a cached bundle with the wrong API URL compiled into it.
- **Next.js cannot read `PORT` from `.env`** — the HTTP server binds before env files load.
  That's why web takes `-p ${WEB_PORT:-3000}` on the command line instead.

**What this does not do:** it is allocation-before-start, not runtime renegotiation. The
ports are fixed for the life of the run. If one app dies and you restart it by hand on a
different port, nothing re-propagates — restart `pnpm dev` so everything is dealt a fresh,
consistent map. Real runtime discovery would need a reverse proxy in front of the services,
which is a lot of machinery for three local processes.

Running an app on its own (`pnpm --filter web dev`) skips the allocator entirely and uses
the committed defaults in each `.env`.

**None of this reaches production.** The allocator runs only from the root `dev` script, the
`WEB_PORT`/`NEST_PORT`/`HONO_PORT` variables are scoped to the `dev` task, and the
`build`/`start` scripts are untouched. In production the APIs read `PORT` exactly as they did
before, and the web app's API URLs come from the environment or `.env` as usual.

## Scripts (root)

- `pnpm dev` — run every app in dev mode via Turborepo
- `pnpm build` — build everything, in dependency order
- `pnpm lint` — Biome lint across the whole repo
- `pnpm check-types` — `tsc --noEmit` across every package
- `pnpm test` — Vitest across every package
- `pnpm format` — Biome format, writes changes
- `pnpm db:up` / `pnpm db:down` — start/stop the local Postgres container

## Notes on a few non-obvious decisions

- **TypeScript is pinned to 5.9, not 7.** TypeScript 7 (the native Go-based compiler) is out,
  but `rollup-plugin-dts` — which `tsup` uses to bundle `.d.ts` files — doesn't work with it yet
  (`Cannot read properties of undefined (reading 'useCaseSensitiveFileNames')`). Worth
  revisiting once the ecosystem catches up.
- **Prisma 7 requires a driver adapter.** As of Prisma 7, `datasource.url` is no longer valid
  in `schema.prisma` — connection config lives in `prisma.config.ts`, and the runtime
  `PrismaClient` needs an explicit adapter (`@prisma/adapter-pg` here) rather than Prisma's
  old bundled query engine. See `packages/db/prisma.config.ts` and `packages/db/src/client.ts`.
- **`packages/schemas` and `packages/db` build to both ESM and CJS.** Nest's default build
  emits CommonJS while everything else here is ESM; shipping both from the shared packages
  avoids an `ERR_REQUIRE_ESM` crash at runtime.
- **Nest's Vitest setup needs `unplugin-swc`.** Vitest's default esbuild transform doesn't
  emit TypeScript decorator metadata, which Nest's dependency injection relies on. See
  `apps/api-nest/vitest.config.mts` and `.swcrc`.
- **A few Nest imports are exempt from Biome's `useImportType` rule** (with an inline
  `biome-ignore` and reason) where the class is constructor-injected — converting those to
  `import type` would strip the runtime reference Nest's decorator metadata needs, silently
  breaking DI.
