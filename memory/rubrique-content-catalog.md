---
name: rubrique-content-catalog
description: Where the real per-rubrique page content + SEO lives and how the seed applies it
metadata:
  type: project
---

Every rubrique's page content + SEO is authored in a **data catalog**, not hand-coded in the seed.

- `data/rubriques-content.json` — the catalog, keyed by rubrique **slug-path** (e.g. `mes-services-au-quotidien/sport`). Typed wrapper: `data/rubriques-content.ts` (`RUBRIQUE_CONTENT`). Each entry: `seo {title,description}`, `heroSubtitle`, `intro[]`, `sections[]`, `faq[]`, `related[]`, `downloads[]`, optional `demarche {steps,contacts}` (T4) and `map {title,arcgisItemUrl}` (T12).
- Regenerate the JSON from `scripts/content-raw/*.json` (one fragment per menu section) with `node scripts/build-rubrique-content.mjs`. The JSON is the committed artifact; the seed imports it, not the build script.
- `seed.ts` **section 4** applies the catalog: for each rubrique it builds a composed `landing` block stack via `buildLandingBlocks()` (hero + richText + CardGrid-of-children for parents + démarche steps + mapEmbed + FAQ + downloadList + relatedLinks + ctaForm; NewsList/Agenda on top-level sections) and sets `seo`. 4 rubriques are SEO-only (dedicated gabarits: toutes-les-actus, agenda-à-la-une, MDS annuaire, nous-contacter form) — see `DEDICATED_SEO` / `KEEP_LANDING`.
- Covers all 67 rubriques (63 catalog landings + 4 SEO-only). Replaced the old generic placeholder `defaultLanding` and the hand-coded "Mes services"/cantons/communes/entreprises landings.

**Why:** the user needed every rubrique page to ship real, production-ready editorial content + SEO, driven by data (per [[gabarit-rendering-architecture]]) rather than per-page code.
**How to apply:** to change a page's copy/SEO, edit the matching `scripts/content-raw/*.json` entry, run the build script, then `pnpm db:seed` (stop the dev server first — see [[seed-and-cache-gotchas]]).
