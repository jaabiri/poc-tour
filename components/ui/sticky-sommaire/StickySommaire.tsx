'use client'

import { useEffect, useId, useRef, useState } from 'react'

import { Icon } from '../icon'

export interface SommaireLink {
  id: string
  label: string
}

/**
 * StickySommaire — the side-rail summary of a long editorial rubrique.
 *
 * Pattern: DSFR « Sommaire » (a `<nav>` + ordered list of in-page anchors whose
 * labels reproduce the section titles) hardened into a STICKY rail with a
 * scroll-spy — a deliberate, accessible deviation from the strict DSFR rule
 * (which keeps the sommaire non-sticky) to suit a long landing column.
 *
 * Accessibility:
 *  - `<nav aria-labelledby>` + `<ol>`, labels = exact section headings;
 *  - the section in view is flagged `aria-current="true"` (IntersectionObserver);
 *  - anchors are native links (keyboard-focusable, real `#id` targets), so the
 *    summary works with JS off; the click handler only upgrades the jump to a
 *    smooth scroll, and is disabled under `prefers-reduced-motion`;
 *  - on mobile the list collapses behind an `aria-expanded` toggle; on `lg`+ the
 *    list is always shown and the toggle is hidden.
 *
 * The sticky positioning itself is owned by the parent wrapper (`lg:sticky`), so
 * this component stays layout-agnostic.
 */
export function StickySommaire({ links }: { links: SommaireLink[] }) {
  const [active, setActive] = useState<string | null>(links[0]?.id ?? null)
  const [open, setOpen] = useState(false)
  const titleId = useId()
  const listId = useId()
  const reducedRef = useRef(false)

  // Scroll-spy: highlight the heading currently in the upper third of the
  // viewport. The rootMargin biases the "active" zone toward the top so a
  // section is marked current as its title reaches the header, not its middle.
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const targets = links
      .map((l) => document.getElementById(l.id))
      .filter((el): el is HTMLElement => el != null)
    if (targets.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 },
    )
    targets.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [links])

  // Cache the motion preference (read once, kept in a ref so the handler is stable).
  useEffect(() => {
    reducedRef.current = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
  }, [])

  const handleClick =
    (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      const target = document.getElementById(id)
      if (!target) return
      e.preventDefault()
      setActive(id)
      setOpen(false)
      target.scrollIntoView({
        behavior: reducedRef.current ? 'auto' : 'smooth',
        block: 'start',
      })
      // Keep the URL hash + focus in sync for assistive tech / deep links.
      history.replaceState(null, '', `#${id}`)
      target.focus({ preventScroll: true })
    }

  if (links.length < 2) return null

  return (
    <nav
      aria-labelledby={titleId}
      className="bg-surface-main border-border-main rounded-xl border p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <h2
          id={titleId}
          className="font-display text-brand-primary-dark m-0 text-lg font-bold"
        >
          Sommaire
        </h2>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((v) => !v)}
          className="text-action hover:text-action-hover inline-flex h-touch items-center gap-1.5 text-sm font-semibold lg:hidden"
        >
          {open ? 'Masquer' : 'Afficher'}
          <Icon
            name="chevron-down"
            size={16}
            className={open ? 'rotate-180 transition-transform' : 'transition-transform'}
          />
        </button>
      </div>

      <ol
        id={listId}
        className={`mt-4 flex-col gap-1 ${open ? 'flex' : 'hidden'} lg:flex`}
      >
        {links.map((link, i) => {
          const isActive = active === link.id
          return (
            <li key={link.id} className="flex items-stretch gap-3">
              {/* Active marker: a rainbow tick (accent only — never under text). */}
              <span
                aria-hidden="true"
                className={`mt-1 w-0.5 shrink-0 rounded-full ${
                  isActive ? 'bg-rainbow' : 'bg-transparent'
                }`}
              />
              <a
                href={`#${link.id}`}
                onClick={handleClick(link.id)}
                aria-current={isActive ? 'true' : undefined}
                className={`flex items-baseline gap-2.5 rounded-sm py-1.5 no-underline ${
                  isActive
                    ? 'text-action font-semibold'
                    : 'text-text-primary hover:text-action font-medium'
                }`}
              >
                <span className="text-sm tabular-nums opacity-70">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-sm leading-snug">{link.label}</span>
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default StickySommaire
