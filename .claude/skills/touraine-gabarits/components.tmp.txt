# Composants partagés Touraine

Reuse these across every gabarit so pages stay consistent. In a real Next.js repo, **explore the project first** and reuse the existing implementations; recreate from here only if they don't exist yet. Names are indicative — match the project's conventions.

## Layout shell
- **Header** (sticky): top utility bar (Nos sites et services / Accessibilité / Contact / Espace privé with lock icon in `gold`), then logo (real image, ~56px) + horizontal nav with mega-menus + "Espace privé". Burger drawer < 920px. Nav has 3 main entries (see gabarits.md).
- **Footer**: logo (~64px), coordinates (Hôtel du Département, 37000 Tours, phone, email), social icons, then 3 columns of arborescence + legal row (Mentions légales, Données personnelles, Accessibilité, Plan du site, Contact) + copyright. Bottom filet in RAINBOW.
- **UtilityBar**, **MobileMenu** — part of header.

## Content components
- **SectionLabel** — eyebrow (rainbow tick + coral uppercase label). See charte.md.
- **CornerSeal** — rainbow crenellation corner mark. See charte.md.
- **Card** — white, bordered, rounded, hover-lift. Variants: link card, image card (image top, overlay gradient, badge + title), horizontal card.
- **Button** — `primary` (blue700) / `accent` (coral) / `ghost`.
- **Badge / Tag** — coral pill, white uppercase text.
- **Breadcrumb** — `<nav aria-label="Fil d'ariane">` Accueil / N1 / N2.
- **SearchBar** — input + icon, rounded, blue button.
- **NewsCard / EventCard** — image (16:10 / 16:9), CornerSeal, badge, date with calendar icon, Fraunces title, "Lire l'article" / location with pin.
- **Pagination** — Prev / numbered / Next, `aria-current` on active, disabled at ends.
- **FilterChips** — pill group, `aria-pressed`, active = blue800 fill.
- **Newsletter** — blue gradient band, gold radial glow, email input + coral submit, bottom rainbow filet.

## Interaction conventions
- Card hover: `translateY(-5px)` + shadow `0 24px 46px -22px rgba(15,44,89,.4)`; inner image `scale(1.07)`.
- Link "more": inline-flex, arrow that nudges right on hover, underline that grows from left in `coral`.
- Mega-menu: opens on hover (desktop), `width 280` (or `560` wide / 2-col for big rubriques).
- Reveal-on-scroll (optional): `IntersectionObserver`, staggered `transition-delay`, disabled under `prefers-reduced-motion`.

## Data-driven principle
Each gabarit takes a typed data object; each section renders only if its data exists. Keep mock data at the top of the file or in a `data` module, shaped to map cleanly onto a CMS later.
