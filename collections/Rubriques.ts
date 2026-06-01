import type {
  Access,
  CollectionConfig,
  Where,
} from 'payload'
import { revalidateContentChange } from '@/lib/revalidate'

import { slugField, seoGroup } from '@/fields'
import { blockLibrary } from '@/blocks'
import { buildPreviewURL } from '@/payload.config'
import { draftsWithAutosave } from '@/lib/versions'
import {
  getAllowedBranchIds,
  isAdmin,
  relId,
  type RbacUser,
} from '@/lib/access'

/**
 * Rubriques — the STRUCTURAL tree of the site (Payload Nested Docs, unlimited depth).
 *
 * Per ADR-0001 / CONTEXT.md / site-tree §1+§7, a rubrique is a *structure-only*
 * node: `title`, `slug`, `visible`, `order`, the `parent` edge (injected by the
 * nested-docs plugin, NOT hand-declared here), an optional `template` override,
 * and an optional block-based `landing` (T2/T11 compose mode). Actual editorial
 * content lives in content collections that attach to rubriques many-to-many;
 * this collection owns no `rubriques` pivot of its own.
 *
 * DEPTH: the CCTP (§"Gestion de l'arborescence") requires the ability to create
 * "autant de rubriques et sous-rubriques que nécessaire … à n'importe quel
 * niveau". The "3 niveaux" figure is a *soft UX recommendation* ("nous
 * souhaitions limiter…") to keep the click count low — NOT a hard cap. We
 * therefore enforce no maximum depth; the 3-level guidance lives only as an
 * admin hint on the `parent` field via the nested-docs plugin / editor docs.
 *
 * Because there is no `rubriques` pivot field here, the branch-scoped *content*
 * factories (branchScopedRead/Update/...) — which filter on such a field — do
 * not apply directly. Instead:
 *   - READ is PUBLIC but limited to `visible` rubriques (the front-office tree),
 *     while authenticated back-office users see everything.
 *   - WRITE is admin OR branch-scoped against the node's OWN id: a contributeur/
 *     validateur may only mutate rubriques that fall within a branch their
 *     groupes grant (the allowed set is already expanded DOWN the tree by the
 *     shared helper).
 */

/**
 * READ access: front-office requests (no user) and any caller see only
 * `visible` rubriques; authenticated back-office users see the whole tree
 * (hidden branches included — "conserver sans afficher", site-tree §8).
 */
const readVisibleOrAuthenticated: Access = ({ req }) => {
  if (req.user) return true
  return { visible: { equals: true } } satisfies Where
}

/**
 * UPDATE/DELETE access: Administrateur principal always; any other authenticated
 * user is constrained to rubriques whose id is within the branches their groupes
 * grant (expanded down the tree). Returning a `Where` gives row-level security:
 * a contributeur can only mutate nodes inside a branch they own.
 */
const adminOrBranchScopedWrite: Access = async ({ req }) => {
  const user = req.user as RbacUser | null | undefined
  if (!user) return false
  if (isAdmin(user)) return true

  const allowed = await getAllowedBranchIds(user, req)
  if (allowed.size === 0) {
    // No granted branch → match nothing.
    return { id: { in: ['__none__'] } } satisfies Where
  }
  return { id: { in: Array.from(allowed) } } satisfies Where
}

/**
 * CREATE access: Payload honours only a BOOLEAN on create (there is no existing
 * doc to filter), so the Where-returning helper above would let ANY authenticated
 * user create a rubrique — including one with zero groupes. We instead gate
 * creation explicitly: admins always; a branch-scoped user may create only UNDER
 * a parent rubrique they're granted (`data.parent` within the allowed set).
 * Creating a new ROOT rubrique (no parent) sits outside every granted branch and
 * is therefore reserved for the Administrateur principal.
 */
const adminOrBranchScopedCreate: Access = async ({ req, data }) => {
  const user = req.user as RbacUser | null | undefined
  if (!user) return false
  if (isAdmin(user)) return true

  const allowed = await getAllowedBranchIds(user, req)
  if (allowed.size === 0) return false

  const parentId = relId((data as { parent?: unknown } | undefined)?.parent as never)
  // Root creation (no parent) is admin-only; otherwise the parent must be owned.
  if (!parentId) return false
  return allowed.has(parentId)
}

export const Rubriques: CollectionConfig = {
  slug: 'rubriques',
  labels: { singular: 'Rubrique', plural: 'Rubriques' },
  admin: {
    useAsTitle: 'title',
    group: 'Structure',
    defaultColumns: ['title', 'slug', 'template', 'visible', 'order'],
    description:
      "Arborescence du site (structure seule, profondeur illimitée — 3 niveaux recommandés pour limiter les clics). Le contenu est rattaché via les collections de contenu.",
    // Live Preview (inline editing) + "Aperçu" button → front-office route in
    // draft mode via app/(frontend)/next/preview.
    preview: (doc, { req }) => buildPreviewURL('rubriques', doc, req.payload),
    livePreview: {
      url: ({ data, req }) => buildPreviewURL('rubriques', data, req.payload),
    },
  },
  // Native versions/drafts → historisation + _status (draft|published). Native
  // document locking (verrou exclusif) stays enabled by default.
  // Autosave persists draft edits so Live Preview tracks them (lib/versions.ts).
  versions: draftsWithAutosave,
  access: {
    read: readVisibleOrAuthenticated,
    create: adminOrBranchScopedCreate,
    update: adminOrBranchScopedWrite,
    delete: adminOrBranchScopedWrite,
  },
  hooks: {
    // On-demand ISR revalidation (CONTEXT.md rendering model): publishing or
    // moving a PUBLISHED rubrique invalidates the cached tree so the change is
    // immediate. Pure draft writes (autosave) are skipped so editing the tree
    // doesn't thrash the front-office cache. COLLECTION_TAG === the route tag.
    afterChange: [
      ({ doc, previousDoc }) => {
        revalidateContentChange({ doc, previousDoc })
        return doc
      },
    ],
    afterDelete: [
      ({ doc }) => {
        revalidateContentChange({ doc })
        return doc
      },
    ],
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
      name: 'visible',
      type: 'checkbox',
      defaultValue: true,
      label: 'Visible',
      admin: {
        position: 'sidebar',
        description:
          'Décochez pour masquer la rubrique sans la supprimer (conserver sans afficher).',
      },
    },
    {
      name: 'order',
      type: 'number',
      label: 'Ordre',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: "Ordre d'affichage parmi les rubriques de même niveau.",
      },
    },
    {
      name: 'icon',
      type: 'select',
      label: 'Icône',
      admin: {
        position: 'sidebar',
        description:
          'Icône affichée sur la carte de cette rubrique dans la landing parente (CardGrid).',
      },
      options: [
        { label: 'Solidarité (mains jointes)', value: 'heart-handshake' },
        { label: 'Enfance / famille (bébé)', value: 'baby' },
        { label: 'Aidants (main cœur)', value: 'hand-heart' },
        { label: 'Handicap (accessibilité)', value: 'accessibility' },
        { label: 'Collèges / éducation', value: 'graduation-cap' },
        { label: 'Culture (théâtre)', value: 'theater' },
        { label: 'Insertion / emploi (mallette)', value: 'briefcase' },
        { label: 'Habitat / logement (bâtiment)', value: 'building' },
        { label: 'Institution (monument)', value: 'landmark' },
        { label: 'Mobilité / lieux (repère)', value: 'map-pin' },
        { label: 'Espaces / bâtiments', value: 'building-2' },
        { label: 'Documents (fiche)', value: 'file-text' },
      ],
    },
    {
      name: 'template',
      type: 'select',
      label: 'Gabarit',
      defaultValue: 'auto',
      admin: {
        position: 'sidebar',
        description:
          "Gabarit utilisé pour afficher cette rubrique. « Automatique » choisit selon le contenu (landing composée si des blocs sont saisis, sinon listing des sous-rubriques, avec détection des pages spéciales). Sélectionnez une valeur précise pour forcer un gabarit.",
      },
      options: [
        { label: 'Automatique (selon le contenu)', value: 'auto' },
        { label: 'Landing composée (blocs)', value: 'composed' },
        { label: 'Listing des sous-rubriques', value: 'listing' },
        { label: 'Fiche service / rubrique éditoriale', value: 'service' },
        { label: 'Listing actualités', value: 'actualites' },
        { label: 'Agenda (événements)', value: 'agenda' },
        { label: 'Annuaire des Maisons de la solidarité', value: 'annuaire-mds' },
        { label: 'Annuaire des élus (trombinoscope)', value: 'elus' },
        { label: 'Kiosque « Touraine le Mag »', value: 'kiosque' },
        { label: 'Registre des actes administratifs', value: 'actes' },
        { label: 'Page « Nous contacter »', value: 'contact' },
      ],
    },
    {
      name: 'landing',
      type: 'blocks',
      label: 'Page de la rubrique',
      blocks: blockLibrary,
      admin: {
        initCollapsed: true,
        description:
          'Composez la landing de la rubrique en empilant des blocs (mode composé). Laisser vide pour un listing automatique des sous-rubriques.',
      },
    },
    seoGroup(),
  ],
}

export default Rubriques
