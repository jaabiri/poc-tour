import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, CollectionBeforeChangeHook, CollectionConfig } from 'payload'
import { revalidateContentChange } from '@/lib/revalidate'

import {
  branchScopedRead,
  branchScopedCreate,
  branchScopedUpdate,
  branchScopedDelete,
  canPublishOnBranch,
  enforceBranchScope,
  relId,
  type RelValue,
} from '@/lib/access'
import {
  slugField,
  rubriquesRelation,
  seoGroup,
  publishedFields,
  MEDIA_SLUG,
} from '@/fields'
import { reviewField } from '@/fields/review'
import { blockLibrary } from '@/blocks'
import { buildPreviewURL } from '@/payload.config'
import { draftsWithAutosave } from '@/lib/versions'

/**
 * `article` — Editorial + démarche pages (gabarits T3 & T4, see site-tree §5/§7).
 *
 * One collection serves both archetypes; the `type` select switches the page's
 * intent:
 *   - `presentation` (T3) — rich institutional editorial: chapô + composed body
 *     (block library) + downloadable files + service contacts.
 *   - `demarche` (T4) — task-oriented « Je veux… » page: the `steps` array drives
 *     the numbered/accordion démarche walkthrough, with downloads (pièces à
 *     fournir) and contacts du service.
 *
 * Per the shared contract:
 *   - access routes through the branch-scoped ABAC factories (ADR-0002);
 *   - `rubriques` (transversal attachment) is the pivot all access filters on,
 *     first rubrique = primary/URL one;
 *   - `versions.drafts` provides the lifecycle status, historisation, and (with
 *     native, non-disabled document locking) the verrou exclusif;
 *   - afterChange/afterDelete hooks trigger on-demand revalidation by tag.
 */

const ARTICLE_SLUG = 'article'


/**
 * Defence-in-depth publish gate (paired with branchScopedUpdate's Where filter):
 * a non-admin may only persist `_status: 'published'` if their groupe grants the
 * publish right on one of the document's rubrique branches. Validateurs publish
 * « en attente de validation »; autonomous contributeurs self-publish.
 */
const enforcePublishRight: CollectionBeforeChangeHook = async ({ data, req }) => {
  if (data?._status !== 'published') return data

  const rubriques: RelValue<unknown>[] = Array.isArray(data.rubriques)
    ? (data.rubriques as RelValue<unknown>[])
    : []
  const branchIds = rubriques
    .map((value) => relId(value))
    .filter((id): id is string => Boolean(id))

  const allowed = await canPublishOnBranch(req.user, branchIds, req)
  if (!allowed) {
    throw new Error(
      "Publication refusée : vous n'avez pas le droit de publier sur la branche de rattachement de cet article.",
    )
  }
  return data
}

// On-demand ISR: bust the front-office route cache (and the collection tag) when
// a PUBLISHED article changes. Draft writes (incl. autosave) are skipped so an
// editing session doesn't purge the cache on every tick (CONTEXT.md rendering).
const revalidateAfterChange: CollectionAfterChangeHook = ({ doc, previousDoc }) => {
  revalidateContentChange({ doc, previousDoc }, [ARTICLE_SLUG])
  return doc
}

const revalidateAfterDelete: CollectionAfterDeleteHook = ({ doc }) => {
  revalidateContentChange({ doc }, [ARTICLE_SLUG])
  return doc
}

export const Article: CollectionConfig = {
  slug: ARTICLE_SLUG,
  labels: { singular: 'Article', plural: 'Articles' },
  admin: {
    useAsTitle: 'title',
    group: 'Contenus',
    defaultColumns: ['title', 'type', 'rubriques', '_status', 'updatedAt'],
    description:
      'Pages éditoriales riches (T3) et pages démarche « Je veux… » (T4).',
    // Live Preview (inline editing) + "Aperçu" button → front-office route in
    // draft mode via app/(frontend)/next/preview.
    preview: (doc, { req }) => buildPreviewURL('article', doc, req.payload),
    livePreview: {
      url: ({ data, req }) => buildPreviewURL('article', data, req.payload),
    },
  },
  // Native document locking (verrou exclusif) — left ON by default; do not disable.
  // Drafts/versions provide the lifecycle status and historisation; autosave
  // persists draft edits so Live Preview tracks them (see lib/versions.ts).
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
    beforeChange: [enforceBranchScope(), enforcePublishRight],
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Titre',
      admin: {
        description:
          "Pour une démarche (T4), exprimer l'intention de l'usager (« J'attends un enfant »).",
      },
    },
    slugField(),
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'presentation',
      label: 'Type de page',
      options: [
        { label: 'Présentation (éditorial)', value: 'presentation' },
        { label: 'Démarche (« Je veux… »)', value: 'demarche' },
      ],
      admin: {
        position: 'sidebar',
        description:
          'Présentation = page éditoriale riche (T3). Démarche = page orientée tâche (T4).',
      },
    },
    rubriquesRelation(),
    {
      name: 'chapo',
      type: 'textarea',
      label: 'Chapô',
      admin: {
        description: "Accroche / résumé affiché sous le titre. Dérive la meta description.",
      },
    },
    {
      name: 'body',
      type: 'blocks',
      label: 'Corps',
      labels: { singular: 'Bloc', plural: 'Blocs' },
      blocks: blockLibrary,
      admin: {
        description: 'Corps de page composé de blocs (RichText, ImageText, FAQ, DownloadList…).',
      },
    },
    {
      name: 'steps',
      type: 'array',
      label: 'Étapes de la démarche',
      labels: { singular: 'Étape', plural: 'Étapes' },
      admin: {
        // T4-specific: the numbered/accordion walkthrough.
        condition: (data) => data?.type === 'demarche',
        description: 'Étapes numérotées de la démarche (gabarit T4).',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          label: 'Titre de l’étape',
        },
        {
          name: 'richText',
          type: 'richText',
          required: true,
          label: 'Contenu de l’étape',
        },
      ],
    },
    {
      name: 'downloads',
      type: 'relationship',
      relationTo: MEDIA_SLUG,
      hasMany: true,
      label: 'Fichiers téléchargeables',
      admin: {
        description: 'PDF, pièces à fournir, documents annexes (DownloadList).',
      },
    },
    {
      name: 'contacts',
      type: 'array',
      label: 'Contacts du service',
      labels: { singular: 'Contact', plural: 'Contacts' },
      admin: {
        description: 'Coordonnées du / des service(s) concerné(s) par cette page.',
      },
      fields: [
        { name: 'name', type: 'text', required: true, label: 'Nom / service' },
        { name: 'role', type: 'text', label: 'Fonction / rôle' },
        { name: 'email', type: 'email', label: 'Courriel' },
        { name: 'phone', type: 'text', label: 'Téléphone' },
        { name: 'address', type: 'textarea', label: 'Adresse' },
      ],
    },
    seoGroup(),
    publishedFields(),
    reviewField(),
  ],
}

export default Article
