import Link from "next/link";
import { Icon, ArrowLink } from "@/components/ui";
import type { ProfileItem } from "@/types/content";
import { isInternalHref } from "@/lib/href";

/**
 * "Je suis…" profile tile — entry by audience (inspiration eurelien.fr /
 * maine-et-loire.fr), aligned on the canonical navigation-card system
 * (RubriqueCard): a thin top filet in the brand RAINBOW that thickens on
 * hover/focus, and an icon pavé that flips from light blue to solid deep blue
 * with a white glyph + subtle scale/rotate. Two `family` variants:
 *
 *  - `habitant` (citizen): white surface, per-profile glyph tint at rest
 *    (the castle's rainbow steps) to differentiate cards without breaking the
 *    blue harmony.
 *  - `structure` (organisations): bleu-nuit surface (`surface-brand`) with white
 *    text — signals the change of logic. Contrast verified AA (white on blue900).
 *
 * A11y: the whole card is a single accessible link with an explicit aria-label;
 * the filet + icon are decorative (`aria-hidden`, no text under the gradient);
 * the "strong" state triggers on `:hover` AND `:focus-visible` (never frozen on
 * one card); focus ring + `prefers-reduced-motion` are global (globals.css).
 * Flex column so cards align and the "Voir mes démarches" link stays anchored
 * at the bottom whatever the description length. No CornerSeal (same rule as the
 * refreshed navigation cards). Token-only styling (CLAUDE.md).
 */

/** Glyph tints for the `habitant` cards — the castle's rainbow steps (decorative, at rest only). */
const TINTS = [
  "text-profile-1",
  "text-profile-2",
  "text-profile-3",
  "text-profile-4",
] as const;

export function ProfileCard({
  item,
  index = 0,
}: {
  item: ProfileItem;
  /** Position within its group — selects the per-profile glyph tint (habitant only). */
  index?: number;
}) {
  const isStructure = item.family === "structure";
  const eyebrow = isStructure ? "Je représente" : "Je suis";
  const ariaLabel = `${eyebrow} ${item.audience} — voir mes démarches`;
  const tint = TINTS[index % TINTS.length];

  const className = [
    "group relative flex h-full flex-col overflow-hidden rounded-card border p-6 no-underline transition-all duration-[400ms] ease-brand hover:-translate-y-1.5 focus-visible:-translate-y-1.5",
    isStructure
      ? "bg-surface-brand border-white/10 shadow-card hover:shadow-card-hover focus-visible:shadow-card-hover hover:border-white/25 focus-visible:border-white/25"
      : "bg-surface-main border-border-main shadow-card-sm hover:shadow-card-hover focus-visible:shadow-card-hover hover:border-brand-primary-mid focus-visible:border-brand-primary-mid",
  ].join(" ");

  const pave = isStructure
    ? "bg-white/10 text-text-inverse group-hover:bg-white/20 group-focus-visible:bg-white/20"
    : `bg-surface-tint-blue ${tint} group-hover:bg-surface-tint-blue-strong group-hover:text-text-inverse group-focus-visible:bg-surface-tint-blue-strong group-focus-visible:text-text-inverse`;

  const content = (
    <>
      {/* Accent de charte : filet rainbow fin (≈3px) qui s'épaissit au hover/focus. Décoratif, jamais sous du texte. */}
      <span
        aria-hidden="true"
        className="bg-rainbow ease-brand absolute inset-x-0 top-0 h-[3px] origin-top scale-y-100 transition-transform duration-[400ms] group-hover:scale-y-[2.3] group-focus-visible:scale-y-[2.3]"
      />
      <span
        aria-hidden="true"
        className={`${pave} ease-brand mb-5 mt-1 grid size-14 place-items-center rounded-[14px] transition-all duration-[400ms] group-hover:rotate-[-3deg] group-hover:scale-105 group-focus-visible:rotate-[-3deg] group-focus-visible:scale-105`}
      >
        <Icon name={item.icon} size={28} />
      </span>
      <span
        className={`text-xs font-semibold uppercase tracking-wide ${isStructure ? "text-text-on-brand" : "text-text-muted"}`}
      >
        {eyebrow}
      </span>
      <h3
        className={`font-display mt-0.5 text-lg font-bold leading-snug ${isStructure ? "text-text-inverse" : "text-brand-primary-dark"}`}
      >
        {item.audience}
      </h3>
      <p
        className={`mt-2 text-sm leading-relaxed ${isStructure ? "text-text-on-brand" : "text-text-muted"}`}
      >
        {item.description}
      </p>
      <span className="mt-auto inline-block pt-5">
        <ArrowLink as="span" tone={isStructure ? "inverse" : "brand"}>
          Voir mes démarches
        </ArrowLink>
      </span>
    </>
  );

  if (isInternalHref(item.href)) {
    return (
      <Link href={item.href} aria-label={ariaLabel} className={className}>
        {content}
      </Link>
    );
  }

  const isExternal = item.href?.startsWith("http");
  return (
    <a
      href={item.href}
      aria-label={ariaLabel}
      className={className}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {content}
    </a>
  );
}
