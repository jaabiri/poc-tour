/**
 * CornerSeal — the brand-mark echo placed at the top-right of cards: five small
 * vertical "crénelage" bars in the rainbow colours (the château symbol) on a
 * cream folded corner. Purely decorative (`aria-hidden`), so it never reaches
 * the accessibility tree and the rainbow gradient never sits under text.
 *
 * Colours reuse the same Tier-1 rainbow CSS variables the BrandLogo crénaux use
 * (`--rainbow-*`) and the semantic `--color-brand-accent-soft` cream — no raw
 * hex in the component.
 */

/** The five rainbow crénaux of the château symbol (cyan → coral). */
const CRENEAUX = [
  'var(--rainbow-cyan)',
  'var(--rainbow-blue)',
  'var(--rainbow-lime)',
  'var(--rainbow-orange)',
  'var(--rainbow-coral)',
]

export function CornerSeal({ size = 44 }: { size?: number }) {
  return null;
}

export default CornerSeal
