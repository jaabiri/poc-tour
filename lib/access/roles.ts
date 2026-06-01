import type { RbacGroupe, RbacRequest, RbacUser } from './types'
import { relId } from './types'
import { getAllowedBranchIds, GROUPES_SLUG } from './branches'

/**
 * Coarse role predicates. These are pure attribute checks on the user document;
 * the fine-grained branch scoping lives in branches.ts / factories.ts.
 */

/**
 * Administrateur principal — full, unconditional access. Every access factory
 * short-circuits to `true` for this role, and users/groupes management is gated
 * on it exclusively (see `adminOnly`).
 */
export const isAdmin = (user: RbacUser | null | undefined): boolean =>
  Boolean(user) && user?.role === 'administrateur-principal'

/** Validateur — may move content to `published` on its branches (ADR-0002). */
export const isValidateur = (user: RbacUser | null | undefined): boolean =>
  Boolean(user) && user?.role === 'validateur'

/** Contributeur — branch-scoped author; self-publish only if a groupe grants it. */
export const isContributeur = (user: RbacUser | null | undefined): boolean =>
  Boolean(user) && user?.role === 'contributeur'

/** Any authenticated back-office user of the `users` collection. */
export const isAuthenticated = (user: RbacUser | null | undefined): boolean =>
  Boolean(user)

/**
 * Whether the user holds the publish right on a given set of branch ids (the
 * document's `rubriques`).
 *
 * The rule depends on BOTH the role and the per-groupe grant (ADR-0002):
 *
 *   - **Administrateur principal** → always (handled by the early return).
 *   - **Validateur** → may publish on any branch one of their groupes COVERS
 *     (root or descendant). Validating & publishing pending content on their
 *     branches IS their role, so the groupe's `canPublish` flag is not required.
 *   - **Contributeur** (and any other non-admin) → may publish only on a branch
 *     covered by a groupe that ALSO grants `canPublish` ("contributeur autonome").
 *     Otherwise they submit the content « en attente de validation ».
 *
 * "Covers" means: one of the groupe's branch roots is the target, OR the target
 * descends from a root. We expand each candidate groupe with the shared BFS
 * (request-cached, so this stays cheap on a shallow tree).
 *
 * @param branchIds rubrique ids the document is attached to (its `rubriques`),
 *                  as strings. Admins bypass this check entirely; an empty set
 *                  is never publishable by a non-admin.
 */
export const canPublishOnBranch = async (
  user: RbacUser | null | undefined,
  branchIds: Iterable<string>,
  req: RbacRequest,
): Promise<boolean> => {
  if (!user) return false
  if (isAdmin(user)) return true

  const targets = new Set<string>(branchIds)
  if (targets.size === 0) return false

  const validateur = isValidateur(user)

  for (const g of user.groupes ?? []) {
    let groupe: RbacGroupe | null = null

    if (g && typeof g === 'object' && 'branches' in g) {
      groupe = g as RbacGroupe
    } else {
      const id = relId(g)
      if (!id) continue
      groupe = (await req.payload.findByID({
        collection: GROUPES_SLUG,
        id,
        depth: 0,
        req,
      })) as unknown as RbacGroupe
    }

    if (!groupe) continue

    // Does this groupe cover (root or descendant) any of the target branches?
    const coverage = await expandGroupeCoverage(groupe, req)
    let covers = false
    for (const target of targets) {
      if (coverage.has(target)) {
        covers = true
        break
      }
    }
    if (!covers) continue

    // Covered: a Validateur publishes on its branches; a Contributeur needs the
    // covering groupe to explicitly grant the self-publish right.
    if (validateur) return true
    if (groupe.canPublish) return true
  }

  return false
}

/**
 * Expand one groupe's branch roots to all descendant rubrique ids. Thin wrapper
 * that funnels through getAllowedBranchIds-style BFS but scoped to a single
 * groupe. We build a one-groupe pseudo-user and rely on the shared expander.
 */
const expandGroupeCoverage = async (
  groupe: RbacGroupe,
  req: RbacRequest,
): Promise<Set<string>> => {
  const pseudoUser: RbacUser = {
    // A negative/synthetic id so it never collides with a real cached user.
    id: `groupe:${groupe.id}`,
    role: 'contributeur',
    groupes: [groupe],
  }
  return getAllowedBranchIds(pseudoUser, req)
}
