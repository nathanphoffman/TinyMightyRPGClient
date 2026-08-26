# web

The Next.js frontend for TinyMightyRPG (App Router, Tailwind, shadcn/ui).

This is one workspace in a pnpm + Turborepo monorepo — **it is not meant to be run on its
own.** The pages call the Nest API on :3001, so starting only this app gives you a UI that
renders fine and fails every request. Run everything from the repo root instead:

```bash
pnpm db:up   # Postgres in Docker, once
pnpm dev     # web + both APIs + shared package watchers
```

See the [root README](../../README.md) for setup, environment variables, and troubleshooting.

## Layout

```
src/
  app/            App Router pages (characters, auth flows)
  components/ui/  shadcn/ui primitives — shared across every screen
  lib/api/        Typed clients for the Nest and Hono APIs
  lib/stores/     Zustand stores (auth)
```

Validation schemas live in `packages/schemas` and are shared with the APIs — add form
schemas there rather than redefining them here.
