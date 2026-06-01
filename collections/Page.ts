import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, CollectionBeforeChangeHook, CollectionConfig } from 'payload'
import { revalidateContentChange } from '@/lib/revalidate'

import { blockLibrary } from '@/blocks'
import { publishedFields, rubriquesRelation, seoGroup, slugField } from '@/fields'
import { reviewField } from '@/fields/review'
import { buildPreviewURL } from '@/payload.config'
import { draftsWithAutosave } from '@/lib/versions'
import {
  branchScopedCreate,
  branchScopedDelete,
  branchScopedRead,
  branchScopedUpdate,
  canPublishOnBranch,
  enforceBranchScope,
  relId,
  type RbacUser,
} from '@/lib/access'

/**
 * `page` — Institutional + cartographic pages (gabarits T3 / T12 of
 * docs/site-tree.md §5 & §7). A `page` is a free-form editorial document whose
 * body is a stack of blocks from the shared library; for T12 cartographic pages
 * the editor simply drops a MapEmbed block (intro RichText + MapEmbed) into the
 * layout. Attached transversally to one or more rubriques (the first is the URL
 * one). Drafts/versions give historisation + the brouillon→publié lifecycle, and
 * Payload's native document locking provides the verrou exclusif.
 */

const PAGE_SLUG = 'page'

/** Collect the rubrique ids carried by a doc's `rubriques` field (ids or docs). */
const rubriqueIdsOf = (doc: unknown): string[] => {
  const value = (doc as Record<string, unknown> | null | undefined)?.rubriques
  const list = Array.isArray(value) ? value : value == null ? [] : [value]
  const out: string[] = []
  for (const v of list) {
    const id = relId(v as never)
    if (id) out.push(id)
  }
  return out
}

/**
 * Defence-in-depth publish gate (pairs with branchScopedUpdate's access-level
 * check): refuse to persist a `_status: 'published'` transition unless the user
 * holds publish rights on the page's branches. Admins bypass via canPublishOnBranch.
 */
const enforcePublishRights: CollectionBeforeChangeHook = async ({ data, req }) => {
  if (data?._status !== 'published') return data
  const user = req.user as RbacUser | null | undefined
  const mayPublish = await canPublishOnBranch(user, rubriqueIdsOf(data), req)
  if (!mayPublish) {
    throw new Error("Vous n'avez pas le droit de publier une page sur cette branche.")
  }
  return data
}

/** Extra tags emitted with the canonical route tag: the collection tag + a
 * per-slug tag, for any future per-page cache consumer. */
const pageTags = (slug: unknown): string[] =>
  typeof slug === 'string' ? [PAGE_SLUG, `${PAGE_SLUG}:${slug}`] : [PAGE_SLUG]

// On-demand ISR: only a PUBLISHED change busts the front-office route cache; pure
// draft writes (autosave) are skipped so editing doesn't thrash it.
const revalidatePage: CollectionAfterChangeHook = ({ doc, previousDoc }) => {
  revalidateContentChange({ doc, previousDoc }, pageTags(doc?.slug))
  return doc
}

const revalidatePageDelete: CollectionAfterDeleteHook = ({ doc }) => {
  revalidateContentChange({ doc }, pageTags(doc?.slug))
  return doc
}

export const Page: CollectionConfig = {
  slug: PAGE_SLUG,
  labels: {
    singular: 'Page',
    plural: 'Pages',
  },
  admin: {
    useAsTitle: 'title',
    group: 'Contenus',
    defaultColumns: ['title', 'slug', 'rubriques', '_status', 'updatedAt'],
    description:
      'Pages institutionnelles et cartographiques (T3 / T12). Empilez des blocs ' +
      '(RichText, ImageText, FAQ, MapEmbed…) pour composer la page.',
    // Live Preview (inline editing) + "Aperçu" button → front-office route in
    // draft mode via app/(frontend)/next/preview.
    preview: (doc, { req }) => buildPreviewURL('page', doc, req.payload),
    livePreview: {
      url: ({ data, req }) => buildPreviewURL('page', data, req.payload),
    },
  },
  // Native document locking = verrou exclusif (ADR-0001). Do NOT disable.
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
    // 2) gate the transition to `published` on the branch publish right.
    beforeChange: [enforceBranchScope(), enforcePublishRights],
    afterChange: [revalidatePage],
    afterDelete: [revalidatePageDelete],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Titre',
    },
    slugField(),
    rubriquesRelation(),
    {
      name: 'layout',
      type: 'blocks',
      label: 'Mise en page',
      labels: { singular: 'Bloc', plural: 'Blocs' },
      blocks: blockLibrary,
      admin: {
        description:
          'Blocs composant la page. Pour une page cartographique (T12), ajoutez ' +
          'un bloc MapEmbed.',
      },
    },
    seoGroup(),
    publishedFields(),
    reviewField(),
  ],
}

export default Page
