import Link from 'next/link'

import { Container, SectionLabel, Tag, Icon, CornerSeal } from '@/components/ui'
import elusData from '@/data/elus.json'
import type { ElusContent, Elu } from '@/types/content'

import type { Rubrique } from '@/payload-types'

/**
 * ElusTemplate — gabarit « Annuaire des élus du Département » (trombinoscope).
 *
 * A filterable directory of the conseillers départementaux, in the same family
 * as the Annuaire MDS / actualités / agenda listings. The dispatcher
 * (`app/(frontend)/[...slug]`) detects the rubrique via `isElusRubrique` and
 * renders this instead of the generic RubriqueServiceTemplate — it must be
 * tested BEFORE `isServiceRubrique`, since the rubrique also carries editorial
 * sections in the content catalogue.
 *
 * Returns ONLY the page's MAIN CONTENT — filet, breadcrumb and
 * Topbar/SiteHeader/SiteFooter chrome come from the route + layout, per the
 * shared template contract.
 *
 * Data-driven, no CMS schema change: the roster lives in `data/elus.json`
 * (typed `ElusContent`), ready to be wired to a Payload `elu` collection later.
 * Search + group filtering are URL-driven (`?group=&q=`), so the page stays a
 * Server Component, is shareable and RGAA-accessible with no client JS (links +
 * a GET form), per CLAUDE.md §3.
 *
 * Styling: semantic design tokens only (CLAUDE.md §1/§2). Visual language mirrors
 * AnnuaireMDSTemplate so the page reads as the same site.
 */

const elus = elusData as ElusContent

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

/** Detect the « Les élus du Département » annuaire rubrique (dispatcher). */
export const isElusRubrique = (rubrique: Rubrique): boolean => {
  const path = rubriqueHref(rubrique).replace(/^\//, '')
  return (
    path.endsWith('les-elus-du-departement') ||
    rubrique.slug === 'les-elus-du-departement' ||
    rubrique.slug === 'les-elus'
  )
}

/** Read the first value of a (possibly repeated) search param. */
const firstParam = (v: string | string[] | undefined): string =>
  (Array.isArray(v) ? v[0] : v)?.trim() ?? ''

/** Build a query string from a filter state, omitting empty values. */
const buildQuery = (state: { group?: string; q?: string }): string => {
  const sp = new URLSearchParams()
  if (state.group) sp.set('group', state.group)
  if (state.q) sp.set('q', state.q)
  const s = sp.toString()
  return s ? `?${s}` : ''
}

/** Initials (max 2) for the branded portrait fallback. */
const initials = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

type SearchParams = { group?: string | string[]; q?: string | string[] }

/* ── Toolbar: recherche + filtres par groupe politique ────────────────────── */
function Toolbar({
  basePath,
  groups,
  activeGroup,
  q,
}: {
  basePath: string
  groups: string[]
  activeGroup: string
  q: string
}) {
  return (
    <div className="mt-6 flex flex-col gap-5">
      <form method="get" action={basePath} role="search" className="flex max-w-2xl gap-3">
        <label htmlFor="elus-q" className="sr-only">
          Rechercher un élu (nom, canton…)
        </label>
        {activeGroup ? <input type="hidden" name="group" value={activeGroup} /> : null}
        <input
          id="elus-q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Rechercher un nom, un canton…"
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

      <div className="flex flex-wrap gap-2.5" role="group" aria-label="Filtrer par groupe politique">
        {[''].concat(groups).map((g) => {
          const active = g === activeGroup
          const label = g === '' ? 'Tous les groupes' : g
          return (
            <Link
              key={g || 'all'}
              href={`${basePath}${buildQuery({ group: g || undefined, q: q || undefined })}`}
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

/* ── A single élu card ────────────────────────────────────────────────────── */
function EluCard({ item }: { item: Elu }) {
  return (
    <article className="group bg-surface-main border-border-main hover:shadow-card relative flex flex-col overflow-hidden rounded-xl border p-6 transition-all">
      <CornerSeal />
      <div className="flex items-center gap-4">
        {/* Branded portrait fallback — initials medallion (no photo in mock data). */}
        {item.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.photo}
            alt=""
            className="border-border-main size-16 shrink-0 rounded-full border object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="bg-surface-brand text-text-inverse font-display grid size-16 shrink-0 place-items-center rounded-full text-xl font-bold"
          >
            {initials(item.name)}
          </span>
        )}
        <div className="min-w-0">
          <h3 className="font-display text-brand-primary-dark text-lg font-bold leading-tight">
            {item.name}
          </h3>
          <p className="text-text-muted mt-1 flex items-center gap-1.5 text-sm">
            <Icon name="map-pin" size={14} />
            Canton de {item.canton}
          </p>
        </div>
      </div>

      {item.role ? (
        <p className="text-brand-primary mt-4 flex items-start gap-2 text-sm font-semibold">
          <span className="text-brand-primary mt-0.5 shrink-0">
            <Icon name="landmark" size={16} />
          </span>
          <span>
            {item.role}
            {item.delegation ? (
              <span className="text-text-muted block font-normal">{item.delegation}</span>
            ) : null}
          </span>
        </p>
      ) : null}

      <div className="mt-4 flex flex-1 flex-col justify-end gap-3">
        <Tag>{item.group}</Tag>
        {item.email ? (
          <a
            href={`mailto:${item.email}`}
            className="text-action hover:text-action-hover inline-flex items-center gap-2 break-all text-sm font-semibold no-underline"
          >
            <Icon name="mail" size={16} />
            {item.email}
          </a>
        ) : null}
      </div>
    </article>
  )
}

export function ElusTemplate({
  rubrique,
  searchParams,
}: {
  rubrique: Rubrique
  searchParams?: SearchParams
}) {
  const group = firstParam(searchParams?.group)
  const q = firstParam(searchParams?.q).toLowerCase()
  const basePath = rubriqueHref(rubrique)

  // Distinct groups (in first-seen order) → drive the filter chips.
  const groups = [...new Set(elus.members.map((m) => m.group))]

  const filtered = elus.members.filter((m) => {
    if (group && m.group !== group) return false
    if (q) {
      const haystack = `${m.name} ${m.canton} ${m.group} ${m.role ?? ''}`.toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })

  // Exécutif (members carrying a role) is surfaced first when the list is unfiltered.
  const isLanding = !group && !q
  const executive = isLanding ? filtered.filter((m) => m.role) : []
  const roster = isLanding ? filtered.filter((m) => !m.role) : filtered

  const total = filtered.length
  const chapo = elus.intro || rubrique.seo?.metaDescription

  return (
    <>
      {/* En-tête */}
      <Container className="pb-2 pt-6">
        <SectionLabel>Annuaire des élus</SectionLabel>
        <h1 className="font-display text-brand-primary-dark mt-2.5 text-4xl font-black leading-tight md:text-5xl">
          {rubrique.title}
        </h1>
        {chapo ? (
          <p className="text-text-primary mt-4 max-w-3xl text-lg leading-relaxed">{chapo}</p>
        ) : null}
      </Container>

      {/* Exécutif départemental (vue par défaut) */}
      {executive.length > 0 ? (
        <Container className="pt-4">
          <SectionLabel>L’exécutif départemental</SectionLabel>
          <div className="mt-5 grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5">
            {executive.map((m) => (
              <EluCard key={`${m.name}-${m.canton}`} item={m} />
            ))}
          </div>
        </Container>
      ) : null}

      {/* Liste complète + filtres */}
      <Container className="py-6">
        <SectionLabel>{isLanding ? 'L’ensemble des conseillers' : 'Résultats'}</SectionLabel>
        <Toolbar basePath={basePath} groups={groups} activeGroup={group} q={q} />

        <p className="text-text-muted mt-6 text-sm" role="status" aria-live="polite">
          {total === 0
            ? 'Aucun élu ne correspond à votre recherche.'
            : `${total} élu${total > 1 ? 's' : ''}`}
          {group ? ` — groupe « ${group} »` : ''}
          {q ? ` — recherche « ${q} »` : ''}
        </p>

        {roster.length > 0 ? (
          <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5">
            {roster.map((m) => (
              <EluCard key={`${m.name}-${m.canton}`} item={m} />
            ))}
          </div>
        ) : total === 0 ? (
          <div className="border-border-main text-text-muted mt-6 rounded-xl border border-dashed p-10 text-center">
            <p>Essayez d’élargir votre recherche ou de retirer un filtre.</p>
            {(group || q) && (
              <Link href={basePath} className="text-action mt-3 inline-block font-semibold no-underline">
                Réinitialiser les filtres
              </Link>
            )}
          </div>
        ) : null}
      </Container>
    </>
  )
}

export default ElusTemplate
