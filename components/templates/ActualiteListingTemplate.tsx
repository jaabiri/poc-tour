import Image from 'next/image'
import Link from 'next/link'
import type { Where } from 'payload'

import { Container, SectionLabel, Tag, Icon, ArrowLink, CornerSeal } from '@/components/ui'
import { NewsCard } from '@/components/sections/news/NewsCard'
import { AgendaCard } from '@/components/sections/agenda/AgendaCard'
import { Newsletter } from '@/components/sections/newsletter'
import { getPayloadClient } from '@/lib/payload'

import type { Actualite, Evenement, Media, Rubrique } from '@/payload-types'

/**
 * ActualiteListingTemplate — gabarit T3 « Page actualités (listing) ».
 *
 * The dedicated index for the « Actualités › Toutes les actus » rubrique. The
 * dispatcher (`app/(frontend)/[...slug]`) detects that rubrique via
 * `isActualiteIndex` and renders this instead of the generic
 * RubriqueListingTemplate, threading the page's `searchParams` through.
 *
 * Returns ONLY the page's MAIN CONTENT: the filet, breadcrumb and
 * Topbar/SiteHeader/SiteFooter chrome are supplied by the route + layout, per
 * the template contract shared with the other gabarits.
 *
 * Sections (each conditional on its data):
 *   (a) En-tête — titre Fraunces + chapô (from seo.metaDescription)
 *   (b) À la une — la dernière actualité `featured` (page 1 non filtrée only)
 *   (c) Bandeau Magazine / kiosque — promo « Touraine le Mag » (idem)
 *   (d) Toutes nos actualités — recherche + filtres thématiques + compteur
 *       « X à Y sur Z », grille NewsCard, pagination
 *   (e) Agenda — prochains événements (AgendaCard)
 *   (f) Newsletter — bande réutilisée
 *
 * Filtering/search/pagination are entirely URL-driven (`?theme=&q=&page=`), so
 * the page stays a Server Component, is shareable, and is RGAA-accessible with
 * no client JS (links + a GET form), per CLAUDE.md §3.
 *
 * Styling: semantic design tokens only (CLAUDE.md §1/§2). Helpers mirror
 * RubriqueListingTemplate / ActualiteDetailTemplate so the page reads as the
 * same site.
 */

const PAGE_SIZE = 9

/** Canonical order of the portal's thématiques (gabarits.md) — drives chip order. */
const THEME_ORDER = [
  'Solidarités',
  'Culture',
  'Environnement',
  'Mobilité',
  'Collèges',
  'Sport',
  'Institution',
  'Portrait',
  'Tourisme',
  'Insertion et emploi',
  'Logement',
]

/** Editorial promo for the « Touraine le Mag » kiosque (wire to the CMS later). */
const MAGAZINE = {
  kicker: 'Le magazine du Département',
  title: 'Touraine le Mag & le kiosque',
  description:
    'Reportages, grands dossiers et portraits : feuilletez le magazine du Département et retrouvez tous les numéros dans le kiosque numérique.',
  cta: 'Feuilleter le kiosque',
  href: '/actualites/touraine-le-mag-et-kiosque',
}

/** Pull a usable URL + alt off a populated (or unpopulated) media relation. */
const mediaSrc = (
  m: (number | null) | Media | undefined,
): { url: string; alt: string } | null => {
  if (!m || typeof m !== 'object') return null
  if (!m.url) return null
  return { url: m.url, alt: m.alt ?? '' }
}

/** Front-office path of a rubrique relation, from its breadcrumbs / slug. */
const rubriqueHref = (r: (number | null) | Rubrique | undefined): string => {
  if (!r || typeof r !== 'object') return '#'
  const crumbs = r.breadcrumbs ?? []
  if (crumbs.length > 0 && crumbs[crumbs.length - 1]?.url) {
    const url = crumbs[crumbs.length - 1]!.url as string
    return url.startsWith('/') ? url : `/${url}`
  }
  return r.slug ? `/${r.slug}` : '#'
}

/** Front-office href of an actualité = its primary rubrique path + '/' + slug. */
const actualiteHref = (a: Actualite): string =>
  rubriqueHref(a.rubriques?.[0]) + `/${a.slug ?? a.id}`

/** Long French date (e.g. « 12 mars 2026 »). */
const formatLongDate = (iso: string | null | undefined): string => {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

/** Day/month parts for an event chip. */
const eventDateParts = (iso: string): { day: string; month: string } => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return { day: '', month: '' }
  return {
    day: String(d.getDate()).padStart(2, '0'),
    month: d.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase(),
  }
}

/** Background for a NewsCard: the media, or a token-driven brand wash. */
const cardBackground = (a: Actualite): string => {
  const img = mediaSrc(a.image)
  return img ? `url(${img.url}) center/cover` : 'var(--color-surface-brand)'
}

/** Detect the « Toutes les actus » index rubrique (used by the dispatcher). */
export const isActualiteIndex = (rubrique: Rubrique): boolean => {
  const path = rubriqueHref(rubrique).replace(/^\//, '')
  return path.endsWith('actualites/toutes-les-actus') || rubrique.slug === 'toutes-les-actus'
}

/** Read the first value of a (possibly repeated) search param. */
const firstParam = (v: string | string[] | undefined): string =>
  (Array.isArray(v) ? v[0] : v)?.trim() ?? ''

/** Build a query string from a filter state, omitting empty values + page 1. */
const buildQuery = (state: { theme?: string; q?: string; page?: number }): string => {
  const sp = new URLSearchParams()
  if (state.theme) sp.set('theme', state.theme)
  if (state.q) sp.set('q', state.q)
  if (state.page && state.page > 1) sp.set('page', String(state.page))
  const s = sp.toString()
  return s ? `?${s}` : ''
}

type SearchParams = { theme?: string | string[]; q?: string | string[]; page?: string | string[] }

/** Section heading shared with the other listing gabarits. */
function ListingHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-brand-primary-dark mb-2 mt-2.5 text-3xl font-bold leading-tight">
      {children}
    </h2>
  )
}

/* ── (b) À la une ────────────────────────────────────────────────────────── */
function FeaturedActualite({ item }: { item: Actualite }) {
  const img = mediaSrc(item.image)
  const date = formatLongDate(item.date)
  return (
    <Container className="pt-4">
      <SectionLabel>À la une</SectionLabel>
      <Link
        href={actualiteHref(item)}
        className="group bg-surface-main border-border-main hover:shadow-card-hover relative mt-5 grid overflow-hidden rounded-2xl border no-underline transition-all md:grid-cols-2"
      >
        <CornerSeal />
        <div className="relative min-h-[240px] overflow-hidden md:min-h-[340px]">
          {img ? (
            <Image
              src={img.url}
              alt={img.alt}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <span aria-hidden="true" className="bg-surface-brand absolute inset-0" />
          )}
        </div>
        <div className="flex flex-col justify-center gap-4 p-8 md:p-10">
          <div className="flex flex-wrap items-center gap-3">
            {item.tag ? <Tag>{item.tag}</Tag> : null}
            {date ? (
              <time dateTime={item.date} className="text-text-muted text-sm font-semibold">
                {date}
              </time>
            ) : null}
          </div>
          <h3 className="font-display text-brand-primary-dark text-2xl font-bold leading-tight md:text-[28px]">
            {item.title}
          </h3>
          {item.chapo ? (
            <p className="text-text-muted leading-relaxed">{item.chapo}</p>
          ) : null}
          <ArrowLink as="span">Lire l’article</ArrowLink>
        </div>
      </Link>
    </Container>
  )
}

/* ── (c) Bandeau Magazine / kiosque ──────────────────────────────────────── */
function MagazineBand() {
  return (
    <Container className="py-12">
      <Link
        href={MAGAZINE.href}
        className="group from-brand-primary to-brand-primary-dark text-text-inverse hover:shadow-card-hover relative flex flex-col items-start gap-5 overflow-hidden rounded-2xl bg-gradient-to-br p-8 no-underline transition-all md:flex-row md:items-center md:justify-between md:p-10"
      >
        <span aria-hidden="true" className="filet-rainbow absolute inset-x-0 bottom-0" />
        <div className="flex items-start gap-5">
          <span
            aria-hidden="true"
            className="bg-surface-brand/40 text-text-inverse hidden shrink-0 rounded-xl p-3.5 sm:block"
          >
            <Icon name="book-open" size={26} />
          </span>
          <div className="max-w-xl">
            <span className="text-text-on-brand text-[12.5px] font-bold uppercase tracking-[1px]">
              {MAGAZINE.kicker}
            </span>
            <h2 className="font-display mt-1.5 text-2xl font-bold leading-tight">
              {MAGAZINE.title}
            </h2>
            <p className="text-text-on-brand mt-2 leading-relaxed">{MAGAZINE.description}</p>
          </div>
        </div>
        <span className="bg-surface-main text-brand-primary-dark inline-flex shrink-0 items-center gap-2 rounded-md px-5 py-3 text-sm font-semibold transition-transform group-hover:translate-x-1">
          {MAGAZINE.cta}
          <Icon name="arrow-up-right" size={16} />
        </span>
      </Link>
    </Container>
  )
}

/* ── (d) Toolbar: recherche + filtres thématiques ────────────────────────── */
function Toolbar({
  basePath,
  themes,
  activeTheme,
  q,
}: {
  basePath: string
  themes: string[]
  activeTheme: string
  q: string
}) {
  return (
    <div className="mt-6 flex flex-col gap-5">
      {/* Recherche — GET form: preserves the active thème, resets the page. */}
      <form method="get" action={basePath} role="search" className="flex max-w-2xl gap-3">
        <label htmlFor="actus-q" className="sr-only">
          Rechercher une actualité
        </label>
        {activeTheme ? <input type="hidden" name="theme" value={activeTheme} /> : null}
        <input
          id="actus-q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Rechercher une actualité…"
          className="bg-surface-main border-border-main text-text-primary placeholder:text-text-muted focus:border-brand-primary min-w-0 flex-1 rounded-md border px-4 py-3 text-base outline-none transition-colors"
        />
        <button
          type="submit"
          className="bg-brand-primary text-text-inverse hover:bg-brand-primary-mid inline-flex items-center gap-2 rounded-md px-6 py-3 text-base font-semibold transition-colors"
        >
          <Icon name="search" size={18} />
          <span className="hidden sm:inline">Rechercher</span>
        </button>
      </form>

      {/* Filtres thématiques — links, aria-pressed marks the active chip. */}
      <div className="flex flex-wrap gap-2.5" role="group" aria-label="Filtrer par thématique">
        {[''].concat(themes).map((t) => {
          const active = t === activeTheme
          const label = t === '' ? 'Toutes' : t
          return (
            <Link
              key={t || 'all'}
              href={`${basePath}${buildQuery({ theme: t || undefined, q: q || undefined })}`}
              aria-pressed={active}
              className={
                active
                  ? 'bg-surface-brand text-text-inverse rounded-full px-4 py-2 text-sm font-semibold no-underline'
                  : 'bg-surface-main border-border-main text-text-primary hover:border-brand-primary rounded-full border px-4 py-2 text-sm font-semibold no-underline transition-colors'
              }
            >
              {label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

/* ── (d) Pagination ──────────────────────────────────────────────────────── */
function Pagination({
  basePath,
  page,
  totalPages,
  theme,
  q,
}: {
  basePath: string
  page: number
  totalPages: number
  theme: string
  q: string
}) {
  if (totalPages <= 1) return null
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const href = (p: number) =>
    `${basePath}${buildQuery({ theme: theme || undefined, q: q || undefined, page: p })}`

  const edge =
    'inline-flex h-10 min-w-10 items-center justify-center rounded-md px-3 text-sm font-semibold no-underline'

  return (
    <nav aria-label="Pagination des actualités" className="mt-10 flex items-center justify-center gap-1.5">
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

export async function ActualiteListingTemplate({
  rubrique,
  searchParams,
}: {
  rubrique: Rubrique
  searchParams?: SearchParams
}) {
  const theme = firstParam(searchParams?.theme)
  const q = firstParam(searchParams?.q)
  const requestedPage = Number.parseInt(firstParam(searchParams?.page), 10)
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1

  const basePath = rubriqueHref(rubrique)
  const isLanding = page === 1 && !theme && !q

  const payload = await getPayloadClient()

  // WHERE for the main list: thème (exact) and/or full-text (title OR chapô).
  const filters: Where[] = []
  if (theme) filters.push({ tag: { equals: theme } })
  if (q) filters.push({ or: [{ title: { like: q } }, { chapo: { like: q } }] })
  const where: Where | undefined = filters.length ? { and: filters } : undefined

  const now = new Date().toISOString()

  const [listRes, themeRes, featuredRes, eventsRes] = await Promise.all([
    payload.find({
      collection: 'actualite',
      where,
      sort: '-date',
      limit: PAGE_SIZE,
      page,
      draft: false,
      depth: 2,
    }),
    // Distinct tags across all published actualités → drive the filter chips.
    payload.find({
      collection: 'actualite',
      draft: false,
      depth: 0,
      pagination: false,
      select: { tag: true },
    }),
    payload.find({
      collection: 'actualite',
      where: { featured: { equals: true } },
      sort: '-date',
      limit: 1,
      draft: false,
      depth: 2,
    }),
    payload.find({
      collection: 'evenement',
      where: { startDate: { greater_than_equal: now } },
      sort: 'startDate',
      limit: 4,
      draft: false,
      depth: 2,
    }),
  ])

  const actualites = listRes.docs as Actualite[]
  const totalDocs = listRes.totalDocs
  const totalPages = listRes.totalPages
  const events = eventsRes.docs as Evenement[]
  const featured = isLanding ? ((featuredRes.docs[0] as Actualite | undefined) ?? null) : null

  // Filter chips, ordered by the canonical thématiques (unknowns appended).
  const tagSet = new Set(
    (themeRes.docs as Actualite[]).map((a) => a.tag).filter((t): t is string => !!t),
  )
  const themes = [
    ...THEME_ORDER.filter((t) => tagSet.has(t)),
    ...[...tagSet].filter((t) => !THEME_ORDER.includes(t)).sort((a, b) => a.localeCompare(b)),
  ]

  const rangeStart = totalDocs === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(page * PAGE_SIZE, totalDocs)
  const chapo = rubrique.seo?.metaDescription

  return (
    <>
      {/* (a) En-tête */}
      <Container className="pb-2 pt-6">
        <SectionLabel>Actualités</SectionLabel>
        <h1 className="font-display text-brand-primary-dark mt-2.5 text-4xl font-black leading-tight md:text-5xl">
          {rubrique.title}
        </h1>
        {chapo ? (
          <p className="text-text-primary mt-4 max-w-3xl text-lg leading-relaxed">{chapo}</p>
        ) : null}
      </Container>

      {/* (b) À la une — page 1, non filtrée */}
      {featured ? <FeaturedActualite item={featured} /> : null}

      {/* (c) Bandeau Magazine / kiosque — page 1, non filtrée */}
      {isLanding ? <MagazineBand /> : null}

      {/* (d) Toutes nos actualités */}
      <Container className="py-6">
        <SectionLabel>Toutes nos actualités</SectionLabel>
        <ListingHeading>Parcourir les actualités</ListingHeading>

        <Toolbar basePath={basePath} themes={themes} activeTheme={theme} q={q} />

        <p className="text-text-muted mt-6 text-sm" role="status" aria-live="polite">
          {totalDocs === 0
            ? 'Aucune actualité ne correspond à votre recherche.'
            : actualites.length === 0
              ? `${totalDocs} actualité${totalDocs > 1 ? 's' : ''} — cette page n’existe pas.`
              : `Affichage de ${rangeStart} à ${rangeEnd} sur ${totalDocs} actualité${totalDocs > 1 ? 's' : ''}`}
          {theme ? ` — thématique « ${theme} »` : ''}
          {q ? ` — recherche « ${q} »` : ''}
        </p>

        {actualites.length > 0 ? (
          <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5">
            {actualites.map((a) => (
              <NewsCard
                key={a.id}
                item={{
                  tag: a.tag ?? 'Actualité',
                  title: a.title,
                  image: cardBackground(a),
                  href: actualiteHref(a),
                }}
              />
            ))}
          </div>
        ) : (
          <div className="border-border-main text-text-muted mt-6 rounded-xl border border-dashed p-10 text-center">
            <p>Essayez d’élargir votre recherche ou de retirer un filtre.</p>
            {(theme || q) && (
              <Link href={basePath} className="text-action mt-3 inline-block font-semibold no-underline">
                Réinitialiser les filtres
              </Link>
            )}
          </div>
        )}

        <Pagination basePath={basePath} page={page} totalPages={totalPages} theme={theme} q={q} />
      </Container>

      {/* (e) Agenda — prochains événements */}
      {events.length > 0 ? (
        <Container className="py-12">
          <SectionLabel>Agenda</SectionLabel>
          <ListingHeading>Les prochains rendez-vous</ListingHeading>
          <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
            {events.map((e) => {
              const { day, month } = eventDateParts(e.startDate)
              return (
                <AgendaCard
                  key={e.id}
                  item={{
                    day,
                    month,
                    title: e.title,
                    place: e.location ?? '',
                    category: e.category ?? 'autre',
                    href: rubriqueHref(e.rubriques?.[0]) + `/${e.slug ?? e.id}`,
                  }}
                />
              )
            })}
          </div>
        </Container>
      ) : null}

      {/* (f) Newsletter */}
      <Newsletter />
    </>
  )
}

export default ActualiteListingTemplate
