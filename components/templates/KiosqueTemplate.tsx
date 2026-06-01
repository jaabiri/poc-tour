import Link from 'next/link'

import { Container, SectionLabel, Tag, Icon, CornerSeal } from '@/components/ui'
import { Newsletter } from '@/components/sections/newsletter'
import magazineData from '@/data/magazine.json'
import type { MagazineContent, MagazineIssue } from '@/types/content'

import type { Rubrique } from '@/payload-types'

/**
 * KiosqueTemplate — gabarit « Touraine le Mag + kiosque numérique ».
 *
 * The magazine archive: a filterable grid of every issue (cover, période,
 * téléchargement PDF + lecture en ligne), in the same family as the Annuaire MDS
 * / actualités / agenda listings. The dispatcher (`app/(frontend)/[...slug]`)
 * detects the rubrique via `isKiosqueRubrique` and renders this instead of the
 * generic RubriqueServiceTemplate — tested BEFORE `isServiceRubrique`, since the
 * rubrique also carries editorial sections in the content catalogue.
 *
 * Returns ONLY the page's MAIN CONTENT — filet, breadcrumb and
 * Topbar/SiteHeader/SiteFooter chrome come from the route + layout, per the
 * shared template contract.
 *
 * Data-driven, no CMS schema change: the issues live in `data/magazine.json`
 * (typed `MagazineContent`), ready to be wired to a Payload `magazine` collection
 * later. Search + year filtering are URL-driven (`?year=&q=`), so the page stays
 * a Server Component, is shareable and RGAA-accessible with no client JS (links +
 * a GET form), per CLAUDE.md §3.
 *
 * Styling: semantic design tokens only (CLAUDE.md §1/§2). Visual language mirrors
 * AnnuaireMDSTemplate so the page reads as the same site.
 */

const magazine = magazineData as MagazineContent

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

/** Detect the « Touraine le Mag + kiosque » rubrique (dispatcher). */
export const isKiosqueRubrique = (rubrique: Rubrique): boolean => {
  const path = rubriqueHref(rubrique).replace(/^\//, '')
  return (
    path.endsWith('touraine-le-mag-et-kiosque') ||
    rubrique.slug === 'touraine-le-mag-et-kiosque' ||
    rubrique.slug === 'touraine-le-mag'
  )
}

/** Read the first value of a (possibly repeated) search param. */
const firstParam = (v: string | string[] | undefined): string =>
  (Array.isArray(v) ? v[0] : v)?.trim() ?? ''

/** Build a query string from a filter state, omitting empty values. */
const buildQuery = (state: { year?: string; q?: string }): string => {
  const sp = new URLSearchParams()
  if (state.year) sp.set('year', state.year)
  if (state.q) sp.set('q', state.q)
  const s = sp.toString()
  return s ? `?${s}` : ''
}

/** Publication year of an issue (from its ISO date). */
const issueYear = (iso: string): string => iso.slice(0, 4)

type SearchParams = { year?: string | string[]; q?: string | string[] }

/* ── Toolbar: recherche + filtres par année ───────────────────────────────── */
function Toolbar({
  basePath,
  years,
  activeYear,
  q,
}: {
  basePath: string
  years: string[]
  activeYear: string
  q: string
}) {
  return (
    <div className="mt-6 flex flex-col gap-5">
      <form method="get" action={basePath} role="search" className="flex max-w-2xl gap-3">
        <label htmlFor="mag-q" className="sr-only">
          Rechercher un numéro du magazine
        </label>
        {activeYear ? <input type="hidden" name="year" value={activeYear} /> : null}
        <input
          id="mag-q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Rechercher un numéro, un thème…"
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

      <div className="flex flex-wrap gap-2.5" role="group" aria-label="Filtrer par année">
        {[''].concat(years).map((y) => {
          const active = y === activeYear
          const label = y === '' ? 'Toutes les années' : y
          return (
            <Link
              key={y || 'all'}
              href={`${basePath}${buildQuery({ year: y || undefined, q: q || undefined })}`}
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

/* ── The issue cover: real image or branded aplat de charte ───────────────── */
function IssueCover({ item, featured = false }: { item: MagazineIssue; featured?: boolean }) {
  if (item.cover) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={item.cover}
        alt={`Couverture de ${item.title}`}
        className="aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    )
  }
  // No photo → branded aplat with the magazine glyph + issue number (decorative).
  return (
    <span
      aria-hidden="true"
      className="bg-surface-brand text-text-inverse flex aspect-[3/4] w-full flex-col items-center justify-center gap-3"
    >
      <Icon name="book-open" size={featured ? 56 : 40} />
      <span className="font-display text-3xl font-black">n°{item.number}</span>
    </span>
  )
}

/* ── A single magazine issue card ─────────────────────────────────────────── */
function IssueCard({ item }: { item: MagazineIssue }) {
  return (
    <article className="group bg-surface-main border-border-main hover:shadow-card relative flex flex-col overflow-hidden rounded-xl border transition-all">
      <CornerSeal />
      <div className="overflow-hidden">
        <IssueCover item={item} />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <Tag>{item.period}</Tag>
        <h3 className="font-display text-brand-primary-dark mt-3 text-lg font-bold leading-tight">
          {item.title}
        </h3>
        {item.summary ? (
          <p className="text-text-muted mt-2 flex-1 text-sm leading-relaxed">{item.summary}</p>
        ) : null}
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
          {item.readUrl ? (
            <a
              href={item.readUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-action hover:text-action-hover inline-flex items-center gap-2 text-sm font-semibold no-underline"
            >
              <Icon name="eye" size={16} />
              Feuilleter
            </a>
          ) : null}
          <a
            href={item.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-action hover:text-action-hover inline-flex items-center gap-2 text-sm font-semibold no-underline"
          >
            <Icon name="file-text" size={16} />
            <span>
              Télécharger
              <span className="sr-only"> le PDF de {item.title}</span>
              <span aria-hidden="true"> (PDF)</span>
            </span>
          </a>
        </div>
      </div>
    </article>
  )
}

/* ── À la une — dernier numéro paru ───────────────────────────────────────── */
function FeaturedIssue({ item }: { item: MagazineIssue }) {
  return (
    <Container className="pt-4">
      <SectionLabel>Le dernier numéro</SectionLabel>
      <div className="bg-surface-brand text-text-inverse relative mt-5 flex flex-col gap-6 overflow-hidden rounded-2xl p-6 md:flex-row md:items-center md:p-8">
        <CornerSeal />
        <div className="w-40 shrink-0 overflow-hidden rounded-lg border border-white/20 md:w-48">
          <IssueCover item={item} featured />
        </div>
        <div className="min-w-0">
          <Tag>{item.period}</Tag>
          <h3 className="font-display mt-3 text-2xl font-bold leading-tight md:text-3xl">
            {item.title}
          </h3>
          {item.summary ? (
            <p className="text-text-on-brand mt-3 max-w-xl text-base leading-relaxed">
              {item.summary}
            </p>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-3">
            {item.readUrl ? (
              <a
                href={item.readUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-surface-main text-brand-primary-dark inline-flex items-center gap-2 rounded-md px-5 py-3 text-sm font-semibold no-underline transition-transform hover:translate-x-0.5"
              >
                <Icon name="eye" size={18} />
                Feuilleter en ligne
              </a>
            ) : null}
            <a
              href={item.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-inverse inline-flex items-center gap-2 rounded-md border border-white/30 px-5 py-3 text-sm font-semibold no-underline transition-colors hover:bg-white/10"
            >
              <Icon name="file-text" size={18} />
              Télécharger le PDF
            </a>
          </div>
        </div>
      </div>
    </Container>
  )
}

export function KiosqueTemplate({
  rubrique,
  searchParams,
}: {
  rubrique: Rubrique
  searchParams?: SearchParams
}) {
  const year = firstParam(searchParams?.year)
  const q = firstParam(searchParams?.q).toLowerCase()
  const basePath = rubriqueHref(rubrique)

  // Issues newest-first; distinct years drive the filter chips.
  const sorted = [...magazine.issues].sort((a, b) => b.date.localeCompare(a.date))
  const years = [...new Set(sorted.map((i) => issueYear(i.date)))]

  const filtered = sorted.filter((i) => {
    if (year && issueYear(i.date) !== year) return false
    if (q) {
      const haystack = `${i.title} ${i.period} ${i.summary ?? ''}`.toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })

  // Default (unfiltered) view spotlights the latest issue, the rest in the grid.
  const isLanding = !year && !q
  const featured = isLanding ? filtered[0] : undefined
  const grid = isLanding ? filtered.slice(1) : filtered

  const total = filtered.length
  const chapo = magazine.intro || rubrique.seo?.metaDescription

  return (
    <>
      {/* En-tête */}
      <Container className="pb-2 pt-6">
        <SectionLabel>Kiosque numérique</SectionLabel>
        <h1 className="font-display text-brand-primary-dark mt-2.5 text-4xl font-black leading-tight md:text-5xl">
          {rubrique.title}
        </h1>
        {chapo ? (
          <p className="text-text-primary mt-4 max-w-3xl text-lg leading-relaxed">{chapo}</p>
        ) : null}
      </Container>

      {/* À la une — dernier numéro */}
      {featured ? <FeaturedIssue item={featured} /> : null}

      {/* Tous les numéros + filtres */}
      <Container className="py-6">
        <SectionLabel>{isLanding ? 'Les numéros précédents' : 'Résultats'}</SectionLabel>
        <Toolbar basePath={basePath} years={years} activeYear={year} q={q} />

        <p className="text-text-muted mt-6 text-sm" role="status" aria-live="polite">
          {total === 0
            ? 'Aucun numéro ne correspond à votre recherche.'
            : `${total} numéro${total > 1 ? 's' : ''}`}
          {year ? ` — année ${year}` : ''}
          {q ? ` — recherche « ${q} »` : ''}
        </p>

        {grid.length > 0 ? (
          <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5">
            {grid.map((i) => (
              <IssueCard key={i.number} item={i} />
            ))}
          </div>
        ) : total === 0 ? (
          <div className="border-border-main text-text-muted mt-6 rounded-xl border border-dashed p-10 text-center">
            <p>Essayez d’élargir votre recherche ou de retirer un filtre.</p>
            {(year || q) && (
              <Link href={basePath} className="text-action mt-3 inline-block font-semibold no-underline">
                Réinitialiser les filtres
              </Link>
            )}
          </div>
        ) : null}
      </Container>

      <Newsletter />
    </>
  )
}

export default KiosqueTemplate
