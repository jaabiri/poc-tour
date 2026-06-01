import type { Block } from 'payload'

import { MEDIA_SLUG } from '@/fields'
import { RUBRIQUES_SLUG } from '@/lib/access'

/**
 * CardGrid — a grid of cards. Two sourcing modes (T2/T11):
 *   - `manual`: editor authors each card (title, text, image, link).
 *   - `rubriques`: auto-build cards from selected sub-rubriques (the landing's
 *     children) so the grid stays in sync as the tree changes.
 */
export const CardGrid: Block = {
  slug: 'cardGrid',
  interfaceName: 'CardGridBlock',
  labels: { singular: 'Grille de cartes', plural: 'Grilles de cartes' },
  fields: [
    { name: 'title', type: 'text', label: 'Titre' },
    {
      name: 'source',
      type: 'select',
      label: 'Source des cartes',
      defaultValue: 'manual',
      options: [
        { label: 'Cartes manuelles', value: 'manual' },
        { label: 'Sous-rubriques', value: 'rubriques' },
      ],
    },
    {
      name: 'rubriques',
      type: 'relationship',
      relationTo: RUBRIQUES_SLUG,
      hasMany: true,
      label: 'Sous-rubriques',
      admin: { condition: (_, sibling) => sibling?.source === 'rubriques' },
    },
    {
      name: 'cards',
      type: 'array',
      label: 'Cartes',
      labels: { singular: 'Carte', plural: 'Cartes' },
      admin: { condition: (_, sibling) => sibling?.source !== 'rubriques' },
      fields: [
        { name: 'title', type: 'text', required: true, label: 'Titre' },
        { name: 'text', type: 'textarea', label: 'Texte' },
        { name: 'image', type: 'upload', relationTo: MEDIA_SLUG, label: 'Image' },
        { name: 'url', type: 'text', label: 'Lien' },
      ],
    },
  ],
}
