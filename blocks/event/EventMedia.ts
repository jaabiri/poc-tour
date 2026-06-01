import type { Block } from 'payload'

import { MEDIA_SLUG } from '@/fields'

/**
 * eventMedia — visuel(s) d'un événement (gabarit Détail T7) : une image unique
 * ou une galerie d'uploads avec légende optionnelle. `layout` pilote le rendu
 * front (image pleine largeur vs grille de vignettes).
 */
export const EventMedia: Block = {
  slug: 'eventMedia',
  interfaceName: 'EventMediaBlock',
  labels: { singular: 'Média / galerie', plural: 'Médias / galeries' },
  fields: [
    { name: 'title', type: 'text', label: 'Titre' },
    {
      name: 'layout',
      type: 'select',
      required: true,
      label: 'Affichage',
      defaultValue: 'single',
      options: [
        { label: 'Image unique', value: 'single' },
        { label: 'Galerie', value: 'gallery' },
      ],
    },
    {
      name: 'images',
      type: 'array',
      required: true,
      minRows: 1,
      label: 'Images',
      labels: { singular: 'Image', plural: 'Images' },
      fields: [
        { name: 'image', type: 'upload', relationTo: MEDIA_SLUG, required: true, label: 'Image' },
        { name: 'caption', type: 'text', label: 'Légende' },
      ],
    },
  ],
}

export default EventMedia
