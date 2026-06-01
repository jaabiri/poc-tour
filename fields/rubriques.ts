import type { Field } from 'payload'

import { RUBRIQUES_SLUG } from '@/lib/access'

/**
 * rubriquesRelation — the many-to-many link from a content document to one or
 * more rubriques (transversal attachment, CCTP « Un contenu maîtrisé »).
 *
 * This relationship is the pivot the branch-scoped ABAC filters on: a document
 * is visible/editable to a contributeur iff its `rubriques` intersect the
 * branches that contributeur is granted. It is therefore REQUIRED — content with
 * no rubrique cannot be placed in the tree, routed, or access-checked.
 *
 * The URL is computed from the document's PRIMARY rubrique breadcrumb; ordering
 * of the array (first = primary) is the convention the router relies on.
 */

interface RubriquesRelationOptions {
  /** Override the field name. Default: `rubriques`. */
  name?: string
  /** Make the relation optional (rare; default required per ADR/site-tree). */
  required?: boolean
}

export const rubriquesRelation = (options: RubriquesRelationOptions = {}): Field => ({
  name: options.name ?? 'rubriques',
  type: 'relationship',
  relationTo: RUBRIQUES_SLUG,
  hasMany: true,
  required: options.required ?? true,
  index: true, // every access query filters on this field
  admin: {
    description:
      'Rubrique(s) de rattachement. La première détermine l’URL ; les suivantes ' +
      'permettent un rattachement transversal (le contenu apparaît sous plusieurs branches).',
  },
})
