# Project Rules

The following rules apply to all code in this project. Follow them strictly at all times.

---

## 1. Design Token Architecture

See full rules: [rules/design-tokens.mdc](rules/design-tokens.mdc)

- **NEVER** use arbitrary Tailwind values: `bg-[#f0f]`, `p-[14px]`
- **NEVER** use Tier 1 primitives in components: `text-blue-500`, `m-4`
- **ALWAYS** use Tier 2 (Semantic) or Tier 3 (Component) tokens
- If a required token is missing, **DO NOT guess** — ask to define a new semantic token first
- Before outputting code, verify: "Am I using a raw color or a semantic one?" If raw, rewrite it.

**Token tiers:**
- Tier 1 (Primitives): Hidden in `tailwind.config.ts` or CSS variables (e.g., `--color-blue-500`)
- Tier 2 (Semantic): Use for 90% of development (e.g., `text-action-primary`, `bg-surface-main`)
- Tier 3 (Component): Specific overrides (e.g., `btn-primary-bg`)

---

## 2. Tailwind Styling (v4)

See full rules: [rules/tailwind-styling.mdc](rules/tailwind-styling.mdc)

- **Never** use arbitrary values like `w-[48px]`, `rounded-[12px]` in `*.tsx`
- **Never** use raw palette primitives like `text-blue-500`, `bg-slate-50`
- **Always** use auto-generated utilities from theme namespaces:
  - `--spacing-*` → `h-*`, `w-*`, `p-*`, `gap-*`, `size-*`
  - `--radius-*` → `rounded-*`
  - `--color-*` → `bg-*`, `text-*`, `border-*`
  - `--shadow-*` → `shadow-*`
  - `--font-*` → `font-*`
- **Never** use `var()` or CSS variable syntax (`h-(--spacing-button-height-lg)`) when a namespace utility exists
- Only use CSS variable syntax for: `calc()` operations, or tokens not in a valid namespace

**Verification before writing component code:**
1. Component tokens use correct namespace (`--spacing-*`, `--radius-*`, etc.)
2. Using auto-generated utilities (`h-button-height-lg`, not `h-(--spacing-button-height-lg)`)
3. Colors use semantic classes (`bg-brand-accent`, not `bg-[var(--color-*)]`)
4. No `var()` syntax unless `calc()` or non-namespace tokens

**Reference files:**
- CSS Theme Tokens: `src/index.css` (`@theme` block)
- Tailwind Config: `tailwind.config.js`
- Reference Component: `src/components/ui/button.tsx`

---

## 3. React Development

See full rules: [rules/react.mdc](rules/react.mdc)

### Effects
- Effects are an escape hatch for external systems (network, browser APIs, third-party libs)
- If there's no external system involved, you probably don't need an Effect
- Most logic belongs in event handlers or is calculated during rendering

### Avoid Effects for:
- Transforming data for rendering → calculate during render instead
- Event-specific logic → use event handlers
- Chains of state updates → consolidate in event handlers
- Notifying parents → call parent callback in the same event handler
- App initialization → use top-level code outside components

### State rules:
- Store minimal state (IDs, not full objects); derive values during rendering
- To reset all state when a prop changes, use `key` prop — not `useEffect`
- Use `useMemo` for expensive calculations (>1ms); profile first

### Refs rules:
- Use refs for values that don't affect rendering (timeout IDs, DOM nodes, external instances)
- Never read/write `ref.current` during rendering (exception: lazy initialization)
- Use `useImperativeHandle` to limit exposed DOM API

### Effects structure:
- Always include a cleanup function for subscriptions, timers, and listeners
- Always declare all reactive values in the dependency array
- Refs and `setState` functions can be omitted (stable identity)
- Never manually exclude dependencies to suppress lint warnings

### External stores:
- Use `useSyncExternalStore` for browser APIs or third-party state
- `subscribe` function must be stable (defined outside component or wrapped in `useCallback`)

### Red flags:
- Effect that only updates state based on other state
- Effect that runs on every render (no dependency array)
- Missing cleanup for subscriptions/timers
- Reading/writing refs during render
- Manually excluding dependencies


## 4. Component Architecture (by menu section)

Components are grouped by **menu section** to mirror the navbar hierarchy:

```
src/components/
  savoir-faire/expertises/   # Expertise-specific section components
  shared/                     # Reusable across all menu sections
  ui/                         # Primitives (Button, Icon, Tag)
  layout/                     # Navbar, Footer
  sections/                   # Homepage sections
```

**Rules:**
- Components specific to one menu section go in that section's folder (e.g., `savoir-faire/expertises/`)
- Components used across multiple page types go in `shared/`
- Each component has a barrel `index.ts` export



## 7. General Best Practices

### Dynamic over static

- **NEVER** hardcode content that could vary — always drive it from data (markdown, config, props)
- Pages with repeated structure (expertise, case study, blog) **MUST** use a single dynamic route `[slug]` + data source, never one file per page
- If you find yourself copy-pasting a component with minor text changes, extract the data into an array/config and map over it

### Component-first

- Extract any repeated UI pattern (≥ 2 occurrences) into a reusable component immediately
- Pass content via props — never embed strings inside component bodies if they come from a data source
- Prefer composition (`children`, render props) over conditional rendering inside a single monolithic component
- One component = one responsibility; split when a component does more than one thing

### Data flow

- Data fetching belongs at the page/route level — pass data down as props
- Components must be pure and data-agnostic whenever possible (no internal fetches)
- For static content at build time: use `generateStaticParams` + server component data fetching
- For config/mapping (themes, icons, labels): centralize in a dedicated config file under `src/lib/`

---
