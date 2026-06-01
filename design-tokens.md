# Design Tokens — Touraine (Le Département)

Heraldic charter: **bleu / rouge / or** (blue / red / gold).
All tokens live in [`app/globals.css`](app/globals.css).

> **Architecture note:** Tailwind v4 (CSS-first config). There is no
> `tailwind.config.js` — tokens are defined via `@theme {}` in `globals.css`.
> Tier 1 primitives live in `:root` (never generate utilities).
> Tier 2 / Tier 3 semantic tokens live in `@theme` (auto-generate all utilities).

---

## Token Tiers

| Tier | Location | Purpose | Example |
|------|----------|---------|---------|
| **1 — Primitive** | `:root` in `globals.css` | Raw palette. Never use in components. | `--blue-800: #0f2c59` |
| **2 — Semantic** | `@theme` in `globals.css` | Named by intent, used for ~90% of dev | `bg-brand-primary`, `text-text-muted` |
| **3 — Component** | `@theme` in `globals.css` | Scoped to a component | `shadow-dropdown`, `shadow-header` |

**Rule:** never use raw hex / arbitrary classes (`bg-[#0f2c59]`, `p-[14px]`) or
Tier 1 primitives (`bg-blue-800`) in components — always use the semantic tokens.

---

## Colors

### Brand

| Semantic token | Utility | Primitive | Value |
|---|---|---|---|
| `--color-brand-primary` | `bg-brand-primary` / `text-brand-primary` | `--blue-800` | `#0f2c59` |
| `--color-brand-primary-dark` | `bg-brand-primary-dark` | `--blue-900` | `#091b37` |
| `--color-brand-primary-mid` | `bg-brand-primary-mid` | `--blue-700` | `#16407a` |
| `--color-brand-accent` | `bg-brand-accent` / `text-brand-accent` | `--gold-500` | `#d4af37` |
| `--color-brand-accent-soft` | `bg-brand-accent-soft` | `--gold-soft` | `#fbf3dc` |

### Action (CTA)

| Semantic token | Utility | Primitive | Value |
|---|---|---|---|
| `--color-action` | `bg-action` / `text-action` | `--red-600` | `#d92323` |
| `--color-action-hover` | `bg-action-hover` | `--red-700` | `#b91c1c` |

### Surfaces

| Semantic token | Utility | Value |
|---|---|---|
| `--color-surface-page` | `bg-surface-page` | `#f4f6f9` |
| `--color-surface-main` | `bg-surface-main` | `#ffffff` |
| `--color-surface-brand` | `bg-surface-brand` | `#091b37` |
| `--color-surface-tint-blue` | `bg-surface-tint-blue` | `#d0e1fd` |

### Text

| Semantic token | Utility | Value |
|---|---|---|
| `--color-text-primary` | `text-text-primary` | `#1a202c` |
| `--color-text-heading` | `text-text-heading` | `#091b37` |
| `--color-text-muted` | `text-text-muted` | `#64748b` |
| `--color-text-inverse` | `text-text-inverse` | `#ffffff` |
| `--color-text-on-brand` | `text-text-on-brand` | `#d0e1fd` |

### Borders & icons

| Semantic token | Utility | Value |
|---|---|---|
| `--color-border-main` | `border-border-main` | `#e2e8f0` |
| `--color-icon-muted` | `text-icon-muted` | `#94a3b8` |

---

## Typography

| Role | CSS variable | Utility | Font (next/font) |
|---|---|---|---|
| Display / headings | `--font-display` | `font-display` | **Fraunces** (serif) |
| Body / UI | `--font-sans` | `font-sans` | **Outfit** (sans) |

Fonts are loaded in [`app/layout.tsx`](app/layout.tsx) via `next/font/google`
and exposed as `--font-fraunces` / `--font-outfit`.

---

## Radius

| Utility | Value |
|---|---|
| `rounded-sm` | 8px |
| `rounded-md` | 12px |
| `rounded-lg` | 16px |
| `rounded-xl` | 18px |
| `rounded-2xl` | 22px |
| `rounded-full` | 9999px |

## Shadows

| Utility | Usage |
|---|---|
| `shadow-card` | Default card |
| `shadow-card-sm` | Small / quick-access card |
| `shadow-card-hover` | Card hover state |
| `shadow-float` | Floating hero search card |
| `shadow-dropdown` | Nav mega-menu |
| `shadow-header` | Sticky header on scroll |

## Layout

`max-w-page` → 1200px (use via the `<Container>` component).

---

## Usage

```tsx
// ✅ semantic tokens
<section className="bg-surface-page py-16">
  <h2 className="font-display text-text-heading text-4xl font-bold">Services</h2>
  <p className="text-text-muted text-base">Description</p>
</section>

// ✅ brand CTA
<button className="bg-action hover:bg-action-hover text-text-inverse rounded-md px-6 py-3 font-semibold">
  Rechercher
</button>

// ❌ raw primitive / arbitrary value
<div className="bg-[#0f2c59] text-[#64748b] p-[24px]">…</div>
```
