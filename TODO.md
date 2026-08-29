# TODO

## Revisit the 401 / expired-session handling (2026-08-27)

**Status: shipped but not settled — I'm not happy with the 401 piece, come back to it.**

### The bug that started this

`/characters` showed "Loading…" and then an empty list. The cause was a stale token:
tokens expire after 1 day (`apps/api-nest/src/auth/auth.module.ts`, `expiresIn: "1d"`),
but zustand's `persist` keeps the string in localStorage forever. The page only checked
`!!accessToken`, so an expired token passed the guard, the request went out, the API
returned 401, and nothing rendered the error — `isLoading` flipped false, `characters`
stayed `undefined`, so neither the cards nor the "No characters yet" message appeared.

Access to `/characters` was never the problem. The page gates on the token and the API
returns 401 without a Bearer header; characters are scoped by `ownerId` server-side.

### What was changed

- **`apps/web/src/lib/stores/auth-store.ts`** — decodes the JWT `exp` claim client-side
  (`isTokenExpired`, exported). Added `hasHydrated` so guards can tell "not logged in"
  apart from "localStorage hasn't been read yet", and `sessionExpired` so `/login` can
  explain why you landed there. An unparseable token is treated as expired.
- **`apps/web/src/lib/stores/use-auth.ts`** (new) — `useAuth()` returns `{ token, ready }`.
  On an expired token it clears the store and does `router.replace("/login")`. This is the
  proactive check, so we don't fire a request that can only come back 401.
- **`apps/web/src/app/providers.tsx`** — the part I don't love. A 401 backstop on the
  query client's `QueryCache` / `MutationCache` `onError`, so every query and mutation in
  the app is covered from one place. Skips `/auth/*` because a wrong password also returns
  401 (`auth.service.ts:41`, `:46`) and would otherwise wipe the session and report itself
  as "session expired".
- **`apps/web/src/app/login/page.tsx`** — shows "Your session expired. Please log in again."
- **All four character pages** now use `useAuth()`; the list page got its missing `isError`
  branch.
- **`apps/web/src/lib/stores/auth-store.test.ts`** (new) — unit tests for `isTokenExpired`.

Lint, check-types, and test all passed.

### Why the client-side check alone wasn't enough

The `exp` check is a UX fix. The 401 handler is the correctness backstop, because a token
can be dead without being expired:

- `JWT_SECRET` changes between restarts (the default is `"dev-secret-change-me"`, so any
  env change invalidates every outstanding token while `exp` still looks fine)
- the user row is deleted or the db is reset
- browser clock skew makes an expired token look valid
- the token expires while a tab sits open

The client can't be the gate anyway — the server has to reject the token regardless.

### What to reconsider

- The whole `/auth/*` string-prefix exemption is the smelly part. Matching on URL path to
  decide what a 401 means is fragile; a new auth route or a renamed prefix silently breaks
  it. Options: have the API distinguish the two cases (different code or error body),
  or opt in per-call instead of globally.
- A global `onError` that mutates auth state is spooky action at a distance. Anyone adding
  a query gets the logout behavior without knowing it exists.
- **1-day tokens with no refresh** is the underlying problem. Leave a tab open overnight and
  you get kicked to login mid-session. The current work makes that legible instead of a blank
  page, but it doesn't make it pleasant. Refresh tokens are the real fix — decide where the
  refresh token lives (httpOnly cookie vs. localStorage) before touching it.
- Existing broken sessions only self-heal once the user hits a guarded page. Fine for now.
