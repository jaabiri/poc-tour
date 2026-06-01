import type { Field } from 'payload'

/**
 * publishedFields — scheduled (differed) publish/unpublish dates that complement
 * Payload's native drafts/versions lifecycle.
 *
 * The content lifecycle (CONTEXT.md) is:
 *   brouillon → en attente de validation → publié → archivé → supprimé
 * Payload's `versions.drafts` gives us the `_status` (draft|published) part and
 * the verrou/historisation. These two dates add the CCTP "publication/
 * dépublication programmable" requirement: a Payload job flips visibility at the
 * scheduled time and triggers on-demand revalidation.
 *
 * They live in the sidebar next to the status control.
 */

interface PublishedFieldsOptions {
  /** Field name for the scheduled publish date. Default: `publishAt`. */
  publishAtName?: string
  /** Field name for the scheduled unpublish date. Default: `unpublishAt`. */
  unpublishAtName?: string
}

export const publishedFields = (options: PublishedFieldsOptions = {}): Field => ({
  name: '_schedule',
  type: 'group',
  admin: {
    position: 'sidebar',
    description: 'Publication / dépublication programmée (optionnel).',
  },
  fields: [
    {
      name: options.publishAtName ?? 'publishAt',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        description: 'Rendre public à partir de cette date/heure.',
      },
    },
    {
      name: options.unpublishAtName ?? 'unpublishAt',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        description: 'Retirer de la publication à partir de cette date/heure.',
      },
    },
  ],
})
