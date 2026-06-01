import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { unstable_cache } from 'next/cache'

import { resolvePath, type ResolvedRoute } from '@/lib/resolve'
import { RUBRIQUES_TAG } from '@/lib/payload'
import BlockRenderer from '@/components/blocks/BlockRenderer'
import {
  RubriqueListingTemplate,
  ActualiteListingTemplate,
  isActualiteIndex,
  AgendaListingTemplate,
  isAgendaIndex,
  AnnuaireMDSTemplate,
  isAnnuaireMDSRubrique,
  ElusTemplate,
  isElusRubrique,
  KiosqueTemplate,
  isKiosqueRubrique,
  ActesTemplate,
  isActesRubrique,
  ArticleTemplate,
  DemarcheTemplate,
  PageTemplate,
  ContactTemplate,
  isContactRubrique,
  RubriqueServiceTemplate,
  isServiceRubrique,
  ActualiteDetailTemplate,
  EvenementDetailTemplate,
  BreveDetailTemplate,
} from '@/components/templates'
import { Container } from '@/components/ui'
import { Breadcrumb } from '@/components/shared/breadcrumb'
import type { Rubrique } from '@/payload-types'

type SearchParams = { [key: string]: string | string[] | undefined }

type PageProps = {
  params: Promise<{ slug?: string[] }>
  searchParams: Promise<SearchParams>
}

// Cached resolution for the published (non-draft) path. Tagged so a Payload
// revalidate hook on RUBRIQUES_TAG busts the whole tree on content changes.
const loadRoute = (segments: string[]) =>
  unstable_cache(
    () => resolvePath(segments, { draft: false }),
    ['resolve-path', segments.join('/')],
    {
      tags: [RUBRIQUES_TAG],
      revalidate: 3600,
    },
  )()

// In Live Preview / draft mode we bypass the cache entirely so unpublished
// edits are reflected immediately.
async function resolve(
  segments: string[],
  draft: boolean,
): Promise<ResolvedRoute | null> {
  if (draft) {
    return resolvePath(segments, { draft: true })
  }
  return loadRoute(segments)
}

function routeDescription(route: ResolvedRoute): string | undefined {
  if (route.kind === 'rubrique') {
    return route.rubrique.seo?.metaDescription ?? undefined
  }
  const seo = (route.doc as { seo?: { metaDescription?: string | null } }).seo
  const chapo = (route.doc as { chapo?: string | null }).chapo
  return seo?.metaDescription ?? chapo ?? undefined
}

function routeMetaTitle(route: ResolvedRoute): string {
  if (route.kind === 'rubrique') {
    return route.rubrique.seo?.metaTitle ?? route.rubrique.title
  }
  const seo = (route.doc as { seo?: { metaTitle?: string | null } }).seo
  return seo?.metaTitle ?? route.doc.title
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug = [] } = await params
  const { isEnabled } = await draftMode()
  const route = await resolve(slug, isEnabled)

  if (!route) {
    return {}
  }

  return {
    title: routeMetaTitle(route),
    description: routeDescription(route),
  }
}

/** The concrete gabarits a rubrique node can render through. */
type RubriqueTemplate =
  | 'contact'
  | 'service'
  | 'composed'
  | 'actualites'
  | 'agenda'
  | 'annuaire-mds'
  | 'elus'
  | 'kiosque'
  | 'actes'
  | 'listing'

/**
 * Resolve which gabarit a rubrique renders with. An explicit `template` select
 * on the rubrique wins; `auto` (or an unset/legacy value) falls back to the
 * content-driven heuristics, in the SAME priority order as before:
 * contact → composed landing → actus index → agenda index → annuaire MDS →
 * generic children listing.
 */
function resolveRubriqueTemplate(rubrique: Rubrique): RubriqueTemplate {
  // `template` is added to the Rubriques collection; read defensively so this
  // compiles before payload-types is regenerated.
  const explicit = (rubrique as { template?: string | null }).template
  if (explicit && explicit !== 'auto') {
    return explicit as RubriqueTemplate
  }

  // Index/contact gabarits are matched FIRST so the editorial « service » fiche
  // (which also has structured sections) never hijacks them.
  if (isContactRubrique(rubrique)) return 'contact'
  if (isActualiteIndex(rubrique)) return 'actualites'
  if (isAgendaIndex(rubrique)) return 'agenda'
  if (isAnnuaireMDSRubrique(rubrique)) return 'annuaire-mds'
  // Directory / register gabarits (élus, kiosque, actes) carry editorial sections
  // too, so they MUST be matched before `isServiceRubrique` claims them.
  if (isElusRubrique(rubrique)) return 'elus'
  if (isKiosqueRubrique(rubrique)) return 'kiosque'
  if (isActesRubrique(rubrique)) return 'actes'
  // Editorial « Fiche service / rubrique » (2-col + sommaire ancré) wins over the
  // generic composed landing for any rubrique with structured editorial sections.
  if (isServiceRubrique(rubrique)) return 'service'
  if (rubrique.landing?.length) return 'composed'
  return 'listing'
}

/**
 * Whether the gabarit's own masthead (hero band) renders the fil d'Ariane
 * INSIDE it — in which case the route must NOT also render the strip above, to
 * avoid a duplicate breadcrumb. The RubriqueHero-based gabarits integrate it
 * (listing, contact, and composed pages that lead with a hero block); every
 * other route keeps the route-level strip so the breadcrumb is never missing.
 */
function mastheadOwnsBreadcrumb(route: ResolvedRoute): boolean {
  if (route.kind !== 'rubrique') return false
  const kind = resolveRubriqueTemplate(route.rubrique)
  if (kind === 'listing' || kind === 'contact' || kind === 'service') return true
  if (kind === 'composed') {
    return route.rubrique.landing?.[0]?.blockType === 'hero'
  }
  return false
}

function TemplateForRoute({
  route,
  searchParams,
}: {
  route: ResolvedRoute
  searchParams: SearchParams
}) {
  switch (route.kind) {
    case 'rubrique': {
      // The editor may force a gabarit via the rubrique's `template` select; an
      // unset/`auto` value falls back to the content-driven heuristics. Keeping
      // the same ordering as the auto resolver guarantees identical behaviour
      // for legacy rubriques that have no explicit template.
      const kind = resolveRubriqueTemplate(route.rubrique)
      switch (kind) {
        case 'contact':
          // Dedicated contact gabarit: fixed coordinates/map/legal chrome, plus
          // the rubrique's own landing blocks for the contact form.
          return <ContactTemplate rubrique={route.rubrique} />
        case 'service':
          // « Fiche service / rubrique » : 2 colonnes, sommaire ancré (DSFR),
          // sections rythmées + FAQ accordéon + contacts en colonne latérale.
          return <RubriqueServiceTemplate rubrique={route.rubrique} />
        case 'composed':
          return <BlockRenderer rubrique={route.rubrique} />
        case 'actualites':
          // « Toutes les actus » listing gabarit (T6), driven by URL search params.
          return (
            <ActualiteListingTemplate
              rubrique={route.rubrique}
              searchParams={searchParams}
            />
          )
        case 'agenda':
          // « Agenda » events-listing gabarit (T8), URL-driven like the actus listing.
          return (
            <AgendaListingTemplate
              rubrique={route.rubrique}
              searchParams={searchParams}
            />
          )
        case 'annuaire-mds':
          // « Maisons de la solidarité » annuaire gabarit — URL-filterable directory.
          return (
            <AnnuaireMDSTemplate
              rubrique={route.rubrique}
              searchParams={searchParams}
            />
          )
        case 'elus':
          // « Les élus du Département » — trombinoscope filtrable (groupe + recherche).
          return (
            <ElusTemplate rubrique={route.rubrique} searchParams={searchParams} />
          )
        case 'kiosque':
          // « Touraine le Mag + kiosque » — archive des numéros (année + recherche).
          return (
            <KiosqueTemplate rubrique={route.rubrique} searchParams={searchParams} />
          )
        case 'actes':
          // « Les actes administratifs » — registre filtrable + paginé.
          return (
            <ActesTemplate rubrique={route.rubrique} searchParams={searchParams} />
          )
        case 'listing':
        default:
          return <RubriqueListingTemplate rubrique={route.rubrique} />
      }
    }
    case 'article':
      // Une fiche démarche (article `type: 'demarche'`) a son propre gabarit
      // (étapes, pièces, contacts) ; l'article éditorial garde ArticleTemplate.
      return route.doc.type === 'demarche' ? (
        <DemarcheTemplate doc={route.doc} rubrique={route.rubrique} />
      ) : (
        <ArticleTemplate doc={route.doc} rubrique={route.rubrique} />
      )
    case 'page':
      return <PageTemplate doc={route.doc} rubrique={route.rubrique} />
    case 'actualite':
      return (
        <ActualiteDetailTemplate doc={route.doc} rubrique={route.rubrique} />
      )
    case 'evenement':
      return (
        <EvenementDetailTemplate doc={route.doc} rubrique={route.rubrique} />
      )
    case 'breve':
      return <BreveDetailTemplate doc={route.doc} rubrique={route.rubrique} />
    default:
      return null
  }
}

export default async function CatchAllPage({ params, searchParams }: PageProps) {
  const { slug = [] } = await params
  const resolvedSearchParams = await searchParams
  const { isEnabled } = await draftMode()
  const route = await resolve(slug, isEnabled)

  if (!route) {
    notFound()
  }

  // When the gabarit's hero integrates the fil d'Ariane (RubriqueHero family),
  // the route skips its own strip so the masthead reads as a single cohesive
  // band rather than a white strip stacked above a dark hero.
  const heroHasBreadcrumb = mastheadOwnsBreadcrumb(route)

  return (
    <>
      <main className="bg-surface-page">
        {/* Charte filet — rainbow accent at the very top of the page (decorative). */}
        <span aria-hidden="true" className="filet-rainbow block" />
        {heroHasBreadcrumb ? null : (
          <Container className="pb-2 pt-6">
            <Breadcrumb
              crumbs={route.rubrique.breadcrumbs ?? []}
              currentTitle={route.rubrique.title}
              tone="default"
            />
          </Container>
        )}
        <TemplateForRoute route={route} searchParams={resolvedSearchParams} />
      </main>
    </>
  )
}
