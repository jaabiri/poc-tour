import Link from 'next/link'

import { Icon } from '@/components/ui'
import {
  CATEGORY_LABELS,
  buildAgendaQuery,
  type AgendaView,
  type Category,
  type When,
} from '@/lib/agenda'

/**
 * AgendaToolbar — the agenda's control bar (T8). Entirely URL-driven so the
 * page stays a Server Component with NO client JS (links + GET forms), shareable
 * and RGAA-accessible (CLAUDE.md §3):
 *   • segment « À venir / Passés »            → `when`   (role=group, aria-pressed)
 *   • recherche                                → `q`      (GET form, role=search)
 *   • filtres catégorie (chips)                → `cat`    (aria-pressed)
 *   • période : Tout / Ce mois / sélecteur     → `period` (chips + GET select)
 *   • bascule de vue Liste / Calendrier        → `view`   (aria-pressed)
 *
 * Semantic design tokens only; chips/segments mirror the actus listing so the
 * page reads as the same site.
 */

const seg = (active: boolean) =>
  active
    ? 'bg-surface-brand text-text-inverse rounded-full px-5 py-2 text-sm font-semibold no-underline'
    : 'bg-surface-main border-border-main text-text-primary hover:border-brand-primary rounded-full border px-5 py-2 text-sm font-semibold no-underline transition-colors'

const chip = (active: boolean) =>
  active
    ? 'bg-surface-brand text-text-inverse rounded-full px-4 py-2 text-sm font-semibold no-underline'
    : 'bg-surface-main border-border-main text-text-primary hover:border-brand-primary rounded-full border px-4 py-2 text-sm font-semibold no-underline transition-colors'

export function AgendaToolbar({
  basePath,
  categories,
  months,
  when,
  cat,
  q,
  period,
  view,
}: {
  basePath: string
  categories: Category[]
  months: { key: string; label: string }[]
  when: When
  cat: string
  q: string
  period: string
  view: AgendaView
}) {
  const href = (patch: Partial<Parameters<typeof buildAgendaQuery>[0]>) =>
    `${basePath}${buildAgendaQuery({ when, cat, q, period, view, ...patch })}`

  // A specific month (YYYY-MM) currently selected in the period <select>.
  const periodMonth = /^\d{4}-\d{2}$/.test(period) ? period : ''

  return (
    <div className="bg-surface-main border-border-main mt-6 flex flex-col gap-5 rounded-card border p-5">
      {/* Row 1: segment période + bascule de vue */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2.5" role="group" aria-label="Filtrer par période">
          <Link href={href({ when: 'avenir', page: 1 })} aria-pressed={when === 'avenir'} className={seg(when === 'avenir')}>
            À venir
          </Link>
          <Link href={href({ when: 'passes', page: 1 })} aria-pressed={when === 'passes'} className={seg(when === 'passes')}>
            Passés
          </Link>
        </div>

        <div className="flex flex-wrap gap-2.5" role="group" aria-label="Choisir la vue">
          <Link
            href={href({ view: 'liste' })}
            aria-pressed={view === 'liste'}
            className={`inline-flex items-center gap-2 ${seg(view === 'liste')}`}
          >
            <Icon name="list" size={16} /> Liste
          </Link>
          <Link
            href={href({ view: 'calendrier' })}
            aria-pressed={view === 'calendrier'}
            className={`inline-flex items-center gap-2 ${seg(view === 'calendrier')}`}
          >
            <Icon name="calendar" size={16} /> Calendrier
          </Link>
        </div>
      </div>

      {/* Row 2: recherche (GET form preserves when/cat/period/view, resets page) */}
      <form method="get" action={basePath} role="search" className="flex max-w-2xl gap-3">
        <label htmlFor="agenda-q" className="sr-only">
          Rechercher un événement
        </label>
        {when !== 'avenir' ? <input type="hidden" name="when" value={when} /> : null}
        {cat ? <input type="hidden" name="cat" value={cat} /> : null}
        {period ? <input type="hidden" name="period" value={period} /> : null}
        {view !== 'liste' ? <input type="hidden" name="view" value={view} /> : null}
        <input
          id="agenda-q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Rechercher un événement…"
          className="bg-surface-page border-border-main text-text-primary placeholder:text-text-muted focus:border-brand-primary min-w-0 flex-1 rounded-md border px-4 py-3 text-base outline-none transition-colors"
        />
        <button
          type="submit"
          className="bg-brand-primary text-text-inverse hover:bg-brand-primary-mid inline-flex items-center gap-2 rounded-md px-6 py-3 text-base font-semibold transition-colors"
        >
          <Icon name="search" size={18} />
          <span className="hidden sm:inline">Rechercher</span>
        </button>
      </form>

      {/* Row 3: filtres catégorie */}
      <div className="flex flex-wrap gap-2.5" role="group" aria-label="Filtrer par catégorie">
        {([''] as string[]).concat(categories).map((c) => {
          const active = c === cat
          const label = c === '' ? 'Toutes' : CATEGORY_LABELS[c as Category]
          return (
            <Link
              key={c || 'all'}
              href={href({ cat: c || undefined, page: 1 })}
              aria-pressed={active}
              className={chip(active)}
            >
              {label}
            </Link>
          )
        })}
      </div>

      {/* Row 4: période fine — Tout / Ce mois + sélecteur de mois */}
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="text-text-muted inline-flex items-center gap-1.5 text-sm font-semibold">
          <Icon name="sliders-horizontal" size={15} /> Période :
        </span>
        <Link href={href({ period: undefined, page: 1 })} aria-pressed={period === ''} className={chip(period === '')}>
          Tout
        </Link>
        <Link href={href({ period: 'mois', page: 1 })} aria-pressed={period === 'mois'} className={chip(period === 'mois')}>
          Ce mois-ci
        </Link>

        <form method="get" action={basePath} className="inline-flex items-center gap-2">
          {when !== 'avenir' ? <input type="hidden" name="when" value={when} /> : null}
          {cat ? <input type="hidden" name="cat" value={cat} /> : null}
          {q ? <input type="hidden" name="q" value={q} /> : null}
          {view !== 'liste' ? <input type="hidden" name="view" value={view} /> : null}
          <label htmlFor="agenda-month" className="sr-only">
            Choisir un mois précis
          </label>
          <select
            id="agenda-month"
            name="period"
            defaultValue={periodMonth}
            className="bg-surface-page border-border-main text-text-primary focus:border-brand-primary rounded-md border px-3 py-2 text-sm outline-none transition-colors"
          >
            <option value="">Mois précis…</option>
            {months.map((m) => (
              <option key={m.key} value={m.key}>
                {m.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="border-border-main text-brand-primary hover:border-brand-primary rounded-md border px-3 py-2 text-sm font-semibold transition-colors"
          >
            Aller
          </button>
        </form>
      </div>
    </div>
  )
}
