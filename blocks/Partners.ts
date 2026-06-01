import type { Block } from 'payload'

import { MEDIA_SLUG } from '@/fields'

/**
 * Partners — a row/grid of partner logos with optional links. Used on landings
 * and institutional pages.
 */
export const Partners: Block = {
  slug: 'partners',
  interfaceName: 'PartnersBlock',
  labels: { singular: 'Partenaires', plural: 'Partenaires' },
  fields: [
    { name: 'title', type: 'text', label: 'Titre' },
    {
      name: 'partners',
      type: 'array',
      required: true,
      label: 'Partenaires',
      labels: { singular: 'Partenaire', plural: 'Partenaires' },
      fields: [
        { name: 'name', type: 'text', required: true, label: 'Nom' },
        { name: 'logo', type: 'upload', relationTo: MEDIA_SLUG, required: true, label: 'Logo' },
        { name: 'url', type: 'text', label: 'Lien' },
      ],
    },
  ],
}
