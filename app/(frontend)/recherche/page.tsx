import type { Metadata } from 'next'

import { Container, SectionLabel, Icon } from '@/components/ui'
import { getPayloadClient } from '@/lib/payload'
import type { Rubrique, Search } from '@/payload-types'

/**
 * Recherche — full-text results page driven by the search plugin index.
 *
 * The plugin maintains a flat `search` collection (one synced doc per indexable
 * content item, carrying `title` + a `doc` relationship). We read the query from
 * `?q=` and run a `like` match on `title`, then render each hit as a link to its
 * source document's front-office URL.
 */

export const metadata: Metadata = {
  title: 'Recherche',
}

/**
 * Front-office href of a populated search hit: a content doc lives at its
 * primary rubrique's breadcrumb path + '/' + its own slug (BlockRenderer
 * `rubriqueHref` pattern). Pages with no rubrique fall back to their slug.
 */
const rubriqueHref = (r: (number | null) | Rubrique | undefined): string => {
  if (!r || typeof r !== 'object') return ''
  const crumbs = r.breadcrumbs ?? []
  if (crumbs.length > 0 && crumbs[crumbs.length - 1]?.url) {
    const url = crumbs[crumbs.length - 1]!.url as string
    return url.startsWith('/') ? url : `/${url}`
  }
  return r.slug ? `/${r.slug}` : ''
}

/** Resolve a search hit to a navigable front-office URL. */
const hitHref = (hit: Search): string => {
  const value = hit.doc?.value
  if (!value || typeof value !== 'object') return '#'
  const slug = 'slug' in value ? value.slug : null
  const rubriques = 'rubriques' in value ? value.rubriques : null
  const base = Array.isArray(rubriques) ? rubriqueHref(rubriques[0]) : ''
  if (slug) return base ? `${base}/${slug}` : `/${slug}`
  return base || '#'
}

/** Human-readable label for the kind of content a hit points to. */
const hitKindLabel = (hit: Search): string => {
  switch (hit.doc?.relationTo) {
    case 'article':
      return 'Article'
    case 'actualite':
      return 'Actualité'
    case 'evenement':
      return 'Événement'
    case 'page':
      return 'Page'
    case 'breve':
      return 'Brève'
    default:
      return 'Contenu'
  }
}

function SearchForm({ defaultValue }: { defaultValue: string }) {
  return (
    <form method="get" role="search" className="mt-6 flex max-w-2xl gap-3">
      <label htmlFor="q" className="sr-only">
        Rechercher sur le site
      </label>
      <input
        id="q"
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder="Rechercher…"
        className="bg-surface-main border-border-main text-text-primary placeholder:text-text-muted focus:border-brand-primary min-w-0 flex-1 rounded-md border px-4 py-3 text-base outline-none transition-colors"
      />
      <button
        type="submit"
        className="bg-brand-primary text-text-inverse hover:bg-brand-primary-mid inline-flex items-center gap-2 rounded-md px-6 py-3 text-base font-semibold transition-colors"
      >
        <Icon name="search" size={18} />
        Rechercher
      </button>
    </form>
  )
}

export default async function RecherchePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>
}) {
  const params = await searchParams
  const raw = params.q
  const q = (Array.isArray(raw) ? raw[0] : raw)?.trim() ?? ''

  let hits: Search[] = []
  if (q.length > 0) {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'search',
      where: { title: { like: q } },
      limit: 20,
      depth: 1,
      draft: false,
    })
    hits = docs as unknown as Search[]
  }

  return (
    <>
      <main>
        <Container className="py-16">
          <SectionLabel>Recherche</SectionLabel>
          <h1 className="font-display text-brand-primary-dark mt-2.5 text-4xl font-bold leading-tight">
            {q ? `Résultats pour « ${q} »` : 'Rechercher'}
          </h1>

          <SearchForm defaultValue={q} />

          {q.length === 0 ? (
            <p className="text-text-muted mt-8 max-w-2xl leading-relaxed">
              Saisissez un terme pour lancer une recherche sur l’ensemble du site.
            </p>
          ) : hits.length === 0 ? (
            <p className="text-text-muted mt-8 max-w-2xl leading-relaxed">
              Aucun résultat ne correspond à votre recherche.
            </p>
          ) : (
            <ul className="mt-8 flex flex-col gap-3">
              {hits.map((hit) => (
                <li key={hit.id}>
                  <a
                    href={hitHref(hit)}
                    className="group bg-surface-main border-border-main hover:shadow-card-hover block rounded-xl border p-5 no-underline transition-all hover:-translate-y-0.5"
                  >
                    <span className="text-action text-xs font-bold uppercase tracking-wide">
                      {hitKindLabel(hit)}
                    </span>
                    <h2 className="text-brand-primary-dark mt-1 text-lg font-bold">
                      {hit.title ?? 'Sans titre'}
                    </h2>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </main>
    </>
  )
}
