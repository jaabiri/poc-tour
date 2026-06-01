import Link from "next/link";
import { Icon, CornerSeal } from "@/components/ui";
import type { QuickAccessItem } from "@/types/content";
import { isInternalHref } from "@/lib/href";

/**
 * HeroAccesDirects — panneau bleu « Accès directs » flottant à droite du hero
 * (inspiration maine-et-loire.fr, décliné à la charte Touraine).
 *
 * Charte / a11y :
 *  - fond `surface-brand` (bleu 900) → texte blanc lisible AA ;
 *  - le titre est blanc (Fraunces) précédé d'un tick arc-en-ciel — on N'utilise
 *    PAS le SectionLabel corail (échouerait en contraste sur le bleu) ;
 *  - le dégradé arc-en-ciel reste un accent (tick + sceau), jamais sous le texte ;
 *  - filigrane « créneaux du château » purement décoratif (`aria-hidden`,
 *    `pointer-events-none`), confiné au bandeau de titre, jamais sous les liens ;
 *  - <nav aria-label> + vraie liste de liens ; focus visible 3px (global) ;
 *  - `prefers-reduced-motion` respecté (transitions désactivées globalement).
 *
 * Data-driven : reçoit le libellé + les raccourcis (mappables CMS).
 */
export function HeroAccesDirects({
  label,
  items,
}: {
  label: string;
  items: QuickAccessItem[];
}) {
  return (
    <nav
      aria-label={label}
      className="bg-surface-brand text-text-inverse shadow-float rounded-card relative"
    >
      {/* Filigrane créneaux (décoratif) — confiné au bandeau de titre */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-28 overflow-hidden rounded-t-card"
      >
        <svg
          className="absolute -top-3 right-4 h-24 w-auto opacity-[0.06]"
          viewBox="0 0 120 80"
          fill="none"
        >
          {/* Cinq créneaux du château (mêmes proportions que le BrandLogo / CornerSeal) */}
          {[0, 1, 2, 3, 4].map((i) => (
            <rect
              key={i}
              x={i * 24}
              y={i % 2 ? 18 : 0}
              width="16"
              height={i % 2 ? 62 : 80}
              rx="3"
              fill="#ffffff"
            />
          ))}
        </svg>
      </span>

      {/* Sceau d'angle arc-en-ciel (auto-clippé, décoratif) */}
      <CornerSeal />

      {/* Titre du panneau */}
      <div className="relative flex items-center gap-2.5 px-6 pb-4 pt-6">
        <span aria-hidden="true" className="bg-rainbow h-1 w-6 rounded-sm" />
        <h2 className="font-display text-text-inverse text-lg font-bold tracking-tight">
          {label}
        </h2>
      </div>

      {/* Liste des accès directs, séparés par de fins filets blancs */}
      <ul className="relative divide-y divide-white/10 px-2 pb-3">
        {items.map((item) => (
          <li key={item.title}>
            <AccesLink item={item} />
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Une ligne d'accès direct : icône + libellé + flèche qui glisse au survol. */
function AccesLink({ item }: { item: QuickAccessItem }) {
  const className =
    "group min-h-touch ease-brand flex items-center gap-3 rounded-md py-3 pl-3 pr-2.5 no-underline transition-colors hover:bg-white/[0.08]";
  const content = (
    <>
      <span
        aria-hidden="true"
        className="ease-brand grid h-9 w-9 flex-shrink-0 place-items-center rounded-md bg-white/10 text-text-inverse transition-colors group-hover:bg-white/20"
      >
        <Icon name={item.icon} size={18} />
      </span>
      <span className="text-text-inverse flex-1 text-[14.5px] font-semibold leading-tight">
        {item.title}
      </span>
      <Icon
        name="arrow-right"
        size={17}
        className="text-text-on-brand ease-brand flex-shrink-0 transition-transform group-hover:translate-x-1 group-hover:text-text-inverse"
      />
    </>
  );

  if (isInternalHref(item.href)) {
    return (
      <Link href={item.href} className={className}>
        {content}
      </Link>
    );
  }

  const isExternal = item.href?.startsWith("http");
  return (
    <a
      href={item.href}
      className={className}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {content}
    </a>
  );
}
