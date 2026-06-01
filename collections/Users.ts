import type { CollectionConfig } from 'payload'

import { adminOnly, adminOrSelf, GROUPES_SLUG } from '@/lib/access'

/**
 * `users` — the back-office authentication collection (ADR-0002).
 *
 * This is the collection wired into `config.admin.user`: every person who logs
 * into Payload is a `users` document. It is NOT a content collection, so it
 * carries no `rubriques` relation, no block-based body, no drafts/versions and
 * no `revalidateTag` hooks — its rows never render on the front-office. What it
 * DOES own is the editorial identity the branch-scoped ABAC reads from:
 *
 *   - `role`    → the coarse editorial role (`isAdmin`/`isValidateur`/…)
 *   - `groupes` → the groupe-de-redacteurs grants that scope a user to one or
 *                 more rubrique branches (access inherits DOWN the tree)
 *
 * The access helpers duck-type against exactly these two fields, so the
 * `role` option values and the `groupes` relationship MUST stay in sync with
 * `EditorialRole` and `GROUPES_SLUG` from `@/lib/access`.
 *
 * Access: only an Administrateur principal manages accounts; a user may read
 * their own document (`adminOrSelf`). Native document locking (verrou exclusif)
 * stays enabled by default — we do not set `lockDocuments: false`.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  labels: {
    singular: 'Utilisateur',
    plural: 'Utilisateurs',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role'],
    group: 'Administration',
  },
  access: {
    read: adminOrSelf(),
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Nom',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      label: 'Rôle',
      required: true,
      defaultValue: 'contributeur',
      // Values MUST match `EditorialRole` — the access helpers gate on these.
      options: [
        { label: 'Administrateur principal', value: 'administrateur-principal' },
        { label: 'Contributeur', value: 'contributeur' },
        { label: 'Validateur', value: 'validateur' },
      ],
      admin: {
        description:
          "Administrateur principal : accès complet. Contributeur : rédaction sur ses branches (publication seulement si son groupe l'autorise). Validateur : publie les contenus en attente de validation.",
      },
    },
    {
      name: 'groupes',
      type: 'relationship',
      label: 'Groupes de rédacteurs',
      relationTo: GROUPES_SLUG,
      hasMany: true,
      admin: {
        description:
          'Groupes accordant des droits sur une ou plusieurs branches de rubriques (héritage vers le bas de l’arbre).',
      },
    },
  ],
}

export default Users
