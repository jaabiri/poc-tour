import type { Access, Where } from 'payload'

import type { MaybeUser, RbacUser } from './types'
import { relId } from './types'
import { getAllowedBranchIds } from './branches'
import { canPublishOnBranch, isAdmin } from './roles'

/**
 * Access FACTORIES — the single tested source of truth for ADR-0002's rule.
 *
 * Each factory returns a Payload `Access` function for one operation. The shape
 * of an Access return value drives Payload differently per op:
 *
 *   - READ  : returning a `Where` filters the result set (row-level security).
 *             Returning `true`/`false` allows/denies wholesale.
 *   - CREATE: there is no existing doc to query, so Payload only honours a
 *             boolean here. We gate creation on "is this user branch-scoped at
 *             all"; the per-doc rubrique check happens in UPDATE-style hooks /
 *             the field-level validation on `rubriques`. (A contributeur with no
 *             groupes cannot create anything.)
 *   - UPDATE/DELETE: returning a `Where` restricts WHICH docs may be mutated to
 *             those whose `rubriques` intersect the allowed branches.
 *
 * All factories short-circuit to `true` for Administrateur principal.
 *
 * The `rubriques` field name is configurable so the same factories serve every
 * content collection (article, actualite, evenement, breve, page, formulaire…)
 * which all carry the many-to-many `rubriques` relationship.
 */

export interface BranchScopedOptions {
  /**
   * Name of the relationship field linking the document to its rubriques.
   * Defaults to `rubriques` (the convention used by `rubriquesRelation`).
   */
  rubriquesField?: string
}

/**
 * Build a Payload `Where` constraining docs to those whose `rubriques`
 * intersect the user's allowed (expanded) branch ids. An empty allowed set
 * yields an impossible filter so the user matches nothing.
 */
const intersectionWhere = (field: string, allowed: Set<string>): Where => {
  if (allowed.size === 0) {
    // No branches → match nothing. `in: []` is treated as "no match"; we use an
    // explicit impossible id to be unambiguous across adapters.
    return { [field]: { in: ['__none__'] } }
  }
  // Payload's `in` on a hasMany relationship matches rows where ANY related id
  // is in the list — exactly the "rubriques intersection" semantics we want.
  return { [field]: { in: Array.from(allowed) } }
}

/** Narrow Payload's `req.user` to our RBAC user (only the `users` collection). */
const asRbacUser = (user: MaybeUser): RbacUser | null => {
  if (!user) return null
  return user as RbacUser
}

/**
 * Pull the rubrique ids off an incoming document's `rubriques` field, tolerating
 * ids or populated docs and the singular/array forms.
 */
const docBranchIds = (doc: unknown, field: string): Set<string> => {
  const out = new Set<string>()
  const value = (doc as Record<string, unknown> | null | undefined)?.[field]
  const list = Array.isArray(value) ? value : value == null ? [] : [value]
  for (const v of list) {
    const id = relId(v as never)
    if (id) out.add(id)
  }
  return out
}

/**
 * READ: admins see everything; branch-scoped users get a row-level `Where`
 * filtering to documents whose rubriques intersect their allowed branches.
 * Unauthenticated requests are denied (false) — back-office collections.
 */
export const branchScopedRead =
  (opts: BranchScopedOptions = {}): Access =>
  async ({ req }) => {
    const field = opts.rubriquesField ?? 'rubriques'
    const user = asRbacUser(req.user)
    if (!user) return false
    if (isAdmin(user)) return true

    const allowed = await getAllowedBranchIds(user, req)
    return intersectionWhere(field, allowed)
  }

/**
 * CREATE: admins always; otherwise allow only branch-scoped users who actually
 * have at least one allowed branch. Payload does not run a Where on create, so
 * the document-level rubrique check is enforced via UPDATE access on subsequent
 * saves and by the required `rubriques` field validation. A contributeur with no
 * groupes (empty allowed set) is denied.
 */
export const branchScopedCreate =
  (_opts: BranchScopedOptions = {}): Access =>
  async ({ req, data }) => {
    const field = _opts.rubriquesField ?? 'rubriques'
    const user = asRbacUser(req.user)
    if (!user) return false
    if (isAdmin(user)) return true

    const allowed = await getAllowedBranchIds(user, req)
    if (allowed.size === 0) return false

    // If the create payload already carries rubriques, enforce that EVERY chosen
    // rubrique is within the user's allowed branches (no smuggling content onto a
    // branch you don't own). When data is absent (e.g. access probe), fall back
    // to "has at least one branch".
    const chosen = docBranchIds(data, field)
    if (chosen.size === 0) return true
    for (const id of chosen) {
      if (!allowed.has(id)) return false
    }
    return true
  }

/**
 * UPDATE: admins always; branch-scoped users may only update docs whose
 * rubriques intersect their allowed branches → return a `Where`.
 *
 * Publishing nuance (ADR-0002): moving a doc to `_status: 'published'` is only
 * permitted when the user holds the publish right on the doc's branches
 * (Validateur always; Contributeur only if a covering groupe grants publish).
 * Access functions cannot see the *incoming* `_status` transition reliably for
 * a list of docs, so the publish gate is enforced per-document here when `data`
 * is present, and is intended to be paired with a beforeChange hook on each
 * content collection that calls `canPublishOnBranch`.
 */
export const branchScopedUpdate =
  (opts: BranchScopedOptions = {}): Access =>
  async ({ req, data }) => {
    const field = opts.rubriquesField ?? 'rubriques'
    const user = asRbacUser(req.user)
    if (!user) return false
    if (isAdmin(user)) return true

    const allowed = await getAllowedBranchIds(user, req)

    // Publish gate: if this update sets status to published, the user must hold
    // publish rights on the document's branches. `data` carries the incoming
    // changes (including `_status` and, when re-attaching, `rubriques`).
    const incomingStatus = (data as Record<string, unknown> | undefined)?._status
    if (incomingStatus === 'published') {
      const branches = docBranchIds(data, field)
      const mayPublish = await canPublishOnBranch(user, branches, req)
      if (!mayPublish) return false
    }

    return intersectionWhere(field, allowed)
  }

/**
 * DELETE: admins always; branch-scoped users may only delete docs whose
 * rubriques intersect their allowed branches → return a `Where`.
 */
export const branchScopedDelete =
  (opts: BranchScopedOptions = {}): Access =>
  async ({ req }) => {
    const field = opts.rubriquesField ?? 'rubriques'
    const user = asRbacUser(req.user)
    if (!user) return false
    if (isAdmin(user)) return true

    const allowed = await getAllowedBranchIds(user, req)
    return intersectionWhere(field, allowed)
  }

/**
 * adminOnly — gate for managing `users` and `groupes`. Only the Administrateur
 * principal may read/create/update/delete identity & permission records.
 */
export const adminOnly: Access = ({ req }) => isAdmin(asRbacUser(req.user))

/**
 * adminOrSelf — useful for the `users` collection so a back-office user can read
 * their OWN account while only admins manage everyone. Returns a Where matching
 * the current user's id for non-admins.
 */
export const adminOrSelf =
  (): Access =>
  ({ req }) => {
    const user = asRbacUser(req.user)
    if (!user) return false
    if (isAdmin(user)) return true
    return { id: { equals: user.id } } as Where
  }
