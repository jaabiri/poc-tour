import Link from 'next/link'

import { Icon, ArrowLink } from '@/components/ui'
import { isInternalHref } from '@/lib/href'
import type { IconName } from '@/lib/icons'

/**
 * RubriqueCard — the sub-rubrique card at the heart of a section landing (T2
 * CardGrid "Dans cette rubrique").
 *
 * Charte accent: a thin top filet in the brand RAINBOW that thickens on
 * hover/focus (replaces the old corner seal — one elegant accent instead of a
 * busy mark). The icon pavé rests in light blue (blue200) and flips to solid
 * deep blue (blue800) with a white glyph + subtle scale/rotate on hover OR
 * keyboard focus (the "strong" state is never frozen on a single card).
 *
 * A11y: the whole card is a single accessible link with an explicit aria-label;
 * the rainbow filet + icon are decorative (aria-hidden / no text under the
 * gradient); the strong state triggers on `:focus-visible` too; focus ring and
 * `prefers-reduced-motion` are handled globally (app/globals.css). Cards use a
 * flex column so they align in the grid and the "Découvrir" link sits at the
 * bottom even when descriptions vary in length. Token-only styling (CLAUDE.md).
 *
 * Data-driven and link-aware: internal hrefs use next/link, external open in a
 * new tab. Icon is optional.
 */

export interface RubriqueCardData {
  icon?: IconName | null
  title: string
  description?: string | null
  href: string
}

export function RubriqueCard({ item }: { item: RubriqueCardData }) {
  const className =
    'group bg-surface-main border-border-main shadow-card-sm hover:shadow-card-hover focus-visible:shadow-card-hover relative flex h-full flex-col overflow-hidden rounded-card border px-6 pb-6 pt-7 no-underline transition-all duration-[400ms] ease-brand hover:-translate-y-1.5 hover:border-brand-primary-mid focus-visible:-translate-y-1.5 focus-visible:border-brand-primary-mid'
  const ariaLabel = `${item.title} — découvrir la rubrique`
  const content = (
    <>
      {/* Accent de charte : filet rainbow fin (≈3px) qui s'épaissit au hover/focus. Décoratif, jamais sous du texte. */}
      <span
        aria-hidden="true"
        className="bg-rainbow ease-brand absolute inset-x-0 top-0 h-[3px] origin-top scale-y-100 transition-transform duration-[400ms] group-hover:scale-y-[2.3] group-focus-visible:scale-y-[2.3]"
      />
      {item.icon ? (
        <div className="bg-surface-tint-blue text-brand-primary group-hover:bg-surface-tint-blue-strong group-hover:text-text-inverse group-focus-visible:bg-surface-tint-blue-strong group-focus-visible:text-text-inverse ease-brand mb-5 mt-1 grid h-14 w-14 place-items-center rounded-[14px] transition-all duration-[400ms] group-hover:rotate-[-3deg] group-hover:scale-105 group-focus-visible:rotate-[-3deg] group-focus-visible:scale-105">
          <Icon name={item.icon} size={28} />
        </div>
      ) : null}
      <h3 className="text-brand-primary-dark font-display mb-2 text-lg font-semibold leading-snug">
        {item.title}
      </h3>
      {item.description ? (
        <p className="text-text-muted text-sm leading-relaxed">{item.description}</p>
      ) : null}
      <span className="mt-auto inline-block pt-5">
        <ArrowLink as="span">Découvrir</ArrowLink>
      </span>
    </>
  )

  if (isInternalHref(item.href)) {
    return (
      <Link href={item.href} aria-label={ariaLabel} className={className}>
        {content}
      </Link>
    )
  }

  const isExternal = item.href?.startsWith('http')
  return (
    <a
      href={item.href}
      aria-label={ariaLabel}
      className={className}
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {content}
    </a>
  )
}

export default RubriqueCard
