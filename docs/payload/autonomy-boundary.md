# Autonomy boundary — self-serve vs. Lot 2

This restates the boundary set by [ADR-0001](../adr/0001-headless-payload-over-traditional-cms.md) and [CONTEXT.md](../../CONTEXT.md). It is the answer to the CCTP's *"ne pas être tributaire du soumissionnaire"*: it draws an explicit line between what an editorial team does **alone in Payload** and what is a **Lot 2 maintenance évolutive** (dev) task on bon de commande.

We chose a bespoke Next.js/React front-office backed by Payload (not a fully admin-configurable CMS), so **content is 100% self-serve but structure/templates/visuals require our developers**. Naming this boundary up front is the mitigation.

---

## Self-serve — no developer, no IT, no Soumissionnaire

A **Contributeur éditorial** / **Administrateur principal** does all of this alone in `/admin`, with changes live **immediately** (on-demand `revalidateTag`, no redeploy):

- **Content.** Create, edit, publish, schedule, unpublish, archive and delete `article`, `actualite`, `evenement`, `breve`, `page` — within their granted branches (see [rbac.md](rbac.md)).
- **The arborescence (site tree).** Create, rename, **move/reparent**, reorder and hide (`visible = false`) rubriques at **any depth** (no enforced limit; **≤ 3 levels recommended** to keep the click count low). Moving a branch reparents one node; attached content is untouched.
- **Block composition.** Stack, reorder and configure **existing** blocks on rubrique landings, rich articles and pages — choosing from the curated [block library](data-model.md#block-library).
- **Homepage block order.** Reorder the homepage sections/cartouches and drive them via "à la une" keywords/flags (e.g. `actualite.featured`).
- **Media.** Upload and manage images, PDFs (incl. the "Touraine le Mag" kiosque), audio and video.
- **Forms.** Build `formulaire` documents with unlimited fields, per-form email routing to the concerned service, and a redirect/message confirmation.
- **Administration** (Administrateur principal). Create users, assign roles, create groupes, and grant groupes rights on rubrique branches (incl. the publish right) — see [rbac.md](rbac.md).
- **SEO / transverse.** Per-page meta overrides (otherwise auto-derived), breadcrumb, search — all driven by the content above.

---

## Lot 2 — maintenance évolutive (developer task, on bon de commande)

These change the *system*, not the content, and require our developers:

- **New block types.** Designing a new composable block (schema + React component + design tokens) — e.g. a new "BLOC XXX" from Figma. Editors can use existing blocks freely, but the **catalogue** of block types is code.
- **New page templates (gabarits).** Adding an archetype beyond the ~12 in [site tree §2](../site-tree.md#2-catalogue-des-gabarits-templates-de-page).
- **Restyling.** Visual/branding changes — design tokens, layout, component styling.
- **Structural changes.** New content collections or fields, changing the depth limit, new relationships.
- **Role definitions.** Changing what a *role* can do (the access-function logic in `@/lib/access`). Note the split: *assigning* users to groupes/branches is self-serve; changing the *definition* of a role is code ([ADR-0002](../adr/0002-branch-scoped-rbac.md)).
- **Integrations & infra.** New third-party integrations, the SQLite → **Postgres** production swap and sovereign hosting/object storage ([ADR-0003](../adr/0003-french-sovereign-hosting.md)).

---

## Rule of thumb

> If you are **filling in or arranging** existing pieces (content, tree, media, forms, block order) → **self-serve**.
> If you are **adding a new kind of piece** (block type, template, field, role behaviour) or **changing how it looks/runs** → **Lot 2**.

This boundary is documented in the offer and cross-referenced from [CONTEXT.md](../../CONTEXT.md) and [site tree §8](../site-tree.md#8-règles-de-cohérence-rappel-pour-les-contributeurs).
