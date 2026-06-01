# Data model — collections & blocks

This maps every Payload collection to the **gabarits** (page templates) it backs and lists its key fields. Cross-reference: [site-tree §7 (pages → collections)](../site-tree.md#7-correspondance-pages--collections-payload), [site-tree §2 (catalogue des gabarits)](../site-tree.md#2-catalogue-des-gabarits-templates-de-page), and [CONTEXT.md](../../CONTEXT.md).

Two architectural rules underpin everything (from [ADR-0001](../adr/0001-headless-payload-over-traditional-cms.md) / CONTEXT.md):

- The **`rubriques` tree owns structure only** (title, slug, visible, order, parent — unlimited depth, 3 levels *recommended*, optional `template` override, optional block landing). It carries **no editorial content**.
- **Content collections** attach to rubriques **many-to-many** (`rubriques` relationship = transversal attachment). The **first** rubrique is the primary/URL one. The URL = rubrique breadcrumb + content slug.

Registered collections (`collections/index.ts`, stable order):
`Users · Groupes · Rubriques · Article · Actualite · Evenement · Breve · Page · Media`.
Plugin-registered collections: `formulaire`, `form-submissions`, `search`.

---

## Shared field helpers (`@/fields`)

Most content collections compose these so behaviour is consistent:

| Helper | Field(s) added | Notes |
|--------|----------------|-------|
| `slugField()` | `slug` (sidebar) | Auto-derived from `title` via a `beforeValidate` hook; editable. |
| `rubriquesRelation()` | `rubriques` (required, hasMany → `rubriques`, indexed) | The pivot **all** branch-scoped access filters on. First = primary/URL. |
| `seoGroup()` | `seo` group: `metaTitle`, `metaDescription`, `ogImage` | **All optional** — blank falls back to values derived from the content (title → metaTitle, chapô → metaDescription, hero/visual → ogImage). |
| `publishedFields()` | `_schedule` group: `publishAt`, `unpublishAt` (sidebar) | Scheduled (differed) publish/unpublish — the CCTP "publication/dépublication programmable". |

Slug constants centralised in `@/fields`: `MEDIA_SLUG`, `ACTUALITE_SLUG`, `EVENEMENT_SLUG`, `FORMULAIRE_SLUG`.

Every **content** collection also enables `versions: { drafts: true }` (lifecycle `_status` = draft|published, historisation, native document locking) and routes access through the branch-scoped factories — see [rbac.md](rbac.md).

---

## Collections

### `users` — back-office accounts (identity)
- **File:** `collections/Users.ts`. **Not** a content collection (no `rubriques`, no blocks, no drafts).
- **Backs:** the back-office itself; `config.admin.user = 'users'`.
- **Key fields:** `name`, `email`/auth (`auth: true`), `role` (select: `administrateur-principal` | `contributeur` | `validateur`), `groupes` (hasMany → `groupes`).
- **Access:** read = `adminOrSelf()`; create/update/delete = `adminOnly`.
- The access helpers **duck-type** against exactly `role` + `groupes` — do not rename them. See [rbac.md](rbac.md).

### `groupes` — groupes de rédacteurs (permission set)
- **File:** `collections/Groupes.ts`. Identity/permission record, not content.
- **Backs:** the RBAC model — the reusable grant scoped to rubrique branches.
- **Key fields:** `name`, `description`, `branches` (required, hasMany → `rubriques` — the granted **branch roots**, access inherits down the tree), `canPublish` (checkbox — self-publish right on those branches).
- **Access:** `adminOnly` on every operation. The helpers duck-type against exactly `branches` + `canPublish`.

### `rubriques` — the site tree (structure only) → **T1, T2, T11**
- **File:** `collections/Rubriques.ts`. Payload **Nested Docs**, **unlimited depth** (CCTP: "autant de rubriques et sous-rubriques que nécessaire … à n'importe quel niveau"; 3 levels is a soft UX *recommendation*, not enforced).
- **Backs:** homepage (T1), rubrique landings (T2), espaces dédiés / profils (T11).
- **Key fields:** `title`, `slug`, `visible` (checkbox — "conserver sans afficher"), `order`, `template` (select — gabarit override; `auto` = content-driven default), `landing` (blocks — full library; empty = auto-listing of children), `seo`. `parent` + `breadcrumbs` are injected by the nested-docs plugin (not hand-declared).
- **Template selection:** the front-office resolver honours `template` first; `auto`/unset falls back to heuristics (landing→composed, contact/actus/agenda/MDS slug detection, else children listing).
- **Access:** READ is public but limited to `visible` rubriques (authenticated back-office users see the whole tree); WRITE is admin **or** branch-scoped against the node's own id. Has `versions: { drafts: true }`.
- **Revalidation:** `afterChange`/`afterDelete` → `revalidateTag('rubriques')`.

### `article` — editorial & démarche pages → **T3, T4**
- **File:** `collections/Article.ts`. One collection, two archetypes switched by `type`.
- **Backs:** T3 (rich editorial "Présentation et démarches", institutional) and T4 (task-oriented "Je veux…" démarche pages).
- **Key fields:** `title`, `slug`, `type` (`presentation` | `demarche`), `rubriques`, `chapo`, `body` (blocks — full library), `steps` (array, shown only for `demarche` — the numbered/accordion walkthrough), `downloads` (hasMany → `media`), `contacts` (array: name/role/email/phone/address), `seo`, `_schedule`.
- **Access:** branch-scoped factories + a `beforeChange` publish gate (`canPublishOnBranch`). `versions: { drafts: true }`.

### `actualite` — news → **T5, T6, homepage**
- **File:** `collections/Actualite.ts`.
- **Backs:** T5 (detail), T6 (list/archive), and the homepage "Actualités" section.
- **Key fields:** `title`, `slug`, `tag` (theme, indexed — T6 filter), `date` (indexed), `image` (upload → `media`), `chapo`, `body` (richText), `gallery` (array of image/caption), `rubriques`, `featured` (checkbox — homepage "à la une", indexed), `seo`, `_schedule`.
- **Access:** branch-scoped + publish gate. `versions: { drafts: true }`.

### `evenement` — events / agenda → **T7, T8, homepage**
- **File:** `collections/Evenement.ts`.
- **Backs:** T7 (event detail), T8 (agenda list — incl. "Agenda à la une" / "Agenda de la Présidente" as two filtered queries on this collection), homepage Agenda.
- **Key fields:** `title`, `slug`, `startDate` (required) / `endDate`, `location`, `geo` (point — for the MapEmbed locator), `category` (select, indexed — agenda filters), `registrationUrl`, `body` (blocks — curated subset: RichText, ImageText, FAQ, MapEmbed, CtaForm, DownloadList, RelatedLinks), `rubriques`, `featured`, `seo`, `_schedule`.
- **Access:** branch-scoped + publish gate. `versions: { drafts: true }`.

### `breve` — short information → **T9, listings**
- **File:** `collections/Breve.ts`.
- **Backs:** T9 brèves, aggregated into listings + homepage.
- **Key fields:** `title`, `slug`, `date` (required), `body` (**single richText**, deliberately short — no block stack), `sourceUrl`, `rubriques`, `seo`, `_schedule`.
- **Access:** branch-scoped + publish gate. `versions: { drafts: true }`.

### `page` — institutional & cartographic → **T3, T12**
- **File:** `collections/Page.ts`.
- **Backs:** free-form institutional pages (T3) and cartographic pages (T12 — editor drops a MapEmbed block).
- **Key fields:** `title`, `slug`, `rubriques`, `layout` (blocks — full library), `seo`, `_schedule`.
- **Access:** branch-scoped + publish gate. `versions: { drafts: true }`.

### `media` — file library → **all gabarits**
- **File:** `collections/Media.ts`. Upload collection.
- **Backs:** every gabarit — actualité/événement visuals, DownloadList (T3/T4), ogImage, "Touraine le Mag" PDF kiosk.
- **Key fields:** `alt` (required — RGAA accessibility + SEO), `caption`, `rubriques` (optional pivot to scope write access; blank = global, admin-managed). Upload accepts `image/*`, `application/pdf`, `audio/*`, `video/*`; image sizes: thumbnail / card / tablet / desktop.
- **Storage:** local `./media` for the POC; swaps to **S3-compatible sovereign object storage** in production ([ADR-0003](../adr/0003-french-sovereign-hosting.md)) via the storage plugin — no change to this collection.
- **Access:** read **public** (files are served without a session); create/update/delete branch-scoped. `versions: { drafts: true }`.

### `formulaire` — online forms → **T10** (Form Builder plugin)
- **Registered by:** `formBuilderPlugin` in `plugins.ts` (slug overridden to `formulaire` to match `FORMULAIRE_SLUG`).
- **Backs:** T10 (online démarches, contact). The **contact form is mandatory** (CCTP).
- **Per-form document owns:** `fields` (unlimited dynamic fields — text, textarea, select, email, checkbox, country, state, number, message, **upload** for pièces jointes routed to `media`; payment disabled), `emails` (per-form routing to the concerned service — the CCTP "plus"), `confirmationType` = `redirect` (to an internal `rubriques` / `page` / `actualite` document) or `message`.
- Referenced by the **CtaForm** block.

### `form-submissions` — captured submissions
- **Registered by:** `formBuilderPlugin`. Stores the data submitted against a `formulaire`. Admin group "Contenu".

### `search` — full-text index → **search results page (S)**
- **Registered by:** `searchPlugin` over `[actualite, evenement, article, page, breve]`.
- **Default priorities:** actualité/événement 20, brève 15, article 10, page 5 (timely content ranks above evergreen).
- **Backs:** the global search results page (facetable by date / type / event). Production target = **Postgres full-text** (CONTEXT.md); Typesense reserved as a Lot 2 evolution.

---

## Block library

Blocks are **schema-only** Payload `Block` configs (`blocks/`); the matching React components live under `components/`. Editors **stack / reorder / configure** them. The convenience array `blockLibrary` (`@/blocks`) is spread into a `blocks` field:

```ts
{ name: 'body', type: 'blocks', blocks: blockLibrary }
```

**Adding a new block type is a Lot 2 dev task** (see [autonomy-boundary.md](autonomy-boundary.md)).

| Block (`slug`) | Purpose | Used by (gabarits / hosts) |
|----------------|---------|----------------------------|
| **Hero** (`hero`) | Lead visual + headline (+ homepage search/quick-access). | T1 homepage, T2/T11 landings, rich `article`/`page` bodies. |
| **RichText** (`richText`) | Formatted body text (titles, lists, links, media). | T3, T4, T7, all block bodies. |
| **ImageText** (`imageText`) | Image + text side-by-side. | T3, T4, T7, landings. |
| **CardGrid** (`cardGrid`) | Grid of cards (sub-rubriques, services). | T1 (services), T2/T11 landings. |
| **FAQ** (`faq`) | Accordion question/answer. | T3, T4, T7. |
| **CtaForm** (`ctaForm`) | Call-to-action wired to a `formulaire`. | T4 (démarche CTA), T7, contact pages (T10 entry). |
| **MapEmbed** (`mapEmbed`) | ArcGIS/ESRI map (fullscreen button default; iframe for simple locators). | T12 cartographic pages, T7 event locator. |
| **NewsList** (`newsList`) | Filtered list of `actualite`. | T1 homepage, T2 landings, T6 list. |
| **Agenda** (`agenda`) | Filtered list of `evenement`. | T1 homepage, T2 landings, T8 agenda. |
| **Partners** (`partners`) | Partner logos / links. | Landings, institutional pages. |
| **RelatedLinks** (`relatedLinks`) | Curated related links. | T2, T3, T4, T5, T7, T11. |
| **DownloadList** (`downloadList`) | Downloadable files (PDF, pièces à fournir). | T3, T4 (pièces à fournir), kiosque. |
| **Breadcrumb** (`breadcrumb`) | Fil d'Ariane from the rubrique branch. | Transverse (all content pages). |

> The `evenement.body` field intentionally uses a **curated subset** (RichText, ImageText, FAQ, MapEmbed, CtaForm, DownloadList, RelatedLinks) rather than the full library; `rubriques.landing`, `article.body` and `page.layout` use the **full** `blockLibrary`.
