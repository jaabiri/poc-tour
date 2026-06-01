import { Icon } from "@/components/ui/icon";

interface ArrowLinkProps {
  href?: string;
  children: React.ReactNode;
  /** Icon pixel size. */
  iconSize?: number;
  className?: string;
  /**
   * When this link sits inside a `.group` (e.g. a card) it reacts to the card's
   * hover instead of its own. Set to false for standalone links.
   */
  groupTriggered?: boolean;
  /**
   * Element to render as. Use `"span"` when this is purely a visual affordance
   * inside an already-clickable ancestor (e.g. a card wrapped in its own `<a>`),
   * to avoid invalid nested anchors. Defaults to `"a"` for standalone links.
   */
  as?: "a" | "span";
  /**
   * Color tone. `"brand"` (default) for light surfaces; `"inverse"` for dark
   * surfaces (e.g. the bleu-nuit "structure" cards) — white label, white arrow.
   * The growing underline stays coral in both tones (charte accent).
   */
  tone?: "brand" | "inverse";
}

/**
 * Text link with a trailing arrow and an animated underline that grows from
 * left to right on hover (or on parent `.group` hover inside a card).
 */
export function ArrowLink({
  href = "#",
  children,
  iconSize = 15,
  className = "",
  groupTriggered = true,
  as = "a",
  tone = "brand",
}: ArrowLinkProps) {
  const underline = groupTriggered
    ? "w-0 group-hover:w-full peer-hover:w-full"
    : "w-0";
  const toneClass = tone === "inverse" ? "text-text-inverse" : "text-brand-primary";
  const Element = as;
  return (
    <Element
      href={as === "a" ? href : undefined}
      className={`group/link ${toneClass} relative inline-flex items-center gap-1.5 text-sm font-semibold no-underline ${className}`}
    >
      {children}
      <Icon
        name="arrow-right"
        size={iconSize}
        className="transition-transform duration-300 group-hover/link:translate-x-1 group-hover:translate-x-1"
      />
      <span
        className={`bg-action ease-brand absolute -bottom-0.5 left-0 h-0.5 transition-[width] duration-500 group-hover/link:w-full group-hover:w-full ${underline}`}
      />
    </Element>
  );
}
