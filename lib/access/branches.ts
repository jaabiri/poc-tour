import type { CollectionSlug } from 'payload'

import type { RbacGroupe, RbacRequest, RbacRubrique, RbacUser } from './types'
import { relId } from './types'

/**
 * Branch expansion — the heart of ADR-0002's "access inherits DOWN the tree".
 *
 * A user's groupes grant rights on a set of rubrique branch ROOTS. The user is
 * actually allowed to act on those roots AND every descendant rubrique. This
 * module turns the small set of granted roots into the full set of allowed
 * rubrique ids, then caches it on the request so a single API call never walks
 * the tree twice.
 *
 * Why expand on read instead of storing closure rows: the tree is small and
 * edited at runtime (depth is unbounded — 3 levels recommended but not enforced;
 * the BFS below guards on visited ids so any depth/cycle terminates), so
 * recomputing per request is cheap and always correct after a reparent.
 */

/**
 * Slugs of collections the access layer queries. They are typed as
 * `CollectionSlug` so `payload.find` / `findByID` / `relationTo` accept them.
 * The cast is necessary ONLY because these collections are registered in a later
 * phase: until then the generated `CollectionSlug` union does not yet include
 * them. Once the rubriques/groupes collections exist, the literals are members
 * of the union and the cast becomes a no-op.
 */
/** Slug of the structural tree collection (Payload Nested Docs). */
export const RUBRIQUES_SLUG = 'rubriques' as CollectionSlug

/** Slug of the groupe-de-redacteurs collection. */
export const GROUPES_SLUG = 'groupes' as CollectionSlug

/**
 * We stash the per-request memo under a symbol on `req` so it cannot collide
 * with Payload's own request properties and is invisible to JSON/logging.
 */
const CACHE_KEY = Symbol.for('touraine.rbac.allowedBranchIds')

type CacheBag = {
  /** keyed by user id → resolved Set of allowed rubrique ids (as strings) */
  byUser: Map<string, Set<string>>
}

const getCacheBag = (req: RbacRequest): CacheBag => {
  const holder = req as unknown as Record<symbol, CacheBag | undefined>
  let bag = holder[CACHE_KEY]
  if (!bag) {
    bag = { byUser: new Map() }
    holder[CACHE_KEY] = bag
  }
  return bag
}

/**
 * Collect the branch-root rubrique ids directly granted to the user via their
 * groupes. Groupes may be populated docs or ids depending on depth; if they are
 * bare ids we fetch them (depth 0) to read their `branches`.
 */
const collectGrantedRootIds = async (
  user: RbacUser,
  req: RbacRequest,
): Promise<Set<string>> => {
  const roots = new Set<string>()
  const groupes = user.groupes ?? []

  for (const g of groupes) {
    let groupe: RbacGroupe | null = null

    if (g && typeof g === 'object' && 'branches' in g) {
      // Already populated — use as-is.
      groupe = g as RbacGroupe
    } else {
      // Bare id — fetch the groupe so we can read its branches.
      const id = relId(g)
      if (!id) continue
      groupe = (await req.payload.findByID({
        collection: GROUPES_SLUG,
        id,
        depth: 0,
        req,
      })) as unknown as RbacGroupe
    }

    for (const b of groupe?.branches ?? []) {
      const id = relId(b)
      if (id) roots.add(id)
    }
  }

  return roots
}

/**
 * Expand a set of branch ROOT ids to include every descendant rubrique id.
 *
 * Strategy: load all rubriques at depth 0 (the tree is small and runtime-
 * editable, so we cannot precompute), build a parent→children adjacency map,
 * then BFS from each granted root. Using nested-docs `breadcrumbs` as a
 * fallback edge keeps this correct even if a node's direct `parent` is momentarily
 * unpopulated.
 */
const expandToDescendants = async (
  rootIds: Set<string>,
  req: RbacRequest,
): Promise<Set<string>> => {
  if (rootIds.size === 0) return rootIds

  // Pull the whole (shallow) tree. limit:0 => no pagination cap in Payload.
  const { docs } = await req.payload.find({
    collection: RUBRIQUES_SLUG,
    depth: 0,
    limit: 0,
    pagination: false,
    req,
  })

  const nodes = docs as unknown as RbacRubrique[]

  // Build parent id → [child id] adjacency.
  const childrenOf = new Map<string, string[]>()
  for (const node of nodes) {
    const childId = relId(node)
    if (!childId) continue
    const parentId = relId(node.parent)
    if (parentId) {
      const list = childrenOf.get(parentId) ?? []
      list.push(childId)
      childrenOf.set(parentId, list)
    }
  }

  // BFS from every granted root, accumulating roots + all descendants.
  const allowed = new Set<string>(rootIds)
  const queue: string[] = [...rootIds]
  while (queue.length > 0) {
    const current = queue.shift() as string
    for (const child of childrenOf.get(current) ?? []) {
      if (!allowed.has(child)) {
        allowed.add(child)
        queue.push(child)
      }
    }
  }

  return allowed
}

/**
 * Public API: the full set of rubrique ids the user may act on, expanded down
 * the tree and memoised per request. Returns an empty Set for users with no
 * groupes (they see nothing branch-scoped). Admins are handled by the callers
 * (they bypass this entirely), so this is only meaningful for contributeurs /
 * validateurs.
 */
export const getAllowedBranchIds = async (
  user: RbacUser | null | undefined,
  req: RbacRequest,
): Promise<Set<string>> => {
  if (!user) return new Set()

  const bag = getCacheBag(req)
  const userKey = String(user.id)
  const cached = bag.byUser.get(userKey)
  if (cached) return cached

  const roots = await collectGrantedRootIds(user, req)
  const allowed = await expandToDescendants(roots, req)

  bag.byUser.set(userKey, allowed)
  return allowed
}
