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
