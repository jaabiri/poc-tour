import 'server-only'

import { getPayloadClient, findRubriqueByPath } from '@/lib/payload'

import type {
  Rubrique,
  Article,
  Actualite,
  Evenement,
  Breve,
  Page,
} from '@/payload-types'

/**
 * Content-by-URL resolution against the rubriques arborescence.
 *
 * The catch-all front-office route (`app/(frontend)/[...slug]`) hands us the URL
 * segments; we turn them into either a rubrique (a structural node with its own
 * landing) or a single content document hanging off a rubrique (article, page,
 * actualité, événement, brève). The convention is `…/<rubrique-path>/<doc-slug>`:
 * the parent path identifies the owning rubrique, the last segment is the doc.
 *
 * Reuse: `findRubriqueByPath` (lib/payload.ts) already does the exact,
 * breadcrumb-aware rubrique lookup with front-office `read` access, so we layer
 * the content lookup on top of it instead of re-walking the tree.
 *
 * Drafts: when `opts.draft` is true (Live Preview), we pass `draft: true` AND
 * `overrideAccess: true` so unpublished versions resolve even without a `user`
 * on `req`; otherwise the front-office sees published content only.
 */

/** A resolved route — a rubrique node, or a content doc + its owning rubrique. */
export type ResolvedRoute =
  | { kind: 'rubrique'; rubrique: Rubrique }
  | { kind: 'article'; doc: Article; rubrique: Rubrique }
  | { kind: 'actualite'; doc: Actualite; rubrique: Rubrique }
  | { kind: 'evenement'; doc: Evenement; rubrique: Rubrique }
  | { kind: 'breve'; doc: Breve; rubrique: Rubrique }
  | { kind: 'page'; doc: Page; rubrique: Rubrique }

/**
 * The content collections probed for a leaf slug, in priority order. The order
 * is significant: the first collection holding a matching doc under the parent
 * rubrique wins, so a slug clash resolves deterministically (pages first). The
 * `kind` discriminant doubles as the collection slug, so it is the single
 * source of truth here.
 */
const CONTENT_COLLECTIONS = [
  'page',
  'article',
  'actualite',
  'evenement',
  'breve',
] as const

/**
 * Resolve URL segments to a rubrique or to a content doc under a rubrique.
 *
 * Strategy:
 *  1. Try the whole path as a rubrique (`findRubriqueByPath`). A hit → rubrique.
 *  2. Otherwise, if there are ≥ 2 segments, treat the last as a doc slug and the
 *     rest as its owning rubrique path. Resolve the parent rubrique, then probe
 *     the content collections (in `CONTENT_COLLECTIONS` order) for a doc with
 *     that slug related to that rubrique. First hit wins.
 *  3. No match → `null` (the route turns that into `notFound()`).
 */
export async function resolvePath(
  segments: string[],
  opts?: { draft?: boolean },
): Promise<ResolvedRoute | null> {
  const draft = opts?.draft ?? false

  // 1) The path may be a rubrique node in its own right. Thread `draft` so Live
  //    Preview resolves the unpublished rubrique version, not the published one.
  const rubrique = await findRubriqueByPath(segments, { draft })
  if (rubrique) return { kind: 'rubrique', rubrique }

  // 2) `…/<rubrique-path>/<doc-slug>` — needs at least a parent + a leaf.
  if (segments.length < 2) return null

  const parent = await findRubriqueByPath(segments.slice(0, -1), { draft })
  if (!parent) return null

  const leaf = segments[segments.length - 1]
  const payload = await getPayloadClient()

  for (const kind of CONTENT_COLLECTIONS) {
    const { docs } = await payload.find({
      collection: kind,
      where: {
        and: [{ slug: { equals: leaf } }, { rubriques: { in: [parent.id] } }],
      },
      draft,
      // Live Preview resolves unpublished drafts that front-office access hides.
      overrideAccess: draft ? true : undefined,
      depth: 2,
      limit: 1,
      pagination: false,
    })

    const doc = docs[0]
    if (doc) {
      // `kind` is the literal discriminant; the doc shape matches it by slug.
      return { kind, doc, rubrique: parent } as ResolvedRoute
    }
  }

  // 3) Nothing matched the leaf under this rubrique.
  return null
}
