import type { Block } from 'payload'

import { MEDIA_SLUG } from '@/fields'

/**
 * Hero — large header visual with headline, optional chapô, background image and
 * up to two call-to-action links. Used by T1 (accueil), T2/T11 landings and the
 * top of editorial pages (T3/T4). SCHEMA ONLY — the React component lives apart.
 */
export const Hero: Block = {
  slug: 'hero',
  interfaceName: 'HeroBlock',
  labels: { singular: 'Hero', plural: 'Hero' },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Titre' },
    { name: 'subtitle', type: 'textarea', label: 'Sous-titre / chapô' },
    { name: 'image', type: 'upload', relationTo: MEDIA_SLUG, label: 'Image de fond' },
    {
      name: 'ctas',
      type: 'array',
      maxRows: 2,
      label: "Boutons d'action",
      labels: { singular: 'Bouton', plural: 'Boutons' },
      fields: [
        { name: 'label', type: 'text', required: true, label: 'Libellé' },
        { name: 'url', type: 'text', required: true, label: 'Lien' },
      ],
    },
  ],
}
