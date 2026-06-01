import 'server-only'

import { getPayload, type Payload } from 'payload'
import config from '@payload-config'

import type { Rubrique } from '@/payload-types'
import { RUBRIQUES_SLUG } from '@/lib/access'

/**
 * Front-office Payload binding.
 *
 * A thin, cached server-only client + the tree queries the catch-all route uses
 * to resolve a URL path against the `rubriques` arborescence (CONTEXT.md
 * rendering model: `app/[...slug]` resolves the path against the Payload tree at
 * request time; results are tag-cached and invalidated on-demand by the
 * collections' afterChange/afterDelete `revalidateTag('rubriques')` hooks).
 *
 * These helpers are READ-ONLY and run with no `user` on `req`, so Payload's
 * `read` access on `rubriques` (`readVisibleOrAuthenticated`) already restricts
 * them to `visible` rubriques — the front-office never sees hidden branches.
 */

/**
 * Local Payload instance, memoised across invocations within a server process.
 * `getPayload` is itself idempotent (it caches on the config), but holding the
 * promise here avoids re-awaiting the init handshake on every request.
 */
let cached: Promise<Payload> | null = null

export const getPayloadClient = (): Promise<Payload> => {
  if (!cached) cached = getPayload({ config })
  return cached
}

/**
 * Cache tag the catch-all route caches every resolved page under. Single source
 * of truth lives in lib/revalidate.ts (`ROUTE_TAG`); re-exported here under the
 * historical name the route imports so content hooks and the route agree.
 */
export { ROUTE_TAG as RUBRIQUES_TAG } from '@/lib/revalidate'

/**
 * Normalise a URL path into clean, lower-cased, non-empty segments.
 * Accepts a pre-split array (`params.slug`) or a raw string.
 */
const toSegments = (path: string[] | string): string[] => {
  const raw = Array.isArray(path) ? path : path.split('/')
  return raw
    .flatMap((s) => s.split('/'))
    .map((s) => decodeURIComponent(s).trim())
    .filter((s) => s.length > 0)
}

/**
 * The front-office breadcrumb path of a rubrique, derived from the nested-docs
 * `breadcrumbs` (ancestors + self). We rebuild it from each node's `slug` so it
 * is independent of how `generateURL` was configured, then compare segment by
 * segment. Falls back to the node's own slug when breadcrumbs are absent.
 */
const breadcrumbSlugs = (rubrique: Rubrique): string[] => {
  const crumbs = rubrique.breadcrumbs ?? []
  if (crumbs.length > 0) {
    return crumbs
      .map((c) => {
        const doc = c.doc
        // `doc` may be a populated Rubrique or a bare id; prefer the populated
        // slug, otherwise fall back to parsing the stored `url`.
        if (doc && typeof doc === 'object' && 'slug' in doc) {
          return (doc.slug ?? '') as string
        }
        const url = c.url ?? ''
        const parts = url.split('/').filter(Boolean)
        return parts[parts.length - 1] ?? ''
      })
      .filter((s) => s.length > 0)
  }
  return rubrique.slug ? [rubrique.slug] : []
}

/**
 * Resolve a URL path (e.g. `['le-departement', 'les-missions']`) to the single
 * visible rubrique whose full breadcrumb slug-path matches it exactly.
 *
 * Strategy: match the LAST segment against `slug` (cheap, indexed-ish), populate
 * `breadcrumbs` (depth 2 so ancestor docs carry their `slug`), then keep only the
 * candidate whose rebuilt breadcrumb path equals the requested segments. This is
 * exact and unambiguous even when two branches share a leaf slug.
 *
 * Returns `null` when nothing matches — the route turns that into `notFound()`.
 */
export const findRubriqueByPath = async (
  path: string[] | string,
  opts?: { draft?: boolean },
): Promise<Rubrique | null> => {
  const draft = opts?.draft ?? false
  const segments = toSegments(path)
  if (segments.length === 0) return null

  const leaf = segments[segments.length - 1]
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: RUBRIQUES_SLUG,
    where: { slug: { equals: leaf } },
    depth: 2,
    limit: 50,
    pagination: false,
    // Public front-office reads published structure only; Live Preview passes
    // `draft: true` so unpublished rubrique edits (title, landing blocks,
    // template, visibility, order) resolve in the preview iframe.
    draft,
    // In draft mode the request carries no `user`, so front-office `read` access
    // (visible-only) would hide a not-yet-visible draft; override it for preview.
    overrideAccess: draft ? true : undefined,
  })

  const candidates = docs as unknown as Rubrique[]

  const match = candidates.find((doc) => {
    const docPath = breadcrumbSlugs(doc)
    return (
      docPath.length === segments.length &&
      docPath.every((slug, i) => slug === segments[i])
    )
  })

  return match ?? null
}

/**
 * The full visible rubrique tree, ordered, as flat docs (depth 1 so `parent`
 * carries enough to build a nested menu client-side). Drives the mega-menu,
 * sitemap, and auto-listing landings. Front-office `read` access already filters
 * to `visible: true`.
 */
export const getVisibleTree = async (): Promise<Rubrique[]> => {
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: RUBRIQUES_SLUG,
    depth: 1,
    limit: 0,
    pagination: false,
    sort: 'order',
    draft: false,
  })

  return docs as unknown as Rubrique[]
}
