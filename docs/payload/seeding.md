# Seeding

The seed bootstraps a **demonstrable** instance: a small site tree, the RBAC users/groupes that exercise every role, and a handful of content items across the gabarits, so the back-office and front-office can be reviewed end-to-end without hand-typing data.

> **Status.** The `db:seed` script (`payload run ./seed.ts`) is wired in `package.json`; the `seed.ts` file is authored in the content/seed phase. This document is the **contract** for what it creates — keep `seed.ts` aligned with it.

---

## How to run it

```powershell
pnpm db:seed
```

This runs `payload run ./seed.ts` against the database in `DATABASE_URI` (the local `poc.db` SQLite file in dev — see [README.md](README.md)).

**Re-running:** the seed is written to be **idempotent** — it upserts by a stable key (email for users, `slug`/`name` for tree nodes and groupes) so a second run updates rather than duplicates. To start completely fresh in dev, stop the dev server, delete the SQLite file (`poc.db` and any `poc.db-*` siblings) and the `media/` uploads, then run `pnpm db:seed` again (or boot `/admin` to recreate the schema first, then seed).

> Order matters: rubriques and groupes are seeded **before** the users and content that reference them (groupes need their branch rubriques; content needs its rubriques; users need their groupes).

---

## What the seed creates

1. **Rubriques (the tree).** A representative slice of [site tree §3](../site-tree.md#3-arborescence-générale-3-niveaux), depth ≤ 3 — e.g. `Mes services au quotidien` → `Sport` → (`Je souhaite randonner`, `Déposer une demande de subvention`) and `Enfance et famille` → (`Présentation et démarches`, `J'attends un enfant`, …), plus top-level `Actualités`, `Le Département`, and a "Communes & collectivités" espace dédié (T11). Each node: `title`, `slug`, `visible`, `order`, `parent`.

2. **Groupes de rédacteurs.** The grants from the [rbac.md matrix](rbac.md#seeded-users--groupes-matrix):
   - **Rédaction Sport** — `branches: [Sport]`, `canPublish: true` (autonomous).
   - **Rédaction Enfance** — `branches: [Enfance et famille]`, `canPublish: false`.
   - **Validation Solidarités** — covers the Solidarités/Enfance branch, `canPublish: true`.

3. **Users (one per role).**
   - `admin@cd37.fr` — Administrateur principal (the account that manages everyone).
   - `sport@cd37.fr` — Contributeur, in *Rédaction Sport* (contributeur autonome).
   - `enfance@cd37.fr` — Contributeur, in *Rédaction Enfance* (needs a Validateur to publish).
   - `valid-solid@cd37.fr` — Validateur, in *Validation Solidarités*.

   Passwords are set from an env var / a documented dev default — **never commit real credentials**; rotate before any non-local environment.

4. **Content samples** across the gabarits, each attached to its rubrique(s):
   - an `article` `type: presentation` (T3) and an `article` `type: demarche` (T4, with `steps`),
   - a couple of `actualite` (one `featured` for the homepage),
   - an `evenement` (with `startDate` + `geo`, one `featured`),
   - a `breve`,
   - a `page` and a cartographic `page` (T12, with a MapEmbed block),
   - a `formulaire` (the mandatory contact form) referenced by a CtaForm block,
   - a few `media` items (image + a PDF for the kiosque) with `alt` text.

5. **Status mix.** Some content is left `draft` and some `published`, so the lifecycle and the publish gate (a draft owned by `enfance@cd37.fr` awaiting a Validateur) are visible immediately.

---

## After seeding

- Log into `/admin` as `admin@cd37.fr` to verify the tree, groupes, and users.
- Log in as `sport@cd37.fr` to confirm self-publish works on the Sport branch.
- Log in as `enfance@cd37.fr` to confirm publish is **refused** and the item sits "en attente de validation", then as `valid-solid@cd37.fr` to publish it.

This is the manual walk-through described in [rbac.md → Worked example](rbac.md#worked-example--sport-vs-enfance).
