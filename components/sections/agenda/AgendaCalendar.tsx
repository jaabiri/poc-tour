import Link from 'next/link'

import { Icon } from '@/components/ui'
import {
  calendarWeeks,
  evenementHref,
  formatTime,
  ymLabel,
} from '@/lib/agenda'
import type { Evenement } from '@/payload-types'

/**
 * AgendaCalendar — a full monthly grid (T8 « vue calendrier »). Rendered as an
 * accessible <table> (caption + column headers) so screen-reader users get the
 * day/weekday relationship; each active day lists its events as focusable links.
 * Pure RSC, no client JS — month navigation is plain links.
 *
 * Charte: weekend columns get a subtle canvas tint, days carrying events show a
 * coral day-number badge, and event pills are brand-blue with a hover state.
 * `events` are the events whose startDate falls in `ym` (YYYY-MM); the template
 * does the querying and passes the prev/next month hrefs.
 */

const WEEKDAYS = [
  { short: 'Lun', long: 'Lundi' },
  { short: 'Mar', long: 'Mardi' },
  { short: 'Mer', long: 'Mercredi' },
  { short: 'Jeu', long: 'Jeudi' },
  { short: 'Ven', long: 'Vendredi' },
  { short: 'Sam', long: 'Samedi' },
  { short: 'Dim', long: 'Dimanche' },
]

const MAX_PILLS = 3

export function AgendaCalendar({
  ym,
  events,
  prevHref,
  nextHref,
}: {
  ym: string
  events: Evenement[]
  prevHref: string
  nextHref: string
}) {
  const label = ymLabel(ym)
  const weeks = calendarWeeks(ym)

  // Bucket events by day-of-month for O(1) cell lookups.
  const byDay = new Map<number, Evenement[]>()
  for (const e of events) {
    const d = new Date(e.startDate)
    if (Number.isNaN(d.getTime())) continue
    const day = d.getDate()
    const arr = byDay.get(day) ?? []
    arr.push(e)
    byDay.set(day, arr)
  }

  return (
    <div className="bg-surface-main border-border-main mt-6 overflow-hidden rounded-card border shadow-card-sm">
      {/* Month navigation */}
      <div className="from-brand-primary to-brand-primary-dark flex items-center justify-between gap-4 bg-gradient-to-r p-4">
        <Link
          href={prevHref}
          rel="prev"
          aria-label="Mois précédent"
          className="text-text-inverse hover:bg-surface-main/15 inline-flex h-10 w-10 items-center justify-center rounded-md transition-colors"
        >
          <Icon name="arrow-left" size={18} />
        </Link>
        <h3 className="font-display text-text-inverse text-xl font-bold">{label}</h3>
        <Link
          href={nextHref}
          rel="next"
          aria-label="Mois suivant"
          className="text-text-inverse hover:bg-surface-main/15 inline-flex h-10 w-10 items-center justify-center rounded-md transition-colors"
        >
          <Icon name="arrow-right" size={18} />
        </Link>
      </div>

      <table className="w-full table-fixed border-collapse">
        <caption className="sr-only">Calendrier des événements — {label}</caption>
        <thead>
          <tr>
            {WEEKDAYS.map((w, i) => (
              <th
                key={w.long}
                scope="col"
                className={`border-border-main text-text-muted border-b p-2.5 text-center text-xs font-bold uppercase tracking-wide ${
                  i >= 5 ? 'bg-surface-page' : ''
                }`}
              >
                <span aria-hidden="true">{w.short}</span>
                <span className="sr-only">{w.long}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, wi) => (
            <tr key={wi}>
              {week.map((day, di) => {
                const weekend = di >= 5
                if (day === null) {
                  return (
                    <td
                      key={di}
                      className={`border-border-main h-28 border-b border-r align-top last:border-r-0 md:h-32 ${
                        weekend ? 'bg-surface-page/60' : ''
                      }`}
                    />
                  )
                }
                const dayEvents = byDay.get(day) ?? []
                const hasEvents = dayEvents.length > 0
                const extra = dayEvents.length - MAX_PILLS
                return (
                  <td
                    key={di}
                    className={`border-border-main h-28 border-b border-r p-1.5 align-top transition-colors last:border-r-0 md:h-32 ${
                      weekend ? 'bg-surface-page/60' : ''
                    } ${hasEvents ? 'hover:bg-surface-page' : ''}`}
                  >
                    <div className="mb-1 flex justify-end">
                      <span
                        className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-xs font-bold ${
                          hasEvents
                            ? 'bg-action text-text-inverse'
                            : 'text-text-muted'
                        }`}
                      >
                        {day}
                      </span>
                    </div>
                    <ul className="flex flex-col gap-1">
                      {dayEvents.slice(0, MAX_PILLS).map((e) => (
                        <li key={e.id}>
                          <Link
                            href={evenementHref(e)}
                            className="bg-brand-primary text-text-inverse hover:bg-brand-primary-mid block truncate rounded px-1.5 py-1 text-[0.7rem] font-semibold leading-tight no-underline transition-colors"
                            title={`${formatTime(e.startDate)} — ${e.title}`}
                          >
                            <span className="text-text-on-brand hidden font-bold sm:inline">
                              {formatTime(e.startDate)}{' '}
                            </span>
                            {e.title}
                          </Link>
                        </li>
                      ))}
                      {extra > 0 ? (
                        <li className="text-action px-1.5 text-[0.7rem] font-bold">
                          +{extra} autre{extra > 1 ? 's' : ''}
                        </li>
                      ) : null}
                    </ul>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
