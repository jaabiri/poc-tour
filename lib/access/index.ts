/**
 * Branch-scoped ABAC — the single source of truth for ADR-0002's editorial
 * permission rule. Every content collection MUST route its access through these
 * helpers rather than re-implementing the rubrique-intersection logic.
 *
 * Quick map:
 *   - isAdmin / isValidateur / isContributeur — coarse role predicates
 *   - getAllowedBranchIds(user, req) — granted branch roots expanded DOWN the tree
 *   - canPublishOnBranch(user, branchIds, req) — publish-right check per branch
 *   - branchScopedRead/Create/Update/Delete() — Access factories for content
 *   - enforceBranchScope() — beforeChange: reject incoming rubriques out of branch
 *   - enforcePublishGate() — beforeChange: gate _status:'published' by publish right
 *   - adminOnly / adminOrSelf() — gates for users/groupes management
 */

export type {
  EditorialRole,
  RbacUser,
  RbacGroupe,
  RbacRubrique,
  MaybeUser,
  RelValue,
} from './types'
export { relId } from './types'

export {
  getAllowedBranchIds,
  RUBRIQUES_SLUG,
  GROUPES_SLUG,
} from './branches'

export {
  isAdmin,
  isValidateur,
  isContributeur,
  isAuthenticated,
  canPublishOnBranch,
} from './roles'

export {
  branchScopedRead,
  branchScopedCreate,
  branchScopedUpdate,
  branchScopedDelete,
  adminOnly,
  adminOrSelf,
  type BranchScopedOptions,
} from './factories'

export { enforceBranchScope, enforcePublishGate } from './hooks'
