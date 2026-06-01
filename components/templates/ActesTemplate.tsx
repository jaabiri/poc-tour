import Link from 'next/link'

import { Container, SectionLabel, Tag, Icon } from '@/components/ui'
import { Newsletter } from '@/components/sections/newsletter'
import actesData from '@/data/actes.json'
import type { ActesContent, ActeItem, ActeType } from '@/types/content'

import type { Rubrique } from '@/payload-types'

/**
 * ActesTemplate — gabarit « Registre des actes administratifs ».
 *
 * A filterable, paginated register of the département's published acts
 * (délibérations, arrêtés, RAA, budget), in the same family as the Annuaire MDS
 * / actualités / agenda listings. The dispatcher (`app/(frontend)/[...slug]`)
 * detects the rubrique via `isActesRubrique` and renders this instead of the
 * generic RubriqueServiceTemplate — tested BEFORE `isServiceRubrique`, since the
 * rubrique also carries editorial sections in the content catalogue.
 *
 * Returns ONLY the page's MAIN CONTENT — filet, breadcrumb and
 * Topbar/SiteHeader/SiteFooter chrome come from the route + layout, per the
 * shared template contract.
 *
 * Data-driven, no CMS schema change: the acts live in `data/actes.json` (typed
 * `ActesContent`), ready to be wired to a Payload `acte` collection later.
 * Type/year filtering, search and pagination are all URL-driven
 * (`?type=&year=&q=&page=`), so the page stays a Server Component, is shareable
 * and RGAA-accessible with no client JS (links + a GET form), per CLAUDE.md §3.
 *
 * Styling: semantic design tokens only (CLAUDE.md §1/§2). Visual language mirrors
 * AgendaListingTemplate (toolbar, compteur « X à Y sur Z », pagination).
 */

const actes = actesData as ActesContent
const PAGE_SIZE = 8

/** Canonical order + French labels of the act types (mirrors a future CMS enum). */
const TYPE_LABELS: Record<ActeType, string> = {
  deliberation: 'Délibérations',
  arrete: 'Arrêtés',
  budget: 'Documents budgétaires',
  raa: 'Recueil des actes (RAA)',
}
const TYPE_ORDER = Object.keys(TYPE_LABELS) as ActeType[]
/** Singular tag label shown on a row. */
const TYPE_TAG: Record<ActeType, string> = {
  deliberation: 'Délibération',
  arrete: 'Arrêté',
  budget: 'Budget',
  raa: 'RAA',
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

/** Detect the « Les actes administratifs » register rubrique (dispatcher). */
export const isActesRubrique = (rubrique: Rubrique): boolean => {
  const path = rubriqueHref(rubrique).replace(/^\//, '')
  return (
    path.endsWith('les-actes-administratifs') ||
    rubrique.slug === 'les-actes-administratifs' ||
    rubrique.slug === 'actes-administratifs'
  )
}

/** Read the first value of a (possibly repeated) search param. */
const firstParam = (v: string | string[] | undefined): string =>
  (Array.isArray(v) ? v[0] : v)?.trim() ?? ''

/** Build a query string (omits defaults: page 1). */
const buildQuery = (state: {
  type?: string
  year?: string
  q?: string
  page?: number
}): string => {
  const sp = new URLSearchParams()
  if (state.type) sp.set('type', state.type)
  if (state.year) sp.set('year', state.year)
  if (state.q) sp.set('q', state.q)
  if (state.page && state.page > 1) sp.set('page', String(state.page))
  const s = sp.toString()
  return s ? `?${s}` : ''
}

/** Publication year of an act (from its ISO date). */
const acteYear = (iso: string): string => iso.slice(0, 4)

/** Long French date, e.g. « 10 avril 2026 ». */
const formatLongDate = (iso: string): string => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

type SearchParams = {
  type?: string | string[]
  year?: string | string[]
  q?: string | string[]
  page?: string | string[]
}

/* ── Toolbar: filtres nature + recherche + filtres année ──────────────────── */
function Toolbar({
  basePath,
  types,
  years,
  activeType,
  activeYear,
  q,
}: {
  basePath: string
  types: ActeType[]
  years: string[]
  activeType: string
  activeYear: string
  q: string
}) {
  const chip = (active: boolean) =>
    active
      ? 'bg-surface-brand text-text-inverse rounded-full px-4 py-2 text-sm font-semibold no-underline'
      : 'bg-surface-main border-border-main text-text-primary hover:border-brand-primary rounded-full border px-4 py-2 text-sm font-semibold no-underline transition-colors'

  return (
    <div className="mt-6 flex flex-col gap-5">
      {/* Recherche — GET form: preserves nature + année, resets the page. */}
      <form method="get" action={basePath} role="search" className="flex max-w-2xl gap-3">
        <label htmlFor="actes-q" className="sr-only">
          Rechercher un acte (objet, référence…)
        </label>
        {activeType ? <input type="hidden" name="type" value={activeType} /> : null}
        {activeYear ? <input type="hidden" name="year" value={activeYear} /> : null}
        <input
          id="actes-q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Rechercher un objet, une référence…"
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

      {/* Filtres par nature d'acte */}
      <div className="flex flex-wrap gap-2.5" role="group" aria-label="Filtrer par nature d’acte">
        {([''] as string[]).concat(types).map((t) => {
          const active = t === activeType
          const label = t === '' ? 'Tous les actes' : TYPE_LABELS[t as ActeType]
          return (
            <Link
              key={t || 'all'}
              href={`${basePath}${buildQuery({ type: t || undefined, year: activeYear || undefined, q: q || undefined })}`}
              aria-pressed={active}
              className={chip(active)}
            >
              {label}
            </Link>
          )
        })}
      </div>

      {/* Filtres par année */}
      <div className="flex flex-wrap gap-2.5" role="group" aria-label="Filtrer par année">
        {[''].concat(years).map((y) => {
          const active = y === activeYear
          const label = y === '' ? 'Toutes les années' : y
          return (
            <Link
              key={y || 'all'}
              href={`${basePath}${buildQuery({ type: activeType || undefined, year: y || undefined, q: q || undefined })}`}
              aria-pressed={active}
              className={chip(active)}
            >
              {label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

/* ── A single act row ─────────────────────────────────────────────────────── */
function ActeRow({ item }: { item: ActeItem }) {
  return (
    <li className="bg-surface-main border-border-main hover:shadow-card flex flex-col gap-4 rounded-xl border p-5 transition-all sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <Tag>{TYPE_TAG[item.type]}</Tag>
          <span className="text-text-muted text-sm font-medium">{item.reference}</span>
        </div>
        <h3 className="font-display text-brand-primary-dark mt-2 text-lg font-bold leading-tight">
          {item.title}
        </h3>
        <p className="text-text-muted mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="inline-flex items-center gap-1.5">
            <Icon name="calendar" size={14} />
            <time dateTime={item.date}>{formatLongDate(item.date)}</time>
          </span>
          {item.session ? <span>{item.session}</span> : null}
        </p>
      </div>
      <a
        href={item.pdfUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-surface-tint-blue text-brand-primary-dark hover:bg-surface-tint-blue-strong inline-flex shrink-0 items-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold no-underline transition-colors"
      >
        <Icon name="file-text" size={16} />
        <span>
          Télécharger
          <span className="sr-only"> l’acte « {item.title} » au format PDF</span>
          <span aria-hidden="true"> (PDF)</span>
        </span>
      </a>
    </li>
  )
}

/* ── Pagination (mirrors AgendaListingTemplate) ───────────────────────────── */
function Pagination({
  basePath,
  page,
  totalPages,
  type,
  year,
  q,
}: {
  basePath: string
  page: number
  totalPages: number
  type: string
  year: string
  q: string
}) {
  if (totalPages <= 1) return null
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const href = (p: number) =>
    `${basePath}${buildQuery({ type: type || undefined, year: year || undefined, q: q || undefined, page: p })}`
  const edge =
    'inline-flex h-10 min-w-10 items-center justify-center rounded-md px-3 text-sm font-semibold no-underline'

  return (
    <nav
      aria-label="Pagination du registre des actes"
      className="mt-10 flex items-center justify-center gap-1.5"
    >
      {page > 1 ? (
        <Link
          href={href(page - 1)}
          rel="prev"
          aria-label="Page précédente"
          className={`${edge} bg-surface-main border-border-main text-text-primary hover:border-brand-primary border transition-colors`}
        >
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
          <Link
            key={p}
            href={href(p)}
            aria-label={`Page ${p}`}
            className={`${edge} bg-surface-main border-border-main text-text-primary hover:border-brand-primary border transition-colors`}
          >
            {p}
          </Link>
        ),
      )}

      {page < totalPages ? (
        <Link
          href={href(page + 1)}
          rel="next"
          aria-label="Page suivante"
          className={`${edge} bg-surface-main border-border-main text-text-primary hover:border-brand-primary border transition-colors`}
        >
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

export function ActesTemplate({
  rubrique,
  searchParams,
}: {
  rubrique: Rubrique
  searchParams?: SearchParams
}) {
  const type = firstParam(searchParams?.type)
  const year = firstParam(searchParams?.year)
  const q = firstParam(searchParams?.q).toLowerCase()
  const requestedPage = Number.parseInt(firstParam(searchParams?.page), 10)
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const basePath = rubriqueHref(rubrique)

  // Newest-first; canonical filter chips, present-in-data only.
  const sorted = [...actes.acts].sort((a, b) => b.date.localeCompare(a.date))
  const typeSet = new Set(sorted.map((a) => a.type))
  const types = TYPE_ORDER.filter((t) => typeSet.has(t))
  const years = [...new Set(sorted.map((a) => acteYear(a.date)))]

  const filtered = sorted.filter((a) => {
    if (type && a.type !== type) return false
    if (year && acteYear(a.date) !== year) return false
    if (q) {
      const haystack = `${a.title} ${a.reference} ${a.session ?? ''}`.toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })

  const totalDocs = filtered.length
  const totalPages = Math.max(1, Math.ceil(totalDocs / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const rangeStart = totalDocs === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(safePage * PAGE_SIZE, totalDocs)
  const chapo = actes.intro || rubrique.seo?.metaDescription

  return (
    <>
      {/* En-tête */}
      <Container className="pb-2 pt-6">
        <SectionLabel>Registre</SectionLabel>
        <h1 className="font-display text-brand-primary-dark mt-2.5 text-4xl font-black leading-tight md:text-5xl">
          {rubrique.title}
        </h1>
        {chapo ? (
          <p className="text-text-primary mt-4 max-w-3xl text-lg leading-relaxed">{chapo}</p>
        ) : null}
      </Container>

      {/* Registre + filtres */}
      <Container className="py-6">
        <SectionLabel>Consulter les actes</SectionLabel>
        <Toolbar
          basePath={basePath}
          types={types}
          years={years}
          activeType={type}
          activeYear={year}
          q={q}
        />

        <p className="text-text-muted mt-6 text-sm" role="status" aria-live="polite">
          {totalDocs === 0
            ? 'Aucun acte ne correspond à votre recherche.'
            : `Affichage de ${rangeStart} à ${rangeEnd} sur ${totalDocs} acte${totalDocs > 1 ? 's' : ''}`}
          {type ? ` — ${TYPE_LABELS[type as ActeType].toLowerCase()}` : ''}
          {year ? ` — année ${year}` : ''}
          {q ? ` — recherche « ${q} »` : ''}
        </p>

        {pageItems.length > 0 ? (
          <ul className="mt-6 flex flex-col gap-3">
            {pageItems.map((a) => (
              <ActeRow key={a.reference} item={a} />
            ))}
          </ul>
        ) : (
          <div className="border-border-main text-text-muted mt-6 rounded-xl border border-dashed p-10 text-center">
            <p>Essayez d’élargir votre recherche ou de retirer un filtre.</p>
            {(type || year || q) && (
              <Link href={basePath} className="text-action mt-3 inline-block font-semibold no-underline">
                Réinitialiser les filtres
              </Link>
            )}
          </div>
        )}

        <Pagination
          basePath={basePath}
          page={safePage}
          totalPages={totalPages}
          type={type}
          year={year}
          q={q}
        />
      </Container>

      <Newsletter />
    </>
  )
}

export default ActesTemplate
