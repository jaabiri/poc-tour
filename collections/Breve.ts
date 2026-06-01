import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
  CollectionSlug,
} from 'payload'
import { revalidateContentChange } from '@/lib/revalidate'

import {
  branchScopedRead,
  branchScopedCreate,
  branchScopedUpdate,
  branchScopedDelete,
  canPublishOnBranch,
  enforceBranchScope,
  relId,
  type RbacUser,
} from '@/lib/access'
import { slugField, rubriquesRelation, seoGroup, publishedFields } from '@/fields'
import { reviewField } from '@/fields/review'
import { buildPreviewURL } from '@/payload.config'
import { draftsWithAutosave } from '@/lib/versions'

/**
 * Breve — short information content (site-tree T9). A « brève » is a brief news
 * item — title, date, a SHORT rich-text body and an optional source link —
 * aggregated into listings and the homepage feed rather than rendered as a full
 * editorial page. Because it is so light, its body is a single native `richText`
 * field (court/bref per T9), not the block-stacked `body` used by richer
 * gabarits (T3/T7).
 *
 * Wiring follows the shared content-collection contract:
 *   - branch-scoped ABAC access via the factory helpers (ADR-0002)
 *   - versions.drafts (historisation + native verrou/document locking)
 *   - many-to-many `rubriques` pivot (transversal attachment; first = URL)
 *   - on-demand revalidation through afterChange / afterDelete → revalidateTag
 *
 * `breve` is not one of the slugs centralised in `@/fields`, so it is declared
 * inline here (cast to CollectionSlug — valid once this collection registers).
 */

/** Forward-referenced slug for this collection (no shared constant exists). */
const BREVE_SLUG = 'breve' as CollectionSlug

// On-demand ISR: a PUBLISHED change busts the canonical front-office route tag
// (plus the collection tag); pure draft writes (autosave) are skipped so an
// editing session doesn't thrash the cache.
const revalidateBreve: CollectionAfterChangeHook = ({ doc, previousDoc }) => {
  revalidateContentChange({ doc, previousDoc }, [BREVE_SLUG])
  return doc
}

const revalidateBreveDelete: CollectionAfterDeleteHook = ({ doc }) => {
  revalidateContentChange({ doc }, [BREVE_SLUG])
  return doc
}

export const Breve: CollectionConfig = {
  slug: BREVE_SLUG,
  labels: {
    singular: 'Brève',
    plural: 'Brèves',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', '_status'],
    group: 'Contenus',
    // Live Preview (inline editing) + "Aperçu" button → front-office route in
    // draft mode via app/(frontend)/next/preview.
    preview: (doc, { req }) => buildPreviewURL('breve', doc, req.payload),
    livePreview: {
      url: ({ data, req }) => buildPreviewURL('breve', data, req.payload),
    },
  },
  // Native drafts/versions: satisfies historisation AND turns on _status
  // (draft|published) read by the branchScopedUpdate publish gate. Document
  // locking (verrou exclusif) is native/automatic — we do NOT disable it.
  // Autosave persists draft edits so Live Preview tracks them (lib/versions.ts).
  versions: draftsWithAutosave,
  access: {
    read: branchScopedRead(),
    create: branchScopedCreate(),
    update: branchScopedUpdate(),
    delete: branchScopedDelete(),
  },
  hooks: {
    // 1) reject incoming rubriques outside the user's branches (create + update);
    // 2) defence-in-depth publish gate: moving a brève to `published` requires
    // the publish right on its branches.
    beforeChange: [
      enforceBranchScope(),
      async ({ req, data, operation }) => {
        if (operation !== 'create' && operation !== 'update') return data
        if (data?._status !== 'published') return data
        const branchIds: string[] = []
        for (const r of data?.rubriques ?? []) {
          const id = relId(r)
          if (id) branchIds.push(id)
        }
        const mayPublish = await canPublishOnBranch(
          req.user as RbacUser | null | undefined,
          branchIds,
          req,
        )
        if (!mayPublish) {
          throw new Error(
            "Vous n'avez pas le droit de publier une brève sur cette ou ces rubrique(s).",
          )
        }
        return data
      },
    ],
    afterChange: [revalidateBreve],
    afterDelete: [revalidateBreveDelete],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Titre',
    },
    slugField(),
    {
      name: 'date',
      type: 'date',
      required: true,
      label: 'Date',
      defaultValue: () => new Date().toISOString(),
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        description: 'Date de la brève (tri et filtres des listings).',
      },
    },
    {
      name: 'body',
      type: 'richText',
      required: true,
      label: 'Texte',
      admin: {
        description: 'Texte court de la brève (T9). Réservé à une information brève.',
      },
    },
    {
      name: 'sourceUrl',
      type: 'text',
      label: 'Lien source',
      admin: {
        description: 'URL de la source / « en savoir plus » (optionnel).',
      },
    },
    rubriquesRelation(),
    seoGroup(),
    publishedFields(),
    reviewField(),
  ],
}

export default Breve
