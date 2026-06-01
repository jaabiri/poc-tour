---
name: seed-and-cache-gotchas
description: Gotchas when seeding — stop dev server first (SQLITE_BUSY) — and when viewing changes in dev
metadata:
  type: project
---

Traps when changing CMS content/landings and verifying in the browser (see [[gabarit-rendering-architecture]]):

0. **`pnpm db:seed` needs the `next dev` server stopped first.** The seed writes to the local libSQL file `poc.db` (DATABASE_URI=file:./poc.db). SQLite/libSQL is single-writer and the local-file driver doesn't wait on a busy lock, so a running `pnpm dev`/Payload admin holds a connection and the seed dies with `SQLITE_BUSY: database is locked` (first failure = the `_article_v` version insert). Stop only the `*next*` node processes (NOT a mass `node.exe` kill — that breaks the IDE/tooling and is denied by the safety classifier), run the seed (it's idempotent / wipe-or-upsert), then restart `pnpm dev`.

1. **Seeding a rubrique `landing` must publish.** Rubriques have `versions: { drafts: true }`. A `payload.update` WITHOUT `_status: 'published'` writes only the DRAFT version, but the *public* (non-draft) front-office route resolves with `draft: false`, so the landing exists in the draft but the public page falls back to auto-listing. Always set `_status: 'published'` in seed `update` calls. NB: `findRubriqueByPath` now takes a `{ draft }` flag (resolve.ts passes it through) so Live Preview DOES resolve rubrique drafts — but the published route still uses `draft:false`, so the seed rule stands.

2. **The route resolution is `unstable_cache`d (tag `rubriques`, 3600s TTL).** After running `pnpm db:seed`, a *running* `next dev` server will NOT show the change: the seed's `revalidateTag('rubriques')` fires in a separate process and can't bust the dev server's data cache. Deleting `.next/cache` is NOT enough (Turbopack persists the cache elsewhere). To force a cold view: stop the server, `Remove-Item -Recurse -Force .next`, restart `pnpm dev`.

**How to apply:** when wiring/verifying landing content, set `_status:'published'` in seed updates, and after re-seeding nuke the whole `.next` dir before re-fetching to confirm rendering.
