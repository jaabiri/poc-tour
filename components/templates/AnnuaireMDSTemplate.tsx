import Link from 'next/link'

import { Container, SectionLabel, Tag, Icon, CornerSeal } from '@/components/ui'
import { Newsletter } from '@/components/sections/newsletter'
import mdsData from '@/data/mds.json'
import type { MdsContent, MdsLocation } from '@/types/content'

import type { Rubrique } from '@/payload-types'

/**
 * AnnuaireMDSTemplate — gabarit « Annuaire des Maisons départementales de la
 * solidarité » (MDS). A filterable directory of the département's social-action
 * locations, in the same family as the actualités / agenda listings.
 *
 * The dispatcher (`app/(frontend)/[...slug]`) detects the rubrique via
 * `isAnnuaireMDSRubrique` and renders this instead of the generic
 * RubriqueListingTemplate, threading the page's `searchParams` through.
 *
 * Returns ONLY the page's MAIN CONTENT — the filet, breadcrumb and
 * Topbar/SiteHeader/SiteFooter chrome come from the route + layout, per the
 * shared template contract.
 *
 * Data-driven, no CMS schema change: the directory lives in `data/mds.json`
 * (typed `MdsContent`), ready to be wired to a Payload `lieu` collection later.
 * Search + territory filtering are URL-driven (`?zone=&q=`), so the page stays a
 * Server Component, is shareable and RGAA-accessible with no client JS (links +
 * a GET form), per CLAUDE.md §3.
 *
 * Styling: semantic design tokens only (CLAUDE.md §1/§2). Visual language mirrors
 * the other listing gabarits + the contact page so it reads as the same site.
 */

const mds = mdsData as MdsContent

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

/** Detect the « Maisons de la solidarité » annuaire rubrique (dispatcher). */
export const isAnnuaireMDSRubrique = (rubrique: Rubrique): boolean => {
  const path = rubriqueHref(rubrique).replace(/^\//, '')
  return (
    path.endsWith('maisons-departementales-de-la-solidarite') ||
    path.endsWith('maisons-de-la-solidarite') ||
    rubrique.slug === 'maisons-departementales-de-la-solidarite' ||
    rubrique.slug === 'maisons-de-la-solidarite' ||
    rubrique.slug === 'annuaire-mds'
  )
}

/** Read the first value of a (possibly repeated) search param. */
const firstParam = (v: string | string[] | undefined): string =>
  (Array.isArray(v) ? v[0] : v)?.trim() ?? ''

/** Build a query string from a filter state, omitting empty values. */
const buildQuery = (state: { zone?: string; q?: string }): string => {
  const sp = new URLSearchParams()
  if (state.zone) sp.set('zone', state.zone)
  if (state.q) sp.set('q', state.q)
  const s = sp.toString()
  return s ? `?${s}` : ''
}

type SearchParams = { zone?: string | string[]; q?: string | string[] }

/* ── Toolbar: recherche + filtres par territoire ──────────────────────────── */
function Toolbar({
  basePath,
  territories,
  activeZone,
  q,
}: {
  basePath: string
  territories: string[]
  activeZone: string
  q: string
}) {
  return (
    <div className="mt-6 flex flex-col gap-5">
      {/* Recherche — GET form: preserves the active territoire. */}
      <form method="get" action={basePath} role="search" className="flex max-w-2xl gap-3">
        <label htmlFor="mds-q" className="sr-only">
          Rechercher une Maison de la solidarité (commune, adresse…)
        </label>
        {activeZone ? <input type="hidden" name="zone" value={activeZone} /> : null}
        <input
          id="mds-q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Rechercher une commune, une adresse…"
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

      {/* Filtres par territoire — links, aria-pressed marks the active chip. */}
      <div className="flex flex-wrap gap-2.5" role="group" aria-label="Filtrer par territoire">
        {[''].concat(territories).map((t) => {
          const active = t === activeZone
          const label = t === '' ? 'Tous les territoires' : t
          return (
            <Link
              key={t || 'all'}
              href={`${basePath}${buildQuery({ zone: t || undefined, q: q || undefined })}`}
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

/* ── A single MDS card ────────────────────────────────────────────────────── */
function MdsCard({ item }: { item: MdsLocation }) {
  const telHref = `tel:${item.phone.replace(/\s+/g, '')}`
  return (
    <article className="group bg-surface-main border-border-main hover:shadow-card relative flex flex-col overflow-hidden rounded-xl border p-6 transition-all">
      <CornerSeal />
      <Tag>{item.territory}</Tag>
      <h3 className="font-display text-brand-primary-dark mt-3 text-xl font-bold leading-tight">
        {item.name}
      </h3>

      <ul className="mt-4 flex flex-1 flex-col gap-2.5 text-sm">
        <li className="text-text-primary flex items-start gap-2.5">
          <span className="text-brand-primary mt-0.5 shrink-0">
            <Icon name="map-pin" size={16} />
          </span>
          <span>
            <span className="sr-only">Adresse : </span>
            {item.address}
          </span>
        </li>
        {item.hours ? (
          <li className="text-text-muted flex items-start gap-2.5">
            <span className="text-brand-primary mt-0.5 shrink-0">
              <Icon name="calendar" size={16} />
            </span>
            <span>
              <span className="sr-only">Horaires : </span>
              {item.hours}
            </span>
          </li>
        ) : null}
        <li className="text-text-primary flex items-start gap-2.5">
          <span className="text-brand-primary mt-0.5 shrink-0">
            <Icon name="phone" size={16} />
          </span>
          <span>
            <span className="sr-only">Téléphone : </span>
            <a href={telHref} className="hover:text-action no-underline">
              {item.phone}
            </a>
          </span>
        </li>
        {item.email ? (
          <li className="flex items-start gap-2.5 break-all">
            <span className="text-brand-primary mt-0.5 shrink-0">
              <Icon name="mail" size={16} />
            </span>
            <span>
              <span className="sr-only">Courriel : </span>
              <a
                href={`mailto:${item.email}`}
                className="text-action hover:text-action-hover no-underline"
              >
                {item.email}
              </a>
            </span>
          </li>
        ) : null}
      </ul>

      <a
        href={item.mapUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-action hover:text-action-hover mt-5 inline-flex items-center gap-2 text-sm font-semibold no-underline"
      >
        <Icon name="map-pin" size={16} />
        Voir sur la carte
        <Icon name="arrow-up-right" size={14} />
      </a>
    </article>
  )
}

export function AnnuaireMDSTemplate({
  rubrique,
  searchParams,
}: {
  rubrique: Rubrique
  searchParams?: SearchParams
}) {
  const zone = firstParam(searchParams?.zone)
  const q = firstParam(searchParams?.q).toLowerCase()
  const basePath = rubriqueHref(rubrique)

  // Distinct territoires (in first-seen order) → drive the filter chips.
  const territories = [...new Set(mds.locations.map((l) => l.territory))]

  // Derived list (in-memory filter — the directory is a small static set).
  const filtered = mds.locations.filter((l) => {
    if (zone && l.territory !== zone) return false
    if (q) {
      const haystack = `${l.name} ${l.territory} ${l.address}`.toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })

  const total = filtered.length
  const chapo = mds.intro || rubrique.seo?.metaDescription

  return (
    <>
      {/* En-tête */}
      <Container className="pb-2 pt-6">
        <SectionLabel>Annuaire</SectionLabel>
        <h1 className="font-display text-brand-primary-dark mt-2.5 text-4xl font-black leading-tight md:text-5xl">
          {rubrique.title}
        </h1>
        {chapo ? (
          <p className="text-text-primary mt-4 max-w-3xl text-lg leading-relaxed">{chapo}</p>
        ) : null}
      </Container>

      {/* Liste + filtres */}
      <Container className="py-6">
        <Toolbar basePath={basePath} territories={territories} activeZone={zone} q={q} />

        <p className="text-text-muted mt-6 text-sm" role="status" aria-live="polite">
          {total === 0
            ? 'Aucune Maison de la solidarité ne correspond à votre recherche.'
            : `${total} Maison${total > 1 ? 's' : ''} de la solidarité`}
          {zone ? ` — territoire « ${zone} »` : ''}
          {q ? ` — recherche « ${q} »` : ''}
        </p>

        {total > 0 ? (
          <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5">
            {filtered.map((l) => (
              <MdsCard key={l.name} item={l} />
            ))}
          </div>
        ) : (
          <div className="border-border-main text-text-muted mt-6 rounded-xl border border-dashed p-10 text-center">
            <p>Essayez d’élargir votre recherche ou de retirer un filtre.</p>
            {(zone || q) && (
              <Link href={basePath} className="text-action mt-3 inline-block font-semibold no-underline">
                Réinitialiser les filtres
              </Link>
            )}
          </div>
        )}
      </Container>

      <Newsletter />
    </>
  )
}

export default AnnuaireMDSTemplate
