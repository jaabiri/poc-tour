---
name: touraine-gabarits
description: Design and build page templates ("gabarits") and pages for the Touraine departmental web portal (Next.js + React + Tailwind), respecting the official Touraine brand charte derived from the logo. Use this skill whenever the user wants to create, design, or implement ANY page template, gabarit, layout, or page for the Touraine / "Le Département" website — landing de rubrique, page article, fiche démarche, listing, page d'accueil, page actualités, contact, etc. Trigger this even when the user only describes a gabarit from a spec table (e.g. "Landing de rubrique", "page article N3") or says "create another gabarit/page like the last one", "respecte notre charte", or pastes a row from a template/arborescence spec. Also trigger for UX/UI work, wireframes, or component design scoped to this portal.
---

# Gabarits Touraine — Le Département

This skill produces **consistent, accessible, on-brand page templates** for the Touraine departmental portal. Every gabarit must look like it belongs to the same site: same charte (colors from the official logo), same shared components, same UX patterns inspired by reference public-sector sites, same accessibility bar (RGAA / WCAG AA).

Act as **both Product Owner and senior UX/UI designer** specialized in French local-government websites. You design the information architecture AND implement it in code.

## Workflow (follow in order)

### 1. Read the references first
Before designing anything, load these files (in this folder):
- `references/charte.md` — exact brand colors, tokens, typography, charte elements (rainbow accent, corner seal, filets). **Non-negotiable.**
- `references/components.md` — the shared components to reuse (Header, Footer, Card, Button, CornerSeal, SectionLabel…) and their conventions. Never recreate them ad hoc.
- `references/gabarits.md` — the catalogue of known gabarits (the spec table) and their section anatomy. Find the requested gabarit here; if it's not listed, infer by analogy and add it.

### 2. Research inspiration (when designing a NEW gabarit)
Use web search to study how the best public/departmental portals structure this kind of page. Always include:
- https://www.maine-et-loire.fr/ (primary reference of the client)
- https://mesdemarches.eurelien.fr/
- the DSFR (French State Design System) for accessibility patterns, and 1–2 other départements.
Relevé per source: hero pattern, sub-section presentation, démarches highlighting, filtered news/agenda, breadcrumb, quick access. Synthesize **5–8 concrete takeaways BEFORE proposing the layout**. Never copy — extract patterns. (Skip this step if the user explicitly says "no research" or it's a trivial variant of an existing gabarit.)

### 3. Specify as PO/UX
Propose the **section anatomy** (ordered list of blocks, what each contains, and *why*), framed for a public-service audience. State which sections are conditional (hidden when data is absent). Confirm with the user before coding **unless** they asked to go straight to implementation or it's a close variant of an existing gabarit.

### 4. Implement
- Explore the existing Next.js project first (structure, theme tokens, shared components) and reuse what exists. State what you'll reuse before editing.
- Build the gabarit as a **reusable, data-driven** component (TypeScript if the project uses it) with a clear data interface. Every section is conditional on its data.
- Provide realistic mock data based on the **real arborescence** (see `references/gabarits.md`).
- Apply the charte exactly (tokens from `references/charte.md`). Rainbow gradient is an **accent only — never a text background**.
- Fully responsive; grids in `auto-fit`.

### 5. Accessibility gate (always)
Every gabarit must pass: contrast AA (never white text on lime/orange; dark text on light surfaces), visible 3px focus on all interactives, breadcrumb in `<nav aria-label>`, semantic landmarks, `prefers-reduced-motion` respected, decorative images `alt=""`, the rainbow gradient never under text. This is a public-sector site: treat RGAA as a hard requirement, not a nice-to-have.

## Output conventions
- Default deliverable: a `.jsx`/`.tsx` artifact in the project's conventions. If working in a local Next.js repo, edit/create real files and list every file changed.
- Keep logic/data separate from presentation; mock data at top of file or in a `data` module so it's easy to wire to the CMS later.
- Titles in **Fraunces** (serif), body in **Outfit** (sans-serif).
- When producing a prompt for Claude CLI / Claude Code instead of code, mirror this same workflow (research → spec → implement → a11y) and embed the charte from `references/charte.md`.

## Consistency rule
The whole point of this skill is that **gabarit N looks like gabarit N-1**. Before finishing, sanity-check: same header/footer, same card style, same charte tokens, same corner seal, same section-label accent, same breadcrumb pattern, same a11y treatment. If anything drifts, fix it.

See `references/` for the authoritative details.
