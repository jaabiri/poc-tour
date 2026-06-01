import Image from 'next/image'
import Link from 'next/link'
import type { Where } from 'payload'

import { Container, SectionLabel, Tag, Icon, CornerSeal } from '@/components/ui'
import { EventCard } from '@/components/sections/agenda/EventCard'
import { AgendaToolbar } from '@/components/sections/agenda/AgendaToolbar'
import { AgendaCalendar } from '@/components/sections/agenda/AgendaCalendar'
import { AddToCalendar } from '@/components/sections/agenda/AddToCalendar'
import { getPayloadClient } from '@/lib/payload'
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  buildAgendaQuery,
  evenementHref,
  eventDateParts,
  formatDateRange,
  formatTimeRange,
  groupByMonth,
  mediaSrc,
  monthRange,
  rubriqueHref,
  upcomingMonths,
  ymKey,
  type AgendaView,
  type Category,
  type When,
} from '@/lib/agenda'

import type { Evenement, Rubrique } from '@/payload-types'

/**
 * AgendaListingTemplate — gabarit « Agenda (listing des événements) » (T8),
 * jumeau symétrique d'ActualiteListingTemplate pour la collection `evenement`.
 *
 * Sections (chacune conditionnelle) :
 *   (a) En-tête — titre Fraunces + chapô (seo.metaDescription)
 *   (b) À la une — prochain événement `featured`, carte VISUELLE (image, grande
 *       date, catégorie, lieu, heure, CTA + .ics) — vue par défaut uniquement
 *   (c) Tous les rendez-vous — barre de filtres (segment À venir/Passés +
 *       recherche + catégories + période + bascule Liste/Calendrier) + compteur,
 *       puis SOIT la liste groupée par mois + pagination, SOIT la vue calendrier
 *       (grille mensuelle complète + liste du mois).
 *
 * La newsletter (« Restez informés ») n'est PAS rendue ici : elle est fournie
 * une seule fois par le SiteFooter global (layout), pour éviter le doublon.
 *
 * Filtres/recherche/pagination/vue entièrement pilotés par les `searchParams`
 * (`?cat=&q=&when=&period=&view=&page=`) : la page reste un Server Component,
 * partageable et RGAA sans aucun JS client (liens + formulaires GET, CLAUDE.md
 * §3). Tokens sémantiques uniquement (CLAUDE.md §1/§2).
 */

const PAGE_SIZE = 12

/** Detect the « Agenda » index rubrique (used by the dispatcher). */
export const isAgendaIndex = (rubrique: Rubrique): boolean => {
  const path = rubriqueHref(rubrique).replace(/^\//, '')
  return (
    path.endsWith('actualites/agenda') ||
    path.endsWith('/agenda') ||
    rubrique.slug === 'agenda' ||
    rubrique.slug === 'agenda-a-la-une'
  )
}

/** Read the first value of a (possibly repeated) search param. */
const firstParam = (v: string | string[] | undefined): string =>
  (Array.isArray(v) ? v[0] : v)?.trim() ?? ''

type SearchParams = {
  cat?: string | string[]
  q?: string | string[]
  when?: string | string[]
  period?: string | string[]
  view?: string | string[]
  page?: string | string[]
}

/** Section heading shared with the other listing gabarits. */
function ListingHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-brand-primary-dark mb-2 mt-2.5 text-3xl font-bold leading-tight">
      {children}
    </h2>
  )
}

/* ── (b) À la une — carte visuelle ─────────────────────────────────────────── */
function FeaturedEvenement({ item }: { item: Evenement }) {
  const img = mediaSrc(item.image)
  const { day, month } = eventDateParts(item.startDate)
  const dateRange = formatDateRange(item.startDate, item.endDate)
  const timeRange = formatTimeRange(item.startDate, item.endDate)
  const categoryLabel = item.category ? CATEGORY_LABELS[item.category] : null

  return (
    <Container className="pt-4">
      <SectionLabel>À la une</SectionLabel>
      <div className="group bg-surface-main border-border-main hover:shadow-card-hover ease-brand relative mt-5 grid overflow-hidden rounded-2xl border transition-all md:grid-cols-2">
        <CornerSeal />

        {/* Visuel + grande date superposée */}
        <div className="relative min-h-[240px] overflow-hidden md:min-h-[360px]">
          {img ? (
            <Image
              src={img.url}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <span aria-hidden="true" className="bg-surface-brand absolute inset-0" />
          )}
          <span
            aria-hidden="true"
            className="bg-brand-primary-dark text-text-inverse absolute left-5 top-5 flex w-20 flex-col items-center rounded-lg py-3 text-center shadow-card-sm"
          >
            <span className="font-display text-3xl font-black leading-none">{day}</span>
            <span className="text-text-on-brand mt-1 text-xs font-semibold tracking-wide">
              {month}
            </span>
          </span>
        </div>

        {/* Contenu */}
        <div className="flex flex-col justify-center gap-3 p-8 md:p-10">
          {categoryLabel ? <Tag>{categoryLabel}</Tag> : null}
          <h3 className="font-display text-brand-primary-dark text-2xl font-bold leading-tight md:text-[28px]">
            <Link
              href={evenementHref(item)}
              className="no-underline after:absolute after:inset-0 after:content-['']"
            >
              {item.title}
            </Link>
          </h3>

          <ul className="text-text-muted mt-1 flex flex-col gap-1.5 text-sm">
            <li className="flex items-center gap-2">
              <Icon name="calendar" size={16} /> {dateRange}
            </li>
            {timeRange ? (
              <li className="flex items-center gap-2">
                <Icon name="clock" size={16} /> {timeRange}
              </li>
            ) : null}
            {item.location ? (
              <li className="flex items-center gap-2">
                <Icon name="map-pin" size={16} /> {item.location}
              </li>
            ) : null}
          </ul>

          {item.excerpt ? (
            <p className="text-text-primary mt-1 leading-relaxed">{item.excerpt}</p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="bg-action text-text-inverse inline-flex items-center gap-2 rounded-md px-5 py-3 text-sm font-semibold transition-transform group-hover:translate-x-0.5">
              Voir l&apos;événement
              <Icon name="arrow-up-right" size={16} />
            </span>
            <AddToCalendar event={item} tone="ghost" />
          </div>
        </div>
      </div>
    </Container>
  )
}

/* ── (c) Pagination ──────────────────────────────────────────────────────── */
function Pagination({
  basePath,
  page,
  totalPages,
  state,
}: {
  basePath: string
  page: number
  totalPages: number
  state: { cat: string; q: string; when: When; period: string }
}) {
  if (totalPages <= 1) return null
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const href = (p: number) => `${basePath}${buildAgendaQuery({ ...state, page: p })}`
  const edge =
    'inline-flex h-10 min-w-10 items-center justify-center rounded-md px-3 text-sm font-semibold no-underline'

  return (
    <nav
      aria-label="Pagination de l’agenda"
      className="mt-10 flex items-center justify-center gap-1.5"
    >
      {page > 1 ? (
        <Link href={href(page - 1)} rel="prev" aria-label="Page précédente" className={`${edge} bg-surface-main border-border-main text-text-primary hover:border-brand-primary border transition-colors`}>
          <Icon name="arrow-right" size={16} className="rotate-180" />
        </Link>
      ) : (
        <span aria-disabled="true" className={`${edge} text-icon-muted border-border-main border opacity-50`}>
          <Icon name="arrow-right" size={16} className="rotate-180" />
        </span>
      )}

      {pages.map((p) =>
        p === page ? (
          <span key={p} aria-current="page" className={`${edge} bg-surface-brand text-text-inverse`}>
            {p}
          </span>
        ) : (
          <Link key={p} href={href(p)} aria-label={`Page ${p}`} className={`${edge} bg-surface-main border-border-main text-text-primary hover:border-brand-primary border transition-colors`}>
            {p}
          </Link>
        ),
      )}

      {page < totalPages ? (
        <Link href={href(page + 1)} rel="next" aria-label="Page suivante" className={`${edge} bg-surface-main border-border-main text-text-primary hover:border-brand-primary border transition-colors`}>
          <Icon name="arrow-right" size={16} />
        </Link>
      ) : (
        <span aria-disabled="true" className={`${edge} text-icon-muted border-border-main border opacity-50`}>
          <Icon name="arrow-right" size={16} />
        </span>
      )}
    </nav>
  )
}

/* ── État vide soigné ──────────────────────────────────────────────────────── */
function EmptyState({ resetHref, hasFilters }: { resetHref: string; hasFilters: boolean }) {
  return (
    <div className="border-border-main bg-surface-main mt-6 rounded-card border border-dashed p-12 text-center">
      <span
        aria-hidden="true"
        className="bg-surface-page text-brand-primary mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full"
      >
        <Icon name="calendar" size={26} />
      </span>
      <p className="text-brand-primary-dark font-display text-xl font-bold">
        Aucun événement sur cette période
      </p>
      <p className="text-text-muted mt-2">
        Essayez d’élargir votre recherche, de changer de période ou de retirer un filtre.
      </p>
      {hasFilters ? (
        <Link
          href={resetHref}
          className="bg-brand-primary text-text-inverse hover:bg-brand-primary-mid mt-5 inline-flex items-center gap-2 rounded-md px-5 py-3 text-sm font-semibold no-underline transition-colors"
        >
          <Icon name="arrow-left" size={16} />
          Réinitialiser les filtres
        </Link>
      ) : null}
    </div>
  )
}

export async function AgendaListingTemplate({
  rubrique,
  searchParams,
}: {
  rubrique: Rubrique
  searchParams?: SearchParams
}) {
  const cat = firstParam(searchParams?.cat)
  const q = firstParam(searchParams?.q)
  const when: When = firstParam(searchParams?.when) === 'passes' ? 'passes' : 'avenir'
  const period = firstParam(searchParams?.period)
  const view: AgendaView = firstParam(searchParams?.view) === 'calendrier' ? 'calendrier' : 'liste'
  const requestedPage = Number.parseInt(firstParam(searchParams?.page), 10)
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1

  const basePath = rubriqueHref(rubrique)
  const isLanding =
    view === 'liste' && page === 1 && !cat && !q && when === 'avenir' && !period

  const payload = await getPayloadClient()
  const now = new Date()
  const nowIso = now.toISOString()

  // Shared category + featured queries (independent of the chosen view).
  const [catRes, featuredRes] = await Promise.all([
    payload.find({
      collection: 'evenement',
      draft: false,
      depth: 0,
      pagination: false,
      select: { category: true },
    }),
    isLanding
      ? payload.find({
          collection: 'evenement',
          where: { and: [{ featured: { equals: true } }, { startDate: { greater_than_equal: nowIso } }] },
          sort: 'startDate',
          limit: 1,
          draft: false,
          depth: 2,
        })
      : Promise.resolve({ docs: [] as Evenement[] }),
  ])

  const catSet = new Set(
    (catRes.docs as Evenement[]).map((e) => e.category).filter((c): c is Category => !!c),
  )
  const categories = CATEGORY_ORDER.filter((c) => catSet.has(c))
  const months = upcomingMonths(now, 9)
  const featured = (featuredRes.docs[0] as Evenement | undefined) ?? null

  // Category / search predicates reused by both views.
  const catFilter: Where[] = []
  if (cat) catFilter.push({ category: { equals: cat } })
  if (q) catFilter.push({ or: [{ title: { like: q } }, { location: { like: q } }, { excerpt: { like: q } }] })

  const chapo = rubrique.seo?.metaDescription
  const toolbarState = { cat, q, when, period, view }

  return (
    <>
      {/* (a) En-tête */}
      <Container className="pb-2 pt-6">
        <SectionLabel>Agenda</SectionLabel>
        <h1 className="font-display text-brand-primary-dark mt-2.5 text-4xl font-black leading-tight md:text-5xl">
          {rubrique.title}
        </h1>
        {chapo ? (
          <p className="text-text-primary mt-4 max-w-3xl text-lg leading-relaxed">{chapo}</p>
        ) : null}
      </Container>

      {/* (b) À la une — prochain événement mis en avant (vue par défaut) */}
      {featured ? <FeaturedEvenement item={featured} /> : null}

      {/* (c) Tous les rendez-vous */}
      <Container className="py-6">
        <SectionLabel>Tous les rendez-vous</SectionLabel>
        <ListingHeading>Parcourir l’agenda</ListingHeading>

        <AgendaToolbar
          basePath={basePath}
          categories={categories}
          months={months}
          when={when}
          cat={cat}
          q={q}
          period={period}
          view={view}
        />

        {view === 'calendrier' ? (
          <CalendarView basePath={basePath} nowYm={ymKey(now)} period={period} catFilter={catFilter} toolbarState={toolbarState} />
        ) : (
          <ListView basePath={basePath} nowIso={nowIso} when={when} period={period} cat={cat} q={q} page={page} catFilter={catFilter} />
        )}
      </Container>
    </>
  )
}

/* ── Vue LISTE (groupée par mois + pagination) ─────────────────────────────── */
async function ListView({
  basePath,
  nowIso,
  when,
  period,
  cat,
  q,
  page,
  catFilter,
}: {
  basePath: string
  nowIso: string
  when: When
  period: string
  cat: string
  q: string
  page: number
  catFilter: Where[]
}) {
  const payload = await getPayloadClient()

  // Période : par défaut À venir / Passés ; affinée par `period` (mois courant
  // ou mois précis), qui prime alors sur le seuil "maintenant".
  const filters: Where[] = [...catFilter]
  const range = period === 'mois' ? null : monthRange(period)
  if (period === 'mois') {
    const now = new Date()
    const r = monthRange(ymKey(now))!
    filters.push({ startDate: { greater_than_equal: r.start } }, { startDate: { less_than_equal: r.end } })
  } else if (range) {
    filters.push({ startDate: { greater_than_equal: range.start } }, { startDate: { less_than_equal: range.end } })
  } else {
    filters.push(
      when === 'passes'
        ? { startDate: { less_than: nowIso } }
        : { startDate: { greater_than_equal: nowIso } },
    )
  }

  const sort = when === 'passes' ? '-startDate' : 'startDate'
  const res = await payload.find({
    collection: 'evenement',
    where: { and: filters },
    sort,
    limit: PAGE_SIZE,
    page,
    draft: false,
    depth: 2,
  })

  const evenements = res.docs as Evenement[]
  const totalDocs = res.totalDocs
  const totalPages = res.totalPages
  const groups = groupByMonth(evenements)
  const noun = when === 'passes' ? 'événement passé' : 'événement à venir'
  const hasFilters = Boolean(cat || q || period)

  return (
    <>
      <ResultCount count={totalDocs} noun={noun} cat={cat} q={q} />

      {evenements.length > 0 ? (
        <div className="mt-6 flex flex-col gap-10">
          {groups.map((g) => (
            <section key={g.key} aria-labelledby={`grp-${g.key}`}>
              <h3
                id={`grp-${g.key}`}
                className="font-display text-brand-primary-dark border-border-main mb-4 flex items-center gap-3 border-b pb-2 text-xl font-bold"
              >
                <span aria-hidden="true" className="bg-action inline-block h-4 w-1 rounded" />
                {g.label}
                <span className="text-text-muted text-sm font-normal">
                  · {g.items.length} événement{g.items.length > 1 ? 's' : ''}
                </span>
              </h3>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,22rem),1fr))] gap-4">
                {g.items.map((e) => (
                  <EventCard key={e.id} event={e} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <EmptyState
          resetHref={`${basePath}${buildAgendaQuery({ when })}`}
          hasFilters={hasFilters}
        />
      )}

      <Pagination
        basePath={basePath}
        page={page}
        totalPages={totalPages}
        state={{ cat, q, when, period }}
      />
    </>
  )
}

/* ── Vue CALENDRIER (grille mensuelle complète + liste du mois) ─────────────── */
async function CalendarView({
  basePath,
  nowYm,
  period,
  catFilter,
  toolbarState,
}: {
  basePath: string
  nowYm: string
  period: string
  catFilter: Where[]
  toolbarState: { cat: string; q: string; when: When; period: string; view: AgendaView }
}) {
  const payload = await getPayloadClient()

  // Mois affiché : `period` s'il désigne un mois précis, sinon le mois courant.
  const ym = /^\d{4}-\d{2}$/.test(period) ? period : nowYm
  const range = monthRange(ym)!

  const res = await payload.find({
    collection: 'evenement',
    where: { and: [...catFilter, { startDate: { greater_than_equal: range.start } }, { startDate: { less_than_equal: range.end } }] },
    sort: 'startDate',
    limit: 0,
    pagination: false,
    draft: false,
    depth: 2,
  })
  const events = res.docs as Evenement[]

  const [y, m] = ym.split('-').map(Number)
  const prevYm = ymKey(new Date(y, m - 2, 1))
  const nextYm = ymKey(new Date(y, m, 1))
  const navHref = (p: string) =>
    `${basePath}${buildAgendaQuery({ ...toolbarState, view: 'calendrier', period: p })}`
  const hasFilters = Boolean(toolbarState.cat || toolbarState.q)

  return (
    <>
      <ResultCount count={events.length} noun="événement ce mois-ci" cat={toolbarState.cat} q={toolbarState.q} />

      <AgendaCalendar ym={ym} events={events} prevHref={navHref(prevYm)} nextHref={navHref(nextYm)} />

      {events.length > 0 ? (
        <div className="mt-8">
          <h3 className="font-display text-brand-primary-dark mb-4 text-xl font-bold">
            Détail des événements
          </h3>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,22rem),1fr))] gap-4">
            {events.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          resetHref={`${basePath}${buildAgendaQuery({ view: 'calendrier' })}`}
          hasFilters={hasFilters}
        />
      )}
    </>
  )
}

/* ── Compteur de résultats (visible + aria-live) ───────────────────────────── */
function ResultCount({
  count,
  noun,
  cat,
  q,
}: {
  count: number
  noun: string
  cat: string
  q: string
}) {
  return (
    <p className="mt-6 flex flex-wrap items-baseline gap-2" role="status" aria-live="polite">
      <span className="text-brand-primary-dark text-2xl font-black">{count}</span>
      <span className="text-text-primary font-semibold">
        {noun}
        {count > 1 ? 's' : ''}
      </span>
      {cat ? (
        <span className="text-text-muted text-sm">— catégorie « {CATEGORY_LABELS[cat as Category]} »</span>
      ) : null}
      {q ? <span className="text-text-muted text-sm">— recherche « {q} »</span> : null}
    </p>
  )
}

export default AgendaListingTemplate
