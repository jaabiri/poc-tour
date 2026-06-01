# Charte graphique Touraine — Le Département

Brand identity derived from the **official logo**: a stylized castle (crenellations) in a rainbow gradient over blue waves (the Loire), with "TOURAINE / LE DÉPARTEMENT" wordmark in blue. The charte below is extracted pixel-accurately from that logo. **Respect it exactly on every gabarit.**

## Color tokens

```js
const C = {
  // Brand blue (logo wordmark + waves) — DOMINANT
  blue900: "#003D5C",  // deep backgrounds
  blue800: "#005380",
  blue700: "#006090",  // primary brand blue
  blue600: "#0A77A8",
  blue200: "#CFE6F0",  // light fills

  // Rainbow gradient of the castle symbol — ACCENT ONLY
  cyan:   "#0AA6B8",
  lime:   "#8FB02E",
  gold500:"#E8A23A",
  orange: "#E8853A",
  coral:  "#D9533B",
  accent: "#D9533B",   // primary punctual accent (badges, active links)

  goldSoft: "#FBF1E2",  // corner-seal tint

  // Neutrals
  canvas:  "#F2F6F9",
  surface: "#FFFFFF",
  n200: "#E2E8F0",      // borders
  n400: "#94A3B8",
  n500: "#64748B",      // muted text
  text: "#15293A",
};
```

### Rainbow gradient (the signature accent)
```js
const RAINBOW = "linear-gradient(90deg, #0AA6B8 0%, #0A77A8 28%, #8FB02E 52%, #E8A23A 74%, #D9533B 100%)";
```
**Rules for RAINBOW:** accent only — filets, section-label ticks, corner seals, dividers. **Never** as a background behind text (contrast fails). Never as a large flat fill.

## Typography
- Titles / display: **Fraunces** (serif, weights 500–900). Use for h1/h2/h3 and editorial headings.
- Body / UI: **Outfit** (sans-serif, 300–700).
- Load via Google Fonts (`@import`) in standalone artifacts, or `next/font` in the Next.js project.

```css
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700;9..144,900&family=Outfit:wght@300;400;500;600;700&display=swap');
.display { font-family: 'Fraunces', Georgia, serif; }
/* base body font-family: 'Outfit', system-ui, sans-serif; */
```

## Charte elements (use consistently across all gabarits)

1. **Filet** — a 5px bar in `RAINBOW` at the very top of the page and at the bottom of major dark sections (hero, newsletter, footer).

2. **Section label accent** — each section title is preceded by an eyebrow: a small `RAINBOW` tick (26×4px, rounded) + uppercase label in `coral`.
```jsx
function SectionLabel({ children }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:9, fontSize:12.5, fontWeight:700, letterSpacing:1, textTransform:"uppercase", color:C.accent }}>
      <span style={{ width:26, height:4, background:RAINBOW, display:"inline-block", borderRadius:3 }} />{children}
    </span>
  );
}
```

3. **CornerSeal** — the brand mark echo: 5 small vertical "crenellation" bars in the rainbow colors, top-right of cards, on a cream (`goldSoft`) folded corner. Replaces any fleur-de-lys (the logo's identity is the rainbow castle, not a lys).
```jsx
function CornerSeal({ size = 44 }) {
  const cols = ["#0AA6B8","#0A77A8","#8FB02E","#E8A23A","#D9533B"];
  return (
    <span aria-hidden="true" style={{ position:"absolute", top:0, right:0, width:size, height:size, overflow:"hidden", borderTopRightRadius:18, pointerEvents:"none" }}>
      <svg width={size} height={size} viewBox="0 0 44 44" style={{ display:"block" }}>
        <path d="M44 0 L44 44 L0 0 Z" fill={C.goldSoft} opacity="0.9" />
        <g transform="translate(23,8)">
          {cols.map((c,i)=>(<rect key={i} x={i*3.1} y={i%2?3:0} width="2.3" height={i%2?11:14} rx="0.6" fill={c} />))}
        </g>
      </svg>
    </span>
  );
}
```

4. **Logo** — always the real logo image (never a text "T"). In header height ~56px, footer ~64px, `alt="Touraine, le Département"`. In the Next.js repo, reference the official **SVG** at `/public/logo-touraine.svg` (vector, sharp at all sizes). Avoid rasterized PNG in production.

5. **Badges / tags** — `coral` background, white text, uppercase, small, rounded 20px.

6. **Buttons** — primary: `blue700` bg, white text. Accent/CTA: `coral`. Radius ~11–12px.

7. **Cards** — white surface, 1px `n200` border, radius ~16–18px, hover lift (translateY(-5px) + soft blue shadow). Optional CornerSeal top-right. On hover, inner image scales ~1.07 (overflow hidden).

8. **Focus** — `:focus-visible { outline: 3px solid #E8A23A; outline-offset: 3px; }` (the gold/amber from the logo reads as a clear, accessible focus ring).

## Accessibility (RGAA / WCAG AA) — hard requirements
- Contrast AA on all text. Dark text (`#15293A`) on light fills. White only on `blue700/800/900` and `coral` (verified). **Never** white text on `lime`/`orange`/`gold`.
- Rainbow gradient never sits under text.
- All interactives keyboard-focusable with the visible focus ring above.
- Honor `@media (prefers-reduced-motion: reduce)` — disable transitions/animations.
- Breadcrumb in `<nav aria-label="Fil d'ariane">`, decorative images `alt=""`, meaningful landmarks (`header`, `nav`, `main`, `footer`).
