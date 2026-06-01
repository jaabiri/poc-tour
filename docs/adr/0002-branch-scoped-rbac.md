# Branch-scoped (ABAC) editorial permissions over the rubrique tree

The CCTP requires groups of rédacteurs with rights granted **per rubrique** ("contenus pour lesquels un administrateur lui a donné les droits"), historisation of all changes, and an exclusive lock so two users cannot edit the same resource at once. We implement permissions as **attribute-based access scoped to rubrique branches**, not flat per-collection roles.

A user belongs to one or more **groupes de rédacteurs**; each group grants rights on one or more rubrique branches. Payload **access functions** read those grants and inherit them **down the tree**, filtering each content document by whether its `rubriques` intersect the user's allowed branches. Roles: **Administrateur principal** (full), **Contributeur** (branch-scoped; may self-publish only if the group grants the publish right on that branch), **Validateur** (publishes "en attente de validation"). The **verrou exclusif** uses Payload's native document locking; **historisation** uses native versions/drafts.

## Considered Options

- **Branch-scoped ABAC (chosen)** — matches the CCTP's per-rubrique intent and reuses the tree; cost is non-trivial access-function logic and tests.
- **Flat per-collection roles** — trivial in Payload, but a "Sport" contributor could edit "Solidarité" content. Non-conform to the per-rubrique requirement.
- **Ownership-only** — too weak; no shared-section editing or group handoff.

## Consequences

- Access logic is **code-defined** (Payload's model), consistent with ADR-0001's autonomy boundary: changing role *definitions* is a Lot 2 dev task; assigning users to groups/branches is self-serve.
- Every content collection must route reads/writes through the shared branch-scope helper — a single source of truth for the rule, heavily tested.
