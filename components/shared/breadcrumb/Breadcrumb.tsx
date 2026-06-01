import Link from 'next/link'

import type { Rubrique } from '@/payload-types'

/**
 * Breadcrumb — the « fil d'Ariane » shared across every gabarit. It is rendered
 * INSIDE the masthead so it belongs to the hero (où suis-je → quel est ce
 * contenu) rather than floating on a separate strip above it.
 *
 * Two tones keep contrast AA on either surface (CLAUDE.md §1/§2 — semantic
 * tokens only):
 *  - `on-brand` : light text over the deep-brand hero band (the default
 *    masthead). Links are `blue-200`, hovering to white; the current page is
 *    white + semibold.
 *  - `default`  : muted text over a light page surface (used by the few
 *    light-top gabarits — page T3, brève T9).
 *
 * Presentation-only: it reads the rubrique's nested-docs `breadcrumbs`
 * (ancestors + self) and renders no Container — the caller owns the horizontal
 * padding (the hero Container, or a route-level Container for light tops).
 */

type Crumb = NonNullable<Rubrique['breadcrumbs']>[number]

interface BreadcrumbProps {
  crumbs: Crumb[]
  /** Fallback label for the last crumb when the nested-doc has none. */
  currentTitle: string
  tone?: 'default' | 'on-brand'
  className?: string
}

const TONE = {
  default: {
    nav: 'text-text-muted',
    link: 'hover:text-action',
    current: 'text-text-primary',
    sep: 'text-text-muted',
  },
  'on-brand': {
    nav: 'text-text-on-brand',
    link: 'hover:text-text-inverse',
    current: 'text-text-inverse',
    sep: 'text-text-on-brand/70',
  },
} as const

export function Breadcrumb({
  crumbs,
  currentTitle,
  tone = 'on-brand',
  className = '',
}: BreadcrumbProps) {
  const t = TONE[tone]
  return (
    <nav
      aria-label="Fil d'Ariane"
      className={`text-sm ${t.nav} ${className}`}
    >
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <li className="flex items-center gap-x-2">
          <Link href="/" className={`${t.link} no-underline`}>
            Accueil
          </Link>
          <span aria-hidden="true" className={t.sep}>
            /
          </span>
        </li>
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1
          const label = c.label ?? (isLast ? currentTitle : '')
          const url = c.url ? (c.url.startsWith('/') ? c.url : `/${c.url}`) : '#'
          return (
            <li key={c.id ?? `${label}-${i}`} className="flex items-center gap-x-2">
              {isLast ? (
                <span aria-current="page" className={`${t.current} font-semibold`}>
                  {label}
                </span>
              ) : (
                <>
                  <a href={url} className={`${t.link} no-underline`}>
                    {label}
                  </a>
                  <span aria-hidden="true" className={t.sep}>
                    /
                  </span>
                </>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default Breadcrumb
