# touraine.fr — Institutional Website

The new institutional website of the Conseil Départemental d'Indre-et-Loire (domain `touraine.fr`), built in response to the CCTP public tender. A full rebuild "from a blank page", not a redesign of the existing site.

## Language

**CCTP**:
The "Cahier des Clauses Techniques Particulières" — the binding technical spec of the public tender. Source of truth for requirements.
_Avoid_: spec, RFP (use CCTP).

**Conseil Départemental** (CD37):
The contracting authority (maître d'ouvrage). Owns all delivered content, source, and IP at term.
_Avoid_: client, the council (use Conseil Départemental or CD37).

**Soumissionnaire**:
The bidder/contractor delivering the site. _Us._
_Avoid_: vendor, provider.

**Lot 1**:
Design + build of the site (front-office and back-office).

**Lot 2**:
Hosting, MCO (maintien en condition opérationnelle), and complementary services. Indissociable from Lot 1.

**Rubrique**:
A navigable section of the site tree. Editors create/rename/move/hide them at runtime. Tree depth capped at **3 levels**.
_Avoid_: category, menu item (those are renderings of a Rubrique).

**Arborescence**:
The full editable site tree of Rubriques. Drives the mega-menu, breadcrumb (fil d'Ariane), and routing. Not fixed at build time.

**Contributeur éditorial**:
A non-technical editor who creates/edits/publishes content for Rubriques they have rights to. Must be fully autonomous (no IT, no Soumissionnaire dependency).

**Administrateur principal**:
Holds all rights; manages user accounts, rédacteur groups, and per-group permissions.

**Groupe de rédacteurs**:
A reusable permission set scoped to one or more rubrique branches. Contributeurs are assigned to groups; access inherits down the branch.

**Validateur**:
A role that can publish content submitted "en attente de validation". A Contributeur may self-publish only if their group grants the publish right on that branch (a Contributeur autonome); otherwise they submit for a Validateur.

**Content lifecycle**:
The states a content item moves through: brouillon → en attente de validation → publié → archivé → supprimé. Supports scheduled (differed) publish/unpublish.

**Block**:
A composable layout unit (Hero/Slider, RichText, ImageText, CardGrid, CaseStudy, FAQ, CTA/Form, MapEmbed, NewsList, Agenda, Partners, RelatedLinks…). One Block = one React component (rendered with semantic design tokens) + one Payload block schema. Editors stack/reorder/configure Blocks; adding a *new Block type* is a Lot 2 dev task. Derived from the Figma "BLOC XXX" sections.
_Avoid_: cartouche, widget, section (all are renderings of a Block).

## Relationships

- The **Soumissionnaire** delivers Lot 1 + Lot 2 to the **Conseil Départemental**.
- The **Arborescence** is composed of **Rubriques** (unlimited depth; ≤ 3 recommended); each content item attaches to one or more **Rubriques**.
- A **Contributeur éditorial** acts only within Rubriques granted by an **Administrateur principal**.

## Architecture decisions (resolved)

- **The deliverable is the production site**, not a throwaway prototype: a **Next.js 16 / React 19 / Tailwind v4 front-office** backed by **Payload CMS** (MIT, runs inside the Next.js app) providing the back-office. See [ADR-0001](docs/adr/0001-headless-payload-over-traditional-cms.md).
- **Autonomy boundary** (how we answer "ne pas être tributaire du soumissionnaire"): content, media, the **Arborescence**/menu, forms, and homepage block ordering are 100% self-serve in Payload. Structural/template/visual changes (new block types, new page templates, restyling) are **Lot 2 maintenance évolutive** on bon de commande. This boundary is documented in the offer.
- **Verrou exclusif** and **historisation** are satisfied by Payload's native **document locking** and **versions/drafts** — no paid tier required.
- **Rendering model**: one catch-all `app/[[...slug]]/page.tsx` resolves the path against the Payload tree at request time; Server Components are cached by tag and invalidated **on-demand** by a Payload `afterChange`/`afterDelete` hook (`revalidateTag`) — instant publish, no redeploy. Scheduled publish = a Payload job. Satisfies *immédiate* + *cache* + runtime-editable tree simultaneously.
- **Tree model**: a dedicated **`rubriques` nested tree** (Payload Nested Docs) owns *structure only* — `title`, `slug`, `visible`, `order`, `parent` (depth validated ≤3), optional block-based landing. **Content collections** (`article`, `actualite`, `evenement`, `breve`, `page`, `formulaire`, …) hold a many-to-many **`rubriques` relationship = transversal attachment**. URL = rubrique breadcrumb (+ content slug). Move-branch = reparent one node; content untouched. Homepage placement = keyword/tag field queried by the homepage.
- **Page composition**: **block-based page-builder** — a Payload `blocks` field on rubrique landings and rich articles; curated [Block](#language) library; same engine powers the homepage (reorderable cartouches). New block types = Lot 2.
- **RBAC**: **branch-scoped ABAC** — Payload access functions read a user's group→branch grants and inherit down the `rubriques` tree, filtering content by rubrique intersection. Roles: Administrateur principal (full), Contributeur (branch-scoped, optional publish), Validateur. **Verrou exclusif** = native document locking; **historisation** = native versions. See [ADR-0002](docs/adr/0002-branch-scoped-rbac.md).
- **Search**: self-hosted **Postgres full-text** via Payload's search plugin (an index collection), facetable by date/type/event. Reserve self-hosted **Typesense** as a Lot 2 evolution if relevance/faceting needs grow. No US SaaS (sovereignty).
- **Forms**: Payload **Form Builder** plugin (champs illimités, attachable to rubriques/actus); per-form email routing to the concerned service (the CCTP "plus"). Contact form is mandatory/non-optional.
- **Hosting (Lot 2)**: **French sovereign IaaS** (OVHcloud / Scaleway), single Next.js+Payload Node app + managed **Postgres** + S3-compatible object storage for media; **Matomo** stays self-hosted on CD37 infra. Explicitly **not Vercel** (US). See [ADR-0003](docs/adr/0003-french-sovereign-hosting.md).
- **Portability**: Payload data → custom **XML export** endpoint (partial/total) for the CCTP portabilité clause; `sitemap.xml` generated from the visible `rubriques` tree.
- **SEO**: meta (title/description/og) auto-derived from content fields with per-page overrides; clean slugs from the tree; breadcrumb (fil d'Ariane) from the branch.
- **Accessibility/RGPD**: RGAA-targeted component library; font-size control (A=/A+/A-) via a CSS custom property + persisted preference; print-to-A4 via print stylesheet; cookie-consent banner gating Matomo; mentions légales / CNIL / DPO.
- **Cartographie (ESRI)**: a `MapEmbed` block storing an ArcGIS item URL + display mode. Default = **"open fullscreen in new window" button** (per CCTP recommendation, given browser security); inline iframe only for simple locator maps.
- **Newsletter / kiosque**: a double-opt-in subscription collection (RGPD) + a media collection for the **"Touraine le Mag"** PDF kiosk; sending via CD37's existing tool or an EU email service.
- **i18n**: **French only** — no multilingual requirement in the CCTP (explicit no).

## Flagged ambiguities

- **"Single source of truth" for content — RESOLVED.** [CLAUDE.md](CLAUDE.md) §5 declares markdown files in `src/data/confluence/` the single source of truth. With the Payload decision, **Payload is the source of truth**; CLAUDE.md §5 (and the §5 markdown-parser/`generateStaticParams` content model) is **obsolete** and must be rewritten. Content for editors lives in the CMS, not in git markdown.
- **CLAUDE.md describes the wrong project — ACTION NEEDED.** §4 (component architecture: `savoir-faire/expertises`, case studies) and §5 (Figma BLOC mapping: Expertise Hero, Domain Grid, Intervention Modes, "CHX OUIDOU") describe a *digital-agency expertises* site, not the Conseil Départemental institutional site. These sections are leftover template and must be rewritten for the touraine.fr domain + Payload block library. The cross-cutting rules (§1 design tokens, §2 Tailwind v4, §3 React, §6 naming, §7 best-practices) remain valid.
- **Conformity optics** (carried from [ADR-0001](docs/adr/0001-headless-payload-over-traditional-cms.md)): the offer must evidence Payload institutional references against "déjà utilisé pour sites Internet institutionnels."
