import type { Block } from 'payload'

import { MEDIA_SLUG } from '@/fields'

/**
 * ImageText — a media + prose pair with the image on the left or right. Used to
 * break up T3 editorial pages.
 */
export const ImageText: Block = {
  slug: 'imageText',
  interfaceName: 'ImageTextBlock',
  labels: { singular: 'Image + texte', plural: 'Images + textes' },
  fields: [
    { name: 'image', type: 'upload', relationTo: MEDIA_SLUG, required: true, label: 'Image' },
    { name: 'content', type: 'richText', required: true, label: 'Texte' },
    {
      name: 'imagePosition',
      type: 'select',
      label: "Position de l'image",
      defaultValue: 'left',
      options: [
        { label: 'Image à gauche', value: 'left' },
        { label: 'Image à droite', value: 'right' },
      ],
    },
  ],
}
