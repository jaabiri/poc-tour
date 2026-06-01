import type { PayloadRequest } from 'payload'

/**
 * Shared shapes used by the branch-scoped ABAC helpers.
 *
 * These are intentionally *structural* (duck-typed) rather than imported from
 * the generated `payload-types.ts`. The access helpers are authored BEFORE the
 * real `users` / `groupes` / `rubriques` collections exist, and they must keep
 * compiling as those collections evolve. We only depend on the handful of
 * fields ADR-0002 actually requires:
 *
 *   - users.role          → coarse role gate
 *   - users.groupes       → the groupe-de-redacteurs grants this user holds
 *   - groupes.branches    → the rubrique branch roots a groupe is scoped to
 *   - groupes.canPublish  → whether the groupe grants the publish right
 *   - rubriques.parent    → tree edge used to expand a branch to its descendants
 *
 * When the generated types land, the concrete collections can be assigned to
 * these interfaces structurally (a `User` from payload-types is assignable to
 * `RbacUser` as long as it carries `role` + `groupes`).
 */

/**
 * The four editorial roles defined by ADR-0002. The string literals MUST match
 * the `options[].value` of the `role` select field on the `users` collection.
 */
export type EditorialRole =
  | 'administrateur-principal' // full access, manages users/groupes
  | 'contributeur' // branch-scoped author; self-publish only if groupe grants it
  | 'validateur' // publishes content "en attente de validation" on its branches

/**
 * In Payload a relationship value is either the raw id or the populated doc,
 * depending on `depth`. Access functions frequently run at depth 0, so every
 * helper must tolerate *both* shapes.
 */
export type RelValue<T> = number | string | (T & { id: number | string })

/**
 * Minimal shape of a groupe-de-redacteurs grant. `branches` are the rubrique
 * branch ROOTS the groupe is scoped to; access then inherits DOWN to every
 * descendant. `canPublish` is the publish right toggled per groupe.
 */
export interface RbacGroupe {
  id: number | string
  branches?: RelValue<RbacRubrique>[] | null
  canPublish?: boolean | null
}

/**
 * Minimal shape of a rubrique node. Only the tree edge (`parent`) and the
 * nested-docs `breadcrumbs` are needed to walk ancestry/descendancy.
 */
export interface RbacRubrique {
  id: number | string
  parent?: RelValue<RbacRubrique> | null
  breadcrumbs?: { doc?: RelValue<RbacRubrique> | null }[] | null
}

/**
 * Minimal shape of an authenticated user as seen by the access layer.
 */
export interface RbacUser {
  id: number | string
  role?: EditorialRole | null
  groupes?: RelValue<RbacGroupe>[] | null
  /** Payload sets `collection` on the logged-in user; we only act on `users`. */
  collection?: string
}

/**
 * The `req.user` Payload hands to access functions: our user, `null`, or—
 * defensively—an unknown collection's user. Helpers narrow this themselves.
 */
export type MaybeUser = RbacUser | null | undefined

/** Convenience alias for the request object the helpers cache against. */
export type RbacRequest = PayloadRequest

/**
 * Normalise a relationship value (id OR populated doc) down to its id.
 * Returns a string for stable Set/Map keys regardless of number vs string ids.
 */
export const relId = <T>(value: RelValue<T> | null | undefined): string | null => {
  if (value == null) return null
  if (typeof value === 'object') return String((value as { id: number | string }).id)
  return String(value)
}
