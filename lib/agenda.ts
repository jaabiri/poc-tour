import type { Evenement, Media, Rubrique } from '@/payload-types'

/**
 * Agenda domain helpers — date/category/href formatting shared across the
 * agenda gabarit (listing template, event card, month groups, calendar).
 *
 * Pure, framework-agnostic functions: keeping them here means the template and
 * its sub-components agree on labels and URLs, and the wiring maps cleanly onto
 * the CMS later (CLAUDE.md data-flow + component-first rules).
 */

export type Category = NonNullable<Evenement['category']>
export type When = 'avenir' | 'passes'
export type AgendaView = 'liste' | 'calendrier'

/** Canonical order + French labels of the event categories (mirrors the CMS). */
export const CATEGORY_LABELS: Record<Category, string> = {
  culture: 'Culture',
  sport: 'Sport',
  famille: 'Famille',
  environnement: 'Environnement',
  institutionnel: 'Institutionnel',
  conference: 'Conférence / Réunion',
  atelier: 'Atelier',
  autre: 'Autre',
}

export const CATEGORY_ORDER = Object.keys(CATEGORY_LABELS) as Category[]

/** Front-office path of a rubrique relation, from its breadcrumbs / slug. */
export const rubriqueHref = (
  r: (number | null) | Rubrique | undefined,
): string => {
  if (!r || typeof r !== 'object') return '#'
  const crumbs = r.breadcrumbs ?? []
  if (crumbs.length > 0 && crumbs[crumbs.length - 1]?.url) {
    const url = crumbs[crumbs.length - 1]!.url as string
    return url.startsWith('/') ? url : `/${url}`
  }
  return r.slug ? `/${r.slug}` : '#'
}

/** Front-office href of an event = its primary rubrique path + '/' + slug. */
export const evenementHref = (e: Evenement): string =>
  rubriqueHref(e.rubriques?.[0]) + `/${e.slug ?? e.id}`

/** Pull a usable URL + alt off a populated (or unpopulated) media relation. */
export const mediaSrc = (
  m: (number | null) | Media | undefined,
): { url: string; alt: string } | null => {
  if (!m || typeof m !== 'object') return null
  if (!m.url) return null
  return { url: m.url, alt: m.alt ?? '' }
}

/** Day/month parts for a date chip, e.g. `{ day: '21', month: 'JUIN' }`. */
export const eventDateParts = (iso: string): { day: string; month: string } => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return { day: '', month: '' }
  return {
    day: String(d.getDate()).padStart(2, '0'),
    month: d.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase(),
  }
}

/** Long French date, e.g. « samedi 12 juin 2026 ». */
export const formatLongDate = (iso: string | null | undefined): string => {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** French time of day, e.g. « 14h30 » / « 9h00 ». */
export const formatTime = (iso: string | null | undefined): string => {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d
    .toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    .replace(':', 'h')
}

/** Readable date sentence spanning start → optional end. */
export const formatDateRange = (
  start: string,
  end?: string | null,
): string => {
  const startDay = formatLongDate(start)
  if (!end) return startDay
  const endDay = formatLongDate(end)
  return startDay === endDay ? startDay : `Du ${startDay} au ${endDay}`
}

/** Readable hours sentence spanning start → optional end (same-day only). */
export const formatTimeRange = (
  start: string,
  end?: string | null,
): string => {
  const startTime = formatTime(start)
  if (!end) return startTime
  const sameDay = formatLongDate(start) === formatLongDate(end)
  const endTime = formatTime(end)
  return sameDay ? `${startTime} – ${endTime}` : startTime
}

/** Month-group key + label, e.g. `{ key: '2026-06', label: 'Juin 2026' }`. */
export const monthGroup = (iso: string): { key: string; label: string } => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return { key: 'inconnu', label: 'Date à préciser' }
  const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  const raw = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  return { key, label: raw.charAt(0).toUpperCase() + raw.slice(1) }
}

/** Agenda filter state encoded in the URL search params. */
export interface AgendaFilters {
  cat?: string
  q?: string
  when?: When
  /** '' (à venir) · 'mois' (mois courant) · 'YYYY-MM' (mois précis). */
  period?: string
  view?: AgendaView
  page?: number
}

/**
 * Build a query string from a filter state, omitting defaults (when=avenir,
 * view=liste, page≤1, empty values) so canonical URLs stay clean & shareable.
 */
export const buildAgendaQuery = (s: AgendaFilters): string => {
  const sp = new URLSearchParams()
  if (s.cat) sp.set('cat', s.cat)
  if (s.q) sp.set('q', s.q)
  if (s.when && s.when !== 'avenir') sp.set('when', s.when)
  if (s.period) sp.set('period', s.period)
  if (s.view && s.view !== 'liste') sp.set('view', s.view)
  if (s.page && s.page > 1) sp.set('page', String(s.page))
  const str = sp.toString()
  return str ? `?${str}` : ''
}

/** `YYYY-MM` key for a Date. */
export const ymKey = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`

/** Capitalised « Juin 2026 » label for a `YYYY-MM` key (or a Date). */
export const ymLabel = (ym: string): string => {
  const [y, m] = ym.split('-').map(Number)
  if (!y || !m) return ''
  const raw = new Date(y, m - 1, 1).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  })
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

/** First/last instant of a `YYYY-MM` month (ISO), for a date-range WHERE. */
export const monthRange = (ym: string): { start: string; end: string } | null => {
  const [y, m] = ym.split('-').map(Number)
  if (!y || !m) return null
  const start = new Date(y, m - 1, 1, 0, 0, 0, 0)
  const end = new Date(y, m, 0, 23, 59, 59, 999)
  return { start: start.toISOString(), end: end.toISOString() }
}

/** The N upcoming months from `from` as `{ key, label }` (for the selector). */
export const upcomingMonths = (
  from: Date,
  count: number,
): { key: string; label: string }[] =>
  Array.from({ length: count }, (_, i) => {
    const d = new Date(from.getFullYear(), from.getMonth() + i, 1)
    const key = ymKey(d)
    return { key, label: ymLabel(key) }
  })

/** Calendar weeks (Mon→Sun) covering a `YYYY-MM`, as a grid of day numbers. */
export const calendarWeeks = (ym: string): (number | null)[][] => {
  const [y, m] = ym.split('-').map(Number)
  if (!y || !m) return []
  const first = new Date(y, m - 1, 1)
  const daysInMonth = new Date(y, m, 0).getDate()
  // JS: 0=Sun…6=Sat → shift so Monday=0.
  const lead = (first.getDay() + 6) % 7
  const cells: (number | null)[] = Array.from({ length: lead }, () => null)
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  const weeks: (number | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

/** Group events into ordered month buckets, preserving the input order. */
export const groupByMonth = (
  events: Evenement[],
): { key: string; label: string; items: Evenement[] }[] => {
  const groups: { key: string; label: string; items: Evenement[] }[] = []
  const index = new Map<string, number>()
  for (const e of events) {
    const { key, label } = monthGroup(e.startDate)
    let pos = index.get(key)
    if (pos === undefined) {
      pos = groups.length
      index.set(key, pos)
      groups.push({ key, label, items: [] })
    }
    groups[pos].items.push(e)
  }
  return groups
}
