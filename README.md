Portail **Touraine — Le Département** : POC [Payload CMS](https://payloadcms.com) (SQLite/libSQL) + [Next.js](https://nextjs.org) App Router.

## Getting Started (fresh clone)

The database (`poc.db`) and the uploaded images (`/media`) are **git-ignored** — they
are **not** in the repo. After cloning you must run the seed once: it creates the
database and **(re)generates every image** from the assets in `public/` plus a few
banners/PDFs built on the fly with `sharp`. Skipping this step is why you'd see
`500 — File … is missing on the disk` on pages with images.

```bash
# 1. install deps
pnpm install            # or npm install

# 2. env — copy the example (DATABASE_URI=file:./poc.db, etc.)
cp .env.example .env

# 3. seed the DB, populate /media with all images, and add demo content  ← required for images to render
pnpm db:seed

# 4. run the dev server
pnpm dev
```

The seed also adds 8 demo actualités (`zz-demo-*`) so the « Toutes les actus »
listing paginates out of the box. Remove them with:

```bash
pnpm payload run ./scripts/add-demo-actus.ts --clean
```

Open [http://localhost:3000](http://localhost:3000) (front-office) or
[http://localhost:3000/admin](http://localhost:3000/admin) (Payload admin).

`pnpm db:seed` is **idempotent**: it wipes the seeded rows *and* the `/media`
folder, then rebuilds both — so you can re-run it any time to get a clean,
fully-rendering dataset. (Wiping `/media` first keeps upload filenames stable;
otherwise Payload appends `-2` to colliding names, e.g. `hero-touraine-2.jpg`.)

## Seeded logins

Seeded logins (dev password `ChangeMe-2026!`) that demonstrate the ABAC:

- `admin@touraine.fr` — Administrateur principal (full)
- `sport@touraine.fr` — Contributeur autonome (canPublish → self-publishes Sport)
- `enfance@touraine.fr` — Contributeur (must submit *en attente de validation*)
- `valideur@touraine.fr` — Validateur (publishes the Enfance branch)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

Vercel runs on a **serverless, read-only/ephemeral filesystem**, so the two
defaults used locally do **not** work in production and must be swapped for
hosted services:

| Local (dev)              | Vercel (prod)                          |
| ------------------------ | -------------------------------------- |
| SQLite file `./poc.db`   | **Turso** hosted libSQL (`libsql://…`) |
| Uploads on disk `./media`| **Vercel Blob** store                  |

The repo is already wired for both — `payload.config.ts` reads
`DATABASE_AUTH_TOKEN`, `plugins.ts` enables Vercel Blob when
`BLOB_READ_WRITE_TOKEN` is set, and [`vercel.json`](./vercel.json) runs
`payload migrate` before the build so a fresh database gets its schema.

### 1. Create a Turso database

```bash
# https://docs.turso.tech/quickstart
turso db create poc-tour
turso db show poc-tour --url           # → libsql://poc-tour-<org>.turso.io
turso db tokens create poc-tour        # → the auth token
```

### 2. Add a Vercel Blob store

In the Vercel dashboard: **Storage → Create → Blob**, then link it to the
project. Vercel injects `BLOB_READ_WRITE_TOKEN` automatically.

### 3. Set the project Environment Variables (Vercel → Settings → Environment Variables)

```
DATABASE_URI=libsql://poc-tour-<org>.turso.io
DATABASE_AUTH_TOKEN=<token from turso db tokens create>
PAYLOAD_SECRET=<a strong random value>
PREVIEW_SECRET=<a strong random value>
NEXT_PUBLIC_SERVER_URL=https://<your-app>.vercel.app
# BLOB_READ_WRITE_TOKEN is added automatically when you link the Blob store
```

### 4. Deploy

Push to GitHub and import the repo in Vercel. The build command
(`pnpm payload migrate && pnpm build`) creates the Turso schema, then builds.

### 5. Seed the production database (once, from your machine)

```bash
DATABASE_URI="libsql://poc-tour-<org>.turso.io" \
DATABASE_AUTH_TOKEN="<token>" \
pnpm db:seed
```

Then create your real admin user at `https://<your-app>.vercel.app/admin`.
