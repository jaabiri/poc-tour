import type { Block } from 'payload'

import { MEDIA_SLUG } from '@/fields'

/**
 * DownloadList — downloadable files (PDF, podcasts, videos). Drives T3 « fichiers
 * téléchargeables », T4 « pièces à fournir », charte graphique, kiosque, etc.
 * Each item points at a `media` upload with an optional override label.
 */
export const DownloadList: Block = {
  slug: 'downloadList',
  interfaceName: 'DownloadListBlock',
  labels: { singular: 'Liste de téléchargements', plural: 'Listes de téléchargements' },
  fields: [
    { name: 'title', type: 'text', label: 'Titre' },
    {
      name: 'files',
      type: 'array',
      required: true,
      label: 'Fichiers',
      labels: { singular: 'Fichier', plural: 'Fichiers' },
      fields: [
        { name: 'file', type: 'upload', relationTo: MEDIA_SLUG, required: true, label: 'Fichier' },
        {
          name: 'label',
          type: 'text',
          label: 'Libellé',
          admin: { description: 'Libellé affiché (vide = nom du fichier).' },
        },
      ],
    },
  ],
}
