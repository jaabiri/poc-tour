import type { CollectionBeforeChangeHook } from 'payload'

import type { BranchScopedOptions } from './factories'
import type { RbacUser } from './types'
import { relId } from './types'
import { getAllowedBranchIds } from './branches'
import { canPublishOnBranch, isAdmin } from './roles'

/**
 * Write-side enforcement hooks for the branch-scoped ABAC (ADR-0002).
 *
 * The access *functions* (factories.ts) gate WHICH documents a user may read or
 * mutate (row-level `Where`) and whether a publish is allowed. But two rules can
 * only be enforced once we can see the INCOMING document payload, which Payload
 * exposes in `beforeChange`:
 *
 *   1. Branch-scope of the incoming `rubriques` — a contributeur must not be able
 *      to ATTACH a document to a rubrique outside their granted branches. The
 *      access `create` factory already checks this on create, but `update`
 *      returns a `Where` (it filters which docs are updatable) and cannot, on its
 *      own, reject a payload that re-attaches an editable doc to a foreign branch.
 *      `enforceBranchScope` closes that gap for create AND update.
 *
 *   2. The publish gate lives in each collection's own `beforeChange` (and in the
 *      `branchScopedUpdate` access fn) — see `canPublishOnBranch`.
 *
 * Trusted server operations (Local API without a user, i.e. `overrideAccess`) and
 * the Administrateur principal bypass these hooks.
 */

/** Collect the rubrique ids referenced by `data[field]` (ids or populated docs). */
const collectRubriqueIds = (data: unknown, field: string): string[] => {
  const value = (data as Record<string, unknown> | null | undefined)?.[field]
  const list = Array.isArray(value) ? value : value == null ? [] : [value]
  const ids: string[] = []
  for (const v of list) {
    const id = relId(v as never)
    if (id) ids.push(id)
  }
  return ids
}

/**
 * `enforceBranchScope` — reject any write whose incoming `rubriques` reference a
 * rubrique OUTSIDE the user's allowed (expanded) branches. This is the write-time
 * counterpart of `branchScopedRead/Update`'s row-level filter: it stops a
 * contributeur from *placing* content under a branch they don't own, on both
 * create and update (the access layer alone can't reject this on update).
 *
 * Only runs when the write actually carries the `rubriques` field — a partial
 * update that doesn't touch `rubriques` is left untouched (the stored value
 * already passed this gate when it was first set).
 */
export const enforceBranchScope =
  (opts: BranchScopedOptions = {}): CollectionBeforeChangeHook =>
  async ({ data, req }) => {
    const field = opts.rubriquesField ?? 'rubriques'
    const user = (req.user ?? null) as RbacUser | null

    // Trusted server operations (no authenticated user) and admins bypass.
    if (!user) return data
    if (isAdmin(user)) return data

    // Only validate when this write actually sets `rubriques`.
    if (data == null || !Object.prototype.hasOwnProperty.call(data, field)) return data

    const allowed = await getAllowedBranchIds(user, req)
    const chosen = collectRubriqueIds(data, field)
    for (const id of chosen) {
      if (!allowed.has(id)) {
        throw new Error(
          "Rattachement refusé : vous ne pouvez rattacher ce contenu qu'aux rubriques de vos branches (sous-rubriques comprises).",
        )
      }
    }

    return data
  }

/**
 * `enforcePublishGate` — shared publish gate usable by any content collection's
 * `beforeChange`. Refuses to persist a transition to `_status: 'published'` unless
 * the user holds the publish right on the document's branches
 * (`canPublishOnBranch`: Administrateur principal always; Validateur on branches
 * its groupes cover; Contributeur only if a covering groupe grants `canPublish`).
 *
 * Collections may use this instead of hand-rolling the same check; it is the
 * single source of truth for "who may publish on which branch".
 */
export const enforcePublishGate =
  (opts: BranchScopedOptions = {}): CollectionBeforeChangeHook =>
  async ({ data, req, operation }) => {
    if (operation !== 'create' && operation !== 'update') return data
    if ((data as Record<string, unknown> | undefined)?._status !== 'published') return data

    const field = opts.rubriquesField ?? 'rubriques'
    const user = (req.user ?? null) as RbacUser | null
    if (!user) return data // trusted server operation
    if (isAdmin(user)) return data

    const branches = collectRubriqueIds(data, field)
    const mayPublish = await canPublishOnBranch(user, branches, req)
    if (!mayPublish) {
      throw new Error(
        "Publication refusée : vous n'avez pas le droit de publier sur la ou les rubriques de ce contenu. " +
          'Enregistrez-le « en attente de validation » pour qu’un Validateur le publie.',
      )
    }
    return data
  }
