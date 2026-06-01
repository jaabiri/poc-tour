import Image from 'next/image'

import { Container, SectionLabel } from '@/components/ui'
import { NewsCard } from '@/components/sections/news/NewsCard'
import { AgendaCard } from '@/components/sections/agenda/AgendaCard'
import { RubriqueHero } from '@/components/shared/rubrique-hero'
import { RubriqueCard } from '@/components/shared/rubrique-card'
import { getPayloadClient } from '@/lib/payload'
import type { IconName } from '@/lib/icons'

import type {
  Actualite,
  Article,
  Breve,
  Evenement,
  Media,
  Page,
  Rubrique,
} from '@/payload-types'

/**
 * RubriqueListingTemplate — the AUTO-LISTING gabarit, used when a rubrique has no
 * composed `landing` block stack. It synthesises a coherent landing from the
 * rubrique's own arborescence and attached content. It covers:
 *   T2  landing             — a section overview page
 *   T6  "Toutes les actus"  — an actualité index rubrique
 *   T8  agenda              — an événement index rubrique
 *   T11 espace dédié        — a themed sub-space
 *
 * Sections (each rendered only when it has items):
 *   (a) Title + optional chapô (from seo.metaDescription)
 *   (b) Child rubriques as a card grid
 *   (c) Latest actualités attached to this rubrique (NewsCard)
 *   (d) Upcoming events attached to this rubrique (AgendaCard)
 *
 * Template contract: this is a React Server Component returning ONLY the page's
 * MAIN CONTENT (no Topbar/SiteHeader/SiteFooter, no outer <main>, no breadcrumb —
 * the dispatcher route supplies all chrome). Styling mirrors BlockRenderer.tsx
 * exactly: semantic tokens only, the same card/grid visual language.
 */

/**
 * Pull a usable URL + alt off a populated (or unpopulated) media relation.
 * (Same guard as BlockRenderer.tsx — populated = object with `.url`.)
 */
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

/**
 * Front-office path of a content doc: primary rubrique breadcrumb path + '/' +
 * slug (slug falling back to id). Mirrors the inline href used by the
 * actualité/événement sections below.
 */
const contentHref = (
  rubriques: ((number | null) | Rubrique)[] | null | undefined,
  slug: string | null | undefined,
  id: number,
): string => `${rubriqueHref(rubriques?.[0])}/${slug ?? id}`

/** A short prose date for brèves (no extra date lib). */
const breveDate = (iso: string): string => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** A short prose date for events (no extra date lib). */
const eventDateParts = (iso: string): { day: string; month: string } => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return { day: '', month: '' }
  return {
    day: String(d.getDate()).padStart(2, '0'),
    month: d.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase(),
  }
}

/** Section heading shared by the listing sections, in the brand voice. */
function ListingHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-brand-primary-dark mb-7 mt-2.5 text-3xl font-bold leading-tight">
      {children}
    </h2>
  )
}

export async function RubriqueListingTemplate({ rubrique }: { rubrique: Rubrique }) {
  const payload = await getPayloadClient()

  // Fetch the listing data sets in parallel.
  const [
    childrenRes,
    actualitesRes,
    evenementsRes,
    pagesRes,
    articlesRes,
    brevesRes,
  ] = await Promise.all([
    payload.find({
      collection: 'rubriques',
      where: {
        and: [{ parent: { equals: rubrique.id } }, { visible: { equals: true } }],
      },
      sort: 'order',
      draft: false,
      depth: 1,
    }),
    payload.find({
      collection: 'actualite',
      where: { rubriques: { in: [rubrique.id] } },
      sort: '-date',
      limit: 6,
      draft: false,
      depth: 2,
    }),
    payload.find({
      collection: 'evenement',
      where: { rubriques: { in: [rubrique.id] } },
      sort: 'startDate',
      limit: 6,
      draft: false,
      depth: 2,
    }),
    payload.find({
      collection: 'page',
      where: { rubriques: { in: [rubrique.id] } },
      limit: 12,
      draft: false,
      depth: 1,
    }),
    payload.find({
      collection: 'article',
      where: { rubriques: { in: [rubrique.id] } },
      limit: 12,
      draft: false,
      depth: 1,
    }),
    payload.find({
      collection: 'breve',
      where: { rubriques: { in: [rubrique.id] } },
      sort: '-date',
      limit: 12,
      draft: false,
      depth: 1,
    }),
  ])

  const children = childrenRes.docs as Rubrique[]
  const actualites = actualitesRes.docs as Actualite[]
  const evenements = evenementsRes.docs as Evenement[]
  const pages = pagesRes.docs as Page[]
  const articles = articlesRes.docs as Article[]
  const breves = brevesRes.docs as Breve[]

  const chapo = rubrique.seo?.metaDescription

  return (
    <>
      {/* (a) Rubrique hero — compact title band (aplat de charte / visual) with
          the fil d'Ariane integrated INTO the band (one cohesive masthead). The
          page-top filet is supplied by the route just above. */}
      <RubriqueHero
        title={rubrique.title}
        intro={chapo}
        image={mediaSrc(rubrique.seo?.ogImage)}
        breadcrumbs={rubrique.breadcrumbs ?? []}
        currentTitle={rubrique.title}
      />

      {/* (b) Child rubriques as the heart of the landing — iconographed cards. */}
      {children.length > 0 ? (
        <Container className="py-12">
          <SectionLabel>Explorer</SectionLabel>
          <ListingHeading>Dans cette rubrique</ListingHeading>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(290px,1fr))] gap-5">
            {children.map((child) => (
              <RubriqueCard
                key={child.id}
                item={{
                  icon: (child.icon ?? null) as IconName | null,
                  title: child.title,
                  description: child.seo?.metaDescription ?? null,
                  href: rubriqueHref(child),
                }}
              />
            ))}
          </div>
        </Container>
      ) : null}

      {/* (b2) Attached pages as a card grid (reuses the child-card markup). */}
      {pages.length > 0 ? (
        <Container className="py-12">
          <SectionLabel>Explorer</SectionLabel>
          <ListingHeading>Pages associées</ListingHeading>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pages.map((p) => {
              const img = mediaSrc(p.seo?.ogImage)
              return (
                <a
                  key={p.id}
                  href={contentHref(p.rubriques, p.slug, p.id)}
                  className="group bg-surface-main border-border-main hover:shadow-card-hover relative block overflow-hidden rounded-xl border p-6 no-underline transition-all hover:-translate-y-1.5"
                >
                  {img ? (
                    <Image
                      src={img.url}
                      alt={img.alt}
                      width={400}
                      height={220}
                      className="mb-4 h-40 w-full rounded-md object-cover"
                    />
                  ) : null}
                  <h3 className="text-brand-primary-dark mb-2 text-lg font-bold">
                    {p.title}
                  </h3>
                  {p.seo?.metaDescription ? (
                    <p className="text-text-muted text-sm leading-relaxed">
                      {p.seo.metaDescription}
                    </p>
                  ) : null}
                </a>
              )
            })}
          </div>
        </Container>
      ) : null}

      {/* (b3) Attached articles — démarches & informations (reuses card markup). */}
      {articles.length > 0 ? (
        <Container className="py-12">
          <SectionLabel>Explorer</SectionLabel>
          <ListingHeading>Démarches et informations</ListingHeading>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <a
                key={a.id}
                href={contentHref(a.rubriques, a.slug, a.id)}
                className="group bg-surface-main border-border-main hover:shadow-card-hover relative block overflow-hidden rounded-xl border p-6 no-underline transition-all hover:-translate-y-1.5"
              >
                <h3 className="text-brand-primary-dark mb-2 text-lg font-bold">
                  {a.title}
                </h3>
                {a.chapo ? (
                  <p className="text-text-muted text-sm leading-relaxed">
                    {a.chapo}
                  </p>
                ) : null}
              </a>
            ))}
          </div>
        </Container>
      ) : null}

      {/* (c) Latest actualités (imitates NewsListBlockView). */}
      {actualites.length > 0 ? (
        <Container className="py-12">
          <SectionLabel>Actualités</SectionLabel>
          <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5">
            {actualites.map((a) => {
              const img = mediaSrc(a.image)
              return (
                <NewsCard
                  key={a.id}
                  item={{
                    tag: a.tag ?? 'Actualité',
                    title: a.title,
                    // NewsCard renders `image` as a CSS background; fall back to a
                    // token-driven brand wash when there is no media.
                    image: img
                      ? `url(${img.url}) center/cover`
                      : 'var(--color-surface-brand)',
                    href: rubriqueHref(a.rubriques?.[0]) + `/${a.slug ?? a.id}`,
                  }}
                />
              )
            })}
          </div>
        </Container>
      ) : null}

      {/* (d) Upcoming events (imitates AgendaBlockView). */}
      {evenements.length > 0 ? (
        <Container className="py-12">
          <SectionLabel>Agenda</SectionLabel>
          <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
            {evenements.map((e) => {
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

      {/* (e) Attached brèves — a compact dated list with links. */}
      {breves.length > 0 ? (
        <Container className="py-12">
          <SectionLabel>Brèves</SectionLabel>
          <ul className="border-border-main mt-6 divide-y rounded-xl border">
            {breves.map((b) => {
              const date = breveDate(b.date)
              return (
                <li key={b.id}>
                  <a
                    href={contentHref(b.rubriques, b.slug, b.id)}
                    className="group bg-surface-main hover:bg-surface-brand flex flex-col gap-1 p-5 no-underline transition-colors sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
                  >
                    <span className="text-brand-primary-dark font-bold leading-snug">
                      {b.title}
                    </span>
                    {date ? (
                      <time
                        dateTime={b.date}
                        className="text-text-muted shrink-0 text-sm"
                      >
                        {date}
                      </time>
                    ) : null}
                  </a>
                </li>
              )
            })}
          </ul>
        </Container>
      ) : null}
    </>
  )
}

export default RubriqueListingTemplate
