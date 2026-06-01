---
name: gabarit-rendering-architecture
description: How touraine.fr renders pages — template-driven, never one-file-per-page
metadata:
  type: project
---

touraine.fr renders every page from the rubriques tree at request time — **never one file per page** (site-tree.md §1). Key pieces:

- `app/(frontend)/[...slug]/page.tsx` — catch-all dispatcher; resolves a URL against the tree.
- `lib/resolve.ts` — `resolvePath(segments, {draft})` → discriminated union `{kind: rubrique|article|actualite|evenement|breve|page, doc, rubrique}` (rubrique first, else last segment = content slug under parent rubrique).
- `components/templates/*` — one component per gabarit (T2 listing, T3/T4 ArticleTemplate, T3/T12 PageTemplate, T5/T7/T9 detail, T10 FormulaireTemplate). Each returns MAIN CONTENT ONLY; the route supplies Topbar/SiteHeader/main/breadcrumb/SiteFooter.
- `components/blocks/BlockRenderer.tsx` — exports `Blocks({blocks, rubrique})` for arbitrary block stacks (article.body, page.layout) + `BlockRenderer({rubrique})` for landings.

**Why:** CCTP requires editor-managed structure (any depth — 3 levels recommended, NOT enforced; the old `enforceDepth` hook was removed), so pages are gabarit instances, not code. Adding a NEW gabarit/block type = Lot 2 (dev); arranging existing ones = self-serve.
**How to apply:** to add a page type, add a template + a `kind` to resolvePath, not a route file. A rubrique's gabarit is resolved by `resolveRubriqueTemplate` in the catch-all: explicit `rubrique.template` select wins, `auto`/unset falls back to heuristics (landing→composed, contact/actus/agenda/MDS slug detection, else children listing). Styling = semantic tokens only (CLAUDE.md §1/§2). See [[editing-model-live-preview]].
