# Payload CMS — developer & editor guide

This folder documents the **back-office** of touraine.fr: the Payload CMS that powers the editorial workflow, the site tree (arborescence), forms, and search.

Read these in order:

1. **README.md** (this file) — how Payload is embedded, URLs, env vars, how to run.
2. [data-model.md](data-model.md) — every collection, its key fields, the gabarits it backs, and the block library.
3. [rbac.md](rbac.md) — the branch-scoped permission model (roles, groupes → branches, inheritance), locking, and versioning.
4. [seeding.md](seeding.md) — what the seed creates and how to re-run it.
5. [autonomy-boundary.md](autonomy-boundary.md) — what an editor can do alone vs. what is a Lot 2 dev task.

Architecture decisions that pin everything below:
[ADR-0001 (Headless Payload)](../adr/0001-headless-payload-over-traditional-cms.md) ·
[ADR-0002 (Branch-scoped RBAC)](../adr/0002-branch-scoped-rbac.md) ·
[ADR-0003 (French sovereign hosting)](../adr/0003-french-sovereign-hosting.md) ·
[Site tree & gabarits](../site-tree.md) ·
[CONTEXT.md (domain language)](../../CONTEXT.md).

---

## How Payload is embedded in the Next.js app

Per [ADR-0001](../adr/0001-headless-payload-over-traditional-cms.md), there is **one runtime**: Payload runs **inside the same Next.js 16 app**, not as a separate service. There is no `src/` directory — code lives at the repo root (`app/`, `collections/`, `lib/`, `fields/`, `blocks/`, `data/`, `types/`).

Key pieces:

- **`payload.config.ts`** (repo root) — `buildConfig({...})`. Wires the SQLite adapter (`@payloadcms/db-sqlite`, libSQL), the Lexical rich-text editor, `sharp`, `admin.user = 'users'`, French admin-UI i18n (`fallbackLanguage: 'fr'` — **admin UI only, content is not localized**), and `typescript.outputFile → ./payload-types.ts`. It imports the `collections` array and the `plugins` array.
- **`collections/index.ts`** — the registered collections in a stable order: `[Users, Groupes, Rubriques, Article, Actualite, Evenement, Breve, Page, Media]`. Forms are **not** here — the Form Builder plugin registers `formulaire` + `form-submissions` itself.
- **`plugins.ts`** — `nestedDocsPlugin` (the `rubriques` tree), `formBuilderPlugin` (`formulaire`), `searchPlugin` (the search index).
- **`next.config.ts`** — the Next export is wrapped with `withPayload` from `@payloadcms/next/withPayload`.
- **`app/(payload)/`** — a Next.js route group containing Payload's admin UI and REST/GraphQL routes (auto-generated, has its own `RootLayout`). The public front-office (`app/page.tsx`, `app/layout.tsx`, future `app/[[...slug]]/page.tsx`) is untouched by this group.
- **`payload-types.ts`** (repo root, gitignored) — generated TypeScript types for every collection. Regenerate after any schema change.

### URLs

| URL | What |
|-----|------|
| `/admin` | Payload admin UI (editor + administrator back-office). |
| `/api` | Payload REST API (e.g. `/api/actualite`, `/api/rubriques`). |
| `/api/graphql` | Payload GraphQL endpoint. |
| `/api/graphql-playground` | GraphQL playground (dev). |
| `/` and `/[[...slug]]` | Public front-office (resolves the path against the `rubriques` tree). |

### Path aliases

`tsconfig.json` defines `@/*` → repo root and `@payload-config` → `./payload.config.ts`. Collections import field helpers from `@/fields`, blocks from `@/blocks`, and access factories from `@/lib/access`.

---

## Environment variables

Configured in `.env` (gitignored; a committable template lives in `.env.example`).

| Variable | Purpose | POC value |
|----------|---------|-----------|
| `PAYLOAD_SECRET` | Secret used to sign/encrypt auth tokens. **Must** be a long random string; rotating it invalidates all sessions. | A 32-byte crypto-random hex (generate your own per environment). |
| `DATABASE_URI` | Database connection. For the POC this is a local SQLite file. | `file:./poc.db` |

`.env`, `poc.db` (+ `poc.db-*`), and the `media/` upload directory are gitignored; `.env.example` is committable.

---

## How to run

The package is ESM (`"type": "module"`) and uses **pnpm**.

```powershell
pnpm install              # install dependencies
pnpm dev                  # start Next.js + Payload (admin at http://localhost:3000/admin)
```

On **first boot** of `/admin`, Payload creates `poc.db` and prompts you to create the first user. Make that first account an **Administrateur principal** (set its `role` to `administrateur-principal`) so you can then manage groupes and other users — see [rbac.md](rbac.md).

Useful scripts (`package.json`):

| Command | What it does |
|---------|--------------|
| `pnpm dev` | Run the app (front-office + `/admin`). |
| `pnpm generate:types` | Regenerate `payload-types.ts`. **Run this after any collection/block/field change.** |
| `pnpm payload generate:importmap` | Regenerate the admin import map (after adding custom admin components). |
| `pnpm db:seed` | Run the seed script (`payload run ./seed.ts`) — see [seeding.md](seeding.md). |
| `pnpm build` / `pnpm start` | Production build / start. |

Both `pnpm generate:types` and `pnpm payload generate:importmap` load `payload.config.ts` and exit cleanly — handy as a quick "does the config still compile?" check without starting a long-lived dev server.

---

## Database: SQLite now, Postgres later

The POC uses **SQLite** (`@payloadcms/db-sqlite`, libSQL with prebuilt binaries — no `node-gyp`/native build step) for **local development only**. It is the "for now" dev DB: a single file, zero infrastructure.

[ADR-0003](../adr/0003-french-sovereign-hosting.md) sets the **production target to managed PostgreSQL** on French sovereign IaaS (OVHcloud / Scaleway), with S3-compatible object storage for media. Switching is an **adapter swap** in `payload.config.ts` (`@payloadcms/db-sqlite` → `@payloadcms/db-postgres`) plus pointing `DATABASE_URI` at the managed Postgres instance and the media storage adapter at object storage. No collection/field/access code changes — those are database-agnostic.

The search plugin (see [data-model.md](data-model.md)) is intended to use **Postgres full-text** in production (CONTEXT.md); on SQLite the index collection still exists and is kept in sync, with full-text relevance maturing on the Postgres target.
