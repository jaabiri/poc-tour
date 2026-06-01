import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { CollectionConfig } from 'payload'

import { safeRevalidateTag, ROUTE_TAG } from '@/lib/revalidate'

import {
  RUBRIQUES_SLUG,
  branchScopedCreate,
  branchScopedDelete,
  branchScopedUpdate,
} from '@/lib/access'

/**
 * media — bibliothèque de fichiers (images, PDF du kiosque « Touraine le Mag »,
 * audio/podcasts, vidéos). Référencée par tous les gabarits (site-tree §7) :
 * visuels d'actualités/événements, DownloadList (T3), ogImage (seoGroup), etc.
 *
 * Stockage : disque local (./media à la racine du dépôt) pour le POC. En
 * production ce répertoire bascule sur l'objet S3 souverain (ADR-0003) via le
 * plugin de stockage, sans toucher cette collection.
 *
 * Accès :
 *   - read : PUBLIC (les fichiers sont servis au front-office sans session) ;
 *   - create/update/delete : branch-scoped (un contributeur ne gère que les
 *     médias rattachés à ses branches) ou Administrateur principal.
 * NB : les fichiers d'upload n'ont pas de champ `rubriques` propre ; on filtre
 * sur les rubriques du média (champ `rubriques` ci-dessous, optionnel) pour
 * rester cohérent avec les helpers branch-scoped des collections de contenu.
 *
 * Historisation (verrou exclusif + versions) : drafts activés ; le verrouillage
 * de document est natif Payload (on ne désactive pas `lockDocuments`).
 *
 * Revalidation : hooks afterChange/afterDelete → revalidateTag('media') pour
 * purger le cache du front-office à la publication/suppression (revalidation à
 * la demande, CONTEXT.md / site-tree §4).
 */

const dirname = path.dirname(fileURLToPath(import.meta.url))
// collections/ → racine du dépôt → ./media
const staticDir = path.resolve(dirname, '..', 'media')

const MEDIA_TAG = 'media'
// Next 16 : revalidateTag exige un profil de cache. Ces tags ne sont purgés
// qu'à la demande (hooks afterChange/afterDelete), d'où le profil le plus long.
const REVALIDATE_PROFILE = 'max'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Média',
    plural: 'Médias',
  },
  admin: {
    useAsTitle: 'alt',
    description:
      'Images, PDF (kiosque), audio et vidéos. Renseigner le texte alternatif (accessibilité RGAA).',
    group: 'Contenus',
  },
  access: {
    // Front-office public : les médias sont servis sans authentification.
    read: () => true,
    create: branchScopedCreate(),
    update: branchScopedUpdate(),
    delete: branchScopedDelete(),
  },
  // Historisation (CONTEXT.md) : verrou exclusif natif + versions/brouillons.
  versions: {
    drafts: true,
  },
  upload: {
    staticDir,
    // Accessibilité : afficher l'alt en focal/preview admin.
    adminThumbnail: 'thumbnail',
    mimeTypes: [
      'image/*',
      'application/pdf',
      'audio/*',
      'video/*',
    ],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 320,
        height: 240,
        position: 'centre',
      },
      {
        name: 'card',
        width: 640,
        height: 480,
        position: 'centre',
      },
      {
        name: 'tablet',
        width: 1024,
        // hauteur libre pour préserver le ratio
        height: undefined,
        position: 'centre',
      },
      {
        name: 'desktop',
        width: 1920,
        height: undefined,
        position: 'centre',
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      label: 'Texte alternatif',
      admin: {
        description:
          'Description du média pour l’accessibilité (RGAA) et le SEO. Obligatoire.',
      },
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Légende',
      admin: {
        description: 'Légende affichée sous le média (optionnelle).',
      },
    },
    {
      // Pivot branch-scoped (optionnel pour les médias) : permet de restreindre
      // la gestion d'un média aux rubriques de la/des branche(s) concernée(s).
      name: 'rubriques',
      type: 'relationship',
      relationTo: RUBRIQUES_SLUG,
      hasMany: true,
      index: true,
      label: 'Rubrique(s) de rattachement',
      admin: {
        description:
          'Branche(s) qui gèrent ce média (contrôle d’accès en écriture). Vide = média global, géré par l’Administrateur principal.',
      },
    },
  ],
  hooks: {
    afterChange: [
      () => {
        // A media edit/re-upload changes what the route cache embedded at depth 2,
        // so bust the canonical route tag too — not just the (dead) media tag.
        safeRevalidateTag(ROUTE_TAG, REVALIDATE_PROFILE)
        safeRevalidateTag(MEDIA_TAG, REVALIDATE_PROFILE)
      },
    ],
    afterDelete: [
      () => {
        // A media edit/re-upload changes what the route cache embedded at depth 2,
        // so bust the canonical route tag too — not just the (dead) media tag.
        safeRevalidateTag(ROUTE_TAG, REVALIDATE_PROFILE)
        safeRevalidateTag(MEDIA_TAG, REVALIDATE_PROFILE)
      },
    ],
  },
}

export default Media
