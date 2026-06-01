import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, CollectionConfig } from 'payload'
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
import {
  slugField,
  rubriquesRelation,
  seoGroup,
  publishedFields,
  EVENEMENT_SLUG,
} from '@/fields'
import { reviewField } from '@/fields/review'
import { eventBlockLibrary } from '@/blocks/event'
import { buildPreviewURL } from '@/payload.config'
import { draftsWithAutosave } from '@/lib/versions'

/**
 * Evenement — events / agenda content (site-tree T7 détail + T8 agenda, also the
 * homepage Agenda section §4). One event carries its own date(s), a location and
 * geo point for the MapEmbed locator (T7), a rich body, a registration CTA and a
 * category used by the agenda filters (T8).
 *
 * Wiring follows the shared content-collection contract:
 *   - branch-scoped ABAC access via the factory helpers (ADR-0002)
 *   - versions.drafts (historisation + native verrou/document locking)
 *   - many-to-many `rubriques` pivot (transversal attachment; first = URL)
 *   - on-demand revalidation through afterChange / afterDelete → revalidateTag
 */

// On-demand ISR: a PUBLISHED change busts the canonical front-office route tag
// (plus the collection tag); pure draft writes (autosave) are skipped so an
// editing session doesn't thrash the cache (publication sans redéploiement).
const revalidateEvenement: CollectionAfterChangeHook = ({ doc, previousDoc }) => {
  revalidateContentChange({ doc, previousDoc }, [EVENEMENT_SLUG])
  return doc
}

const revalidateEvenementDelete: CollectionAfterDeleteHook = ({ doc }) => {
  revalidateContentChange({ doc }, [EVENEMENT_SLUG])
  return doc
}

export const Evenement: CollectionConfig = {
  slug: EVENEMENT_SLUG,
  labels: {
    singular: 'Événement',
    plural: 'Événements',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'startDate', 'category', 'featured', '_status'],
    group: 'Contenus',
    // Live Preview (inline editing) + "Aperçu" button → front-office route in
    // draft mode via app/(frontend)/next/preview.
    preview: (doc, { req }) => buildPreviewURL('evenement', doc, req.payload),
    livePreview: {
      url: ({ data, req }) => buildPreviewURL('evenement', data, req.payload),
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
    // 2) defence-in-depth publish gate: moving an event to `published` requires
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
            "Vous n'avez pas le droit de publier un événement sur cette ou ces rubrique(s).",
          )
        }
        return data
      },
    ],
    afterChange: [revalidateEvenement],
    afterDelete: [revalidateEvenementDelete],
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
      type: 'row',
      fields: [
        {
          name: 'startDate',
          type: 'date',
          required: true,
          label: 'Début',
          admin: {
            width: '50%',
            date: { pickerAppearance: 'dayAndTime' },
            description: "Date et heure de début de l'événement.",
          },
        },
        {
          name: 'endDate',
          type: 'date',
          label: 'Fin',
          admin: {
            width: '50%',
            date: { pickerAppearance: 'dayAndTime' },
            description: 'Date et heure de fin (optionnel).',
          },
        },
      ],
    },
    {
      name: 'allDay',
      type: 'checkbox',
      label: 'Toute la journée',
      defaultValue: false,
      admin: {
        description: "Coché : l'événement n'affiche pas d'horaires précis.",
      },
    },
    {
      name: 'location',
      type: 'text',
      label: 'Lieu',
      admin: {
        description: "Nom / intitulé du lieu de l'événement (ex. « Hôtel du Département »).",
      },
    },
    {
      name: 'locationAddress',
      type: 'text',
      label: 'Adresse',
      admin: {
        description: "Adresse postale complète (carte de situation + .ics).",
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Visuel',
      admin: {
        description:
          "Visuel de l'événement (carte agenda + mise « à la une »). Ratio paysage recommandé (16:9).",
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      label: 'Description courte',
      maxLength: 200,
      admin: {
        description:
          "Accroche affichée sur la carte agenda et l'événement à la une (≈ 1–2 phrases).",
      },
    },
    {
      name: 'geo',
      type: 'point',
      label: 'Géolocalisation',
      admin: {
        description: 'Coordonnées du lieu pour le locator cartographique (MapEmbed).',
      },
    },
    {
      name: 'category',
      type: 'select',
      label: 'Catégorie',
      index: true,
      admin: {
        description: "Catégorie utilisée par les filtres de l'agenda.",
      },
      options: [
        { label: 'Culture', value: 'culture' },
        { label: 'Sport', value: 'sport' },
        { label: 'Famille', value: 'famille' },
        { label: 'Environnement', value: 'environnement' },
        { label: 'Institutionnel', value: 'institutionnel' },
        { label: 'Conférence / Réunion', value: 'conference' },
        { label: 'Atelier', value: 'atelier' },
        { label: 'Autre', value: 'autre' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      label: 'Statut',
      defaultValue: 'a-venir',
      admin: {
        position: 'sidebar',
        description: "Badge affiché sur la page événement (« passé » peut rester déduit de la date).",
      },
      options: [
        { label: 'À venir', value: 'a-venir' },
        { label: 'Complet', value: 'complet' },
        { label: 'Passé', value: 'passe' },
      ],
    },
    {
      name: 'registrationUrl',
      type: 'text',
      label: "Lien d'inscription",
      admin: {
        description: "URL d'inscription / billetterie (CTA de la page événement).",
      },
    },
    {
      name: 'layout',
      type: 'blocks',
      label: 'Contenu de la page',
      blocks: eventBlockLibrary,
      admin: {
        description:
          "Blocs modulaires de la page événement (T7) : description, programme, infos pratiques, médias, carte, documents, rappel d'inscription, événements liés.",
      },
    },
    rubriquesRelation(),
    seoGroup(),
    publishedFields(),
    reviewField(),
    {
      name: 'featured',
      type: 'checkbox',
      label: 'À la une',
      defaultValue: false,
      index: true,
      admin: {
        position: 'sidebar',
        description: "Mettre en avant (agenda à la une / page d'accueil).",
      },
    },
  ],
}

export default Evenement
