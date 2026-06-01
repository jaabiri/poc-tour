# RBAC — branch-scoped editorial permissions

This is the implementation of [ADR-0002 (Branch-scoped RBAC)](../adr/0002-branch-scoped-rbac.md). The CCTP requires groups of rédacteurs with rights granted **per rubrique**, historisation of all changes, and an exclusive lock. We model permissions as **attribute-based access scoped to rubrique branches** (ABAC), not flat per-collection roles — so a "Sport" contributeur can never edit "Solidarité" content.

**Single source of truth:** all of the rule lives in **`lib/access/`** (imported as `@/lib/access`). Collections never re-implement the rule; they wire the exported factories. This is the heavily-tested module ADR-0002 calls for.

---

## The model in one paragraph

A **user** (`users` collection) has a coarse `role` and belongs to ≥1 **groupe de rédacteurs** (`groupes`). Each groupe grants rights on ≥1 rubrique **branch root** (`groupes.branches`) and optionally the publish right (`groupes.canPublish`). Access **inherits down the tree**: a grant on a branch root covers that root **and every descendant rubrique** (depth ≤ 3). Each content document carries a many-to-many `rubriques` field; a user may see/edit a document iff its `rubriques` **intersect** the user's allowed (expanded) branch set.

---

## Roles

`users.role` (select — values are load-bearing, the helpers gate on them):

| Role (`value`) | Scope | Publish |
|----------------|-------|---------|
| **Administrateur principal** (`administrateur-principal`) | Full, unconditional. Manages users, groupes, and per-group permissions. | Always. |
| **Contributeur** (`contributeur`) | Branch-scoped: only rubriques granted by their groupes (inherited down). | **Self-publish only if** a covering groupe has `canPublish: true` ("contributeur autonome"); otherwise submits for a Validateur. |
| **Validateur** (`validateur`) | Branch-scoped. | Publishes content "en attente de validation" on their branches. |

Role predicates: `isAdmin`, `isValidateur`, `isContributeur`, `isAuthenticated` (`lib/access/roles.ts`).

---

## How a grant becomes an allowed set (down-the-tree inheritance)

`getAllowedBranchIds(user, req)` (`lib/access/branches.ts`):

1. Collect the **branch root ids** directly granted via the user's `groupes[].branches`.
2. Load the (runtime-editable, any-depth) `rubriques` tree, build a `parent → children` adjacency map (using nested-docs `parent`/`breadcrumbs`), and **BFS from each granted root** (visited-guarded, so any depth/cycle terminates) to accumulate every descendant.
3. Return the full set of allowed rubrique ids, **memoised on the request** (keyed by user id) so a single API call never walks the tree twice.

Admins bypass this entirely (callers short-circuit on `isAdmin`).

---

## How the access helpers enforce it

Every **content** collection wires the factories from `@/lib/access` exactly:

```ts
access: {
  read:   branchScopedRead(),    // admin → true; else a Where filtering rubriques ∩ allowed
  create: branchScopedCreate(),  // admin → true; else boolean: deny if no allowed branch / rubriques outside allowed set
  update: branchScopedUpdate(),  // admin → true; else a Where; denies _status:'published' unless canPublishOnBranch
  delete: branchScopedDelete(),  // admin → true; else a Where
}
```

All default to a `rubriques` field name; pass `{ rubriquesField }` only if renamed.

- **READ / UPDATE / DELETE** return a Payload **`Where`** for non-admins → row-level security: `{ rubriques: { in: [...allowed] } }`. An empty allowed set yields an impossible filter (`in: ['__none__']`) → the user matches nothing.
- **CREATE** can only honour a boolean. A branch-scoped user with no allowed branch is denied; if the create payload already carries `rubriques`, **every** chosen rubrique must be within the allowed set (no smuggling content onto a branch you don't own).
- **Publish gate.** `branchScopedUpdate` denies a transition to `_status: 'published'` unless `canPublishOnBranch(user, docBranches, req)` holds. **Defence in depth:** every content collection **also** runs a `beforeChange` hook calling `canPublishOnBranch` with the document's rubrique ids, so the rule holds even on code paths the access layer can't fully see.
- `canPublishOnBranch` (`lib/access/roles.ts`): true iff at least one of the user's groupes has `canPublish: true` **and** covers (root or descendant) one of the target branches. Admins → always true.

The **`users`** and **`groupes`** collections do **not** use the content factories — they are identity/permission records:

| Collection | read | create / update / delete |
|------------|------|--------------------------|
| `users` | `adminOrSelf()` (admin, or a Where `id == self`) | `adminOnly` |
| `groupes` | `adminOnly` | `adminOnly` |

The **`rubriques`** tree is special: READ is public but limited to `visible` (back-office users see all); WRITE is admin **or** branch-scoped against the node's **own id** (a contributeur may only mutate rubriques within a granted branch).

The **`media`** collection: READ public; write branch-scoped via an **optional** `rubriques` pivot (blank media = global, admin-managed).

---

## Verrou exclusif (locking) & historisation (versions)

Mapped straight onto Payload natives — no paid tier, no custom code ([ADR-0001](../adr/0001-headless-payload-over-traditional-cms.md)):

| CCTP requirement | Payload feature | Where |
|------------------|-----------------|-------|
| **Verrou exclusif** (only one user edits a resource at a time) | Native **document locking** (`lockDocuments`, on by default). | Left enabled on every collection — we never set `lockDocuments: false`. |
| **Historisation** (full change history) | Native **versions** (`versions: { drafts: true }`). | Every content collection (`rubriques`, `article`, `actualite`, `evenement`, `breve`, `page`, `media`). |
| **Cycle de vie** brouillon → en attente de validation → publié | `_status` (`draft` \| `published`) from drafts, the validateur step, + the publish gate. | Drafts + `branchScopedUpdate`/`beforeChange` gate. |
| **Publication/dépublication programmable** | `_schedule.publishAt` / `unpublishAt` (`publishedFields()`). | Sidebar on every content collection. |

> `users` and `groupes` keep native document locking but have **no** drafts/versions — a groupe is a live permission record, not editorial content with a publish lifecycle.

---

## Seeded users / groupes matrix

The seed ([seeding.md](seeding.md)) provisions one example per role-and-publish combination so the model is demonstrable end-to-end:

| User (example) | Role | Groupe(s) | Branch root | `canPublish` | Effect |
|----------------|------|-----------|-------------|--------------|--------|
| `admin@cd37.fr` | Administrateur principal | — | (all) | n/a | Full access; manages users/groupes. |
| `sport@cd37.fr` | Contributeur | **Rédaction Sport** | `Sport` | **true** | **Contributeur autonome**: edits *and self-publishes* under "Sport" and its descendants. |
| `enfance@cd37.fr` | Contributeur | **Rédaction Enfance** | `Enfance et famille` | **false** | Edits under "Enfance et famille" but **cannot publish** — submits "en attente de validation". |
| `valid-solid@cd37.fr` | Validateur | **Validation Solidarités** | `L'accompagnement social` (or a parent covering Enfance) | true | **Validateur**: publishes content waiting on the Solidarités branch. |

> Branch roots reference real nodes of the [site tree §3](../site-tree.md#3-arborescence-générale-3-niveaux) ("Sport", "Enfance et famille" under "Mes services au quotidien"). Adjust to your seeded tree.

---

## Worked example — Sport vs Enfance

**Sport (contributeur autonome).** `sport@cd37.fr` belongs to *Rédaction Sport* (`branches: [Sport]`, `canPublish: true`).
- `getAllowedBranchIds` expands `Sport` to `{ Sport, "Je souhaite randonner", "Déposer une demande de subvention", … }`.
- They create an `article` of `type: demarche` attached to "Je souhaite randonner". `branchScopedCreate` allows it (the chosen rubrique is in the allowed set).
- They set `_status: 'published'`. `branchScopedUpdate`'s publish gate calls `canPublishOnBranch` → their groupe has `canPublish: true` and covers the branch → **published immediately**. The `afterChange` hook revalidates the cache tags; the page is live with no redeploy.
- If they tried to attach the article to a "Solidarité" rubrique, `branchScopedCreate` rejects it (rubrique outside the allowed set).

**Enfance (contributeur needing a Validateur).** `enfance@cd37.fr` belongs to *Rédaction Enfance* (`branches: [Enfance et famille]`, `canPublish: false`).
- They edit "J'attends un enfant" (a T4 démarche under "Enfance et famille") — allowed.
- They try to publish. The publish gate runs `canPublishOnBranch`: no covering groupe has `canPublish: true` → **publication refused** (the `beforeChange` hook throws *"Publication refusée…"*). The content stays a draft / "en attente de validation".
- `valid-solid@cd37.fr` (Validateur whose groupe covers the Solidarités/Enfance branch and has `canPublish: true`) opens the document and publishes it. Now `canPublishOnBranch` is satisfied → it goes live.

This is precisely the ADR-0002 distinction: **publish is a per-branch group right**, decoupled from edit access.
