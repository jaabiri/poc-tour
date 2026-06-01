import type { CollectionConfig } from 'payload'
import { safeRevalidateTag } from '@/lib/revalidate'

import { adminOnly, GROUPES_SLUG, RUBRIQUES_SLUG } from '@/lib/access'

/**
 * Groupes de rédacteurs — the reusable permission set at the heart of ADR-0002's
 * branch-scoped ABAC. A groupe grants its members rights on one or more rubrique
 * BRANCHES (`branches`, the granted roots — access inherits DOWN the tree) and,
 * via `canPublish`, optionally the self-publish right on those branches.
 *
 * This is an identity/permission collection, NOT branch-scoped content:
 *   - access is `adminOnly` on every operation (only the Administrateur principal
 *     manages who can edit what);
 *   - it carries no `rubriques` pivot and no drafts/versions — a groupe is a live
 *     permission record, not editorial content with a brouillon→publié lifecycle;
 *   - Payload's native document locking (verrou exclusif) stays enabled.
 *
 * The branch-scoped access helpers duck-type against exactly two fields here —
 * the hasMany `branches` relationship to `rubriques` and the `canPublish`
 * checkbox (see lib/access types `RbacGroupe`) — so their names are load-bearing.
 *
 * Mutating a groupe changes who may see/edit which branches, so we invalidate the
 * rubriques cache tag on change/delete to refresh any access-derived rendering.
 */
export const Groupes: CollectionConfig = {
  slug: GROUPES_SLUG,
  labels: {
    singular: 'Groupe de rédacteurs',
    plural: 'Groupes de rédacteurs',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'canPublish', 'branches'],
    description:
      'Ensemble de droits réutilisable : accorde à ses membres des droits sur une ou plusieurs branches de rubriques.',
    group: 'Administration',
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Nom du groupe',
      admin: {
        description: 'Libellé du groupe de rédacteurs (ex. « Rédaction Solidarités »).',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      admin: {
        description: 'À quoi sert ce groupe et qui il concerne (optionnel).',
      },
    },
    {
      name: 'branches',
      type: 'relationship',
      relationTo: RUBRIQUES_SLUG,
      hasMany: true,
      required: true,
      label: 'Branches accordées',
      admin: {
        description:
          'Rubriques racines sur lesquelles ce groupe ouvre des droits. L’accès hérite vers le bas de l’arbre (toutes les sous-rubriques).',
      },
    },
    {
      name: 'canPublish',
      type: 'checkbox',
      defaultValue: false,
      label: 'Autorise la publication',
      admin: {
        description:
          'Si coché, les membres peuvent publier eux-mêmes sur ces branches. Sinon, le contenu reste « en attente de validation ».',
      },
    },
  ],
  hooks: {
    afterChange: [
      () => {
        safeRevalidateTag(RUBRIQUES_SLUG, 'max')
      },
    ],
    afterDelete: [
      () => {
        safeRevalidateTag(RUBRIQUES_SLUG, 'max')
      },
    ],
  },
}

export default Groupes
