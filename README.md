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

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
