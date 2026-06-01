import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionBeforeChangeHook,
  CollectionConfig,
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
} from '@/lib/access'
import {
  slugField,
  rubriquesRelation,
  seoGroup,
  publishedFields,
  MEDIA_SLUG,
} from '@/fields'
import { reviewField } from '@/fields/review'
import { buildPreviewURL } from '@/payload.config'
import { draftsWithAutosave } from '@/lib/versions'

/**
 * Actualite — News (gabarits T5 détail / T6 liste + bloc « Actualités » de
 * l'accueil ; site-tree §5 et §7). Tag, date, visuel, chapô, corps RichText,
 * galerie, rattachement transversal aux rubriques, mise en avant « à la une ».
 *
 * Wiring per the shared contract:
 *  - branch-scoped ABAC access via the factory helpers (ADR-0002) ;
 *  - versions/drafts (_status draft|published) → historisation + verrou natif
 *    (lockDocuments left enabled = on by default) ;
 *  - a beforeChange publish gate (defence in depth alongside branchScopedUpdate) ;
 *  - afterChange/afterDelete → revalidateTag for on-demand ISR (instant publish).
 */

/** Collection tag passed alongside the canonical route tag (CONTEXT.md §4). */
const ACTUALITE_TAG = 'actualite'

/** Collect the rubrique ids attached to a doc (tolerant of ids or populated docs). */
const docRubriqueIds = (doc: unknown): string[] => {
  const value = (doc as Record<string, unknown> | null | undefined)?.rubriques
  const list = Array.isArray(value) ? value : value == null ? [] : [value]
  const ids: string[] = []
  for (const v of list) {
    const id = relId(v as never)
    if (id) ids.push(id)
  }
  return ids
}

/**
 * Defence-in-depth publish gate: refuse to persist a `published` actualité
 * unless the user holds the publish right on the document's rubrique branches.
 * Pairs with branchScopedUpdate's access-level check (ADR-0002).
 */
const enforcePublishRights: CollectionBeforeChangeHook = async ({ data, req, operation }) => {
  if ((operation === 'create' || operation === 'update') && data?._status === 'published') {
    const branches = docRubriqueIds(data)
    const mayPublish = await canPublishOnBranch(req.user, branches, req)
    if (!mayPublish) {
      throw new Error(
        "Publication refusée : vous n'avez pas le droit de publier sur la ou les rubriques de cette actualité.",
      )
    }
  }
  return data
}

/** Extra tags emitted alongside the canonical route tag: the collection tag and
 * a per-slug tag, for any future per-actualité cache consumer. */
const actualiteTags = (slug: unknown): string[] =>
  typeof slug === 'string' ? [ACTUALITE_TAG, `${ACTUALITE_TAG}:${slug}`] : [ACTUALITE_TAG]

// On-demand ISR: only a PUBLISHED change busts the front-office cache; pure draft
// writes (autosave) are skipped so editing doesn't thrash it (CONTEXT.md §4).
const revalidateActualite: CollectionAfterChangeHook = ({ doc, previousDoc }) => {
  revalidateContentChange({ doc, previousDoc }, actualiteTags(doc?.slug))
  return doc
}

/** Same invalidation on deletion so removed actus disappear immediately. */
const revalidateActualiteDelete: CollectionAfterDeleteHook = ({ doc }) => {
  revalidateContentChange({ doc }, actualiteTags(doc?.slug))
  return doc
}

export const Actualite: CollectionConfig = {
  slug: 'actualite',
  labels: {
    singular: 'Actualité',
    plural: 'Actualités',
  },
  admin: {
    useAsTitle: 'title',
    group: 'Contenus',
    defaultColumns: ['title', 'tag', 'date', 'featured', '_status'],
    description:
      'Actualités du Département (détail T5, liste T6, encart « Actualités » de l’accueil).',
    // Live Preview (inline editing) + "Aperçu" button → front-office route in
    // draft mode via app/(frontend)/next/preview.
    preview: (doc, { req }) => buildPreviewURL('actualite', doc, req.payload),
    livePreview: {
      url: ({ data, req }) => buildPreviewURL('actualite', data, req.payload),
    },
  },
  // Branch-scoped ABAC (ADR-0002) — every op routes through the shared factories.
  access: {
    read: branchScopedRead(),
    create: branchScopedCreate(),
    update: branchScopedUpdate(),
    delete: branchScopedDelete(),
  },
  // Native drafts/versions → _status (draft|published), historisation, and
  // native document locking (verrou exclusif) which stays enabled by default.
  // Autosave persists draft edits so Live Preview tracks them (lib/versions.ts).
  versions: draftsWithAutosave,
  hooks: {
    // 1) reject incoming rubriques outside the user's branches (create + update);
    // 2) gate the transition to `published` on the branch publish right.
    beforeChange: [enforceBranchScope(), enforcePublishRights],
    afterChange: [revalidateActualite],
    afterDelete: [revalidateActualiteDelete],
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
      name: 'tag',
      type: 'text',
      label: 'Thème',
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Étiquette thématique (filtre de la liste T6).',
      },
    },
    {
      name: 'date',
      type: 'date',
      label: 'Date',
      required: true,
      index: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
        description: 'Date de publication affichée.',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: MEDIA_SLUG,
      label: 'Visuel principal',
      admin: {
        description: 'Visuel d’en-tête / vignette de liste.',
      },
    },
    {
      name: 'chapo',
      type: 'textarea',
      label: 'Chapô',
      admin: {
        description: 'Accroche courte (résumé en tête d’article et en liste).',
      },
    },
    {
      name: 'body',
      type: 'richText',
      label: 'Corps',
      admin: {
        description: 'Corps de l’actualité (titres, listes, liens, médias).',
      },
    },
    {
      name: 'gallery',
      type: 'array',
      label: 'Galerie',
      labels: { singular: 'Image', plural: 'Images' },
      admin: {
        description: 'Galerie d’images additionnelles.',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: MEDIA_SLUG,
          required: true,
          label: 'Image',
        },
        {
          name: 'caption',
          type: 'text',
          label: 'Légende',
        },
      ],
    },
    rubriquesRelation(),
    {
      name: 'featured',
      type: 'checkbox',
      label: 'À la une',
      defaultValue: false,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Mettre en avant sur la page d’accueil.',
      },
    },
    seoGroup(),
    publishedFields(),
    reviewField(),
  ],
}

export default Actualite
