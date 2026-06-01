import type { Block } from 'payload'

import { RUBRIQUES_SLUG } from '@/lib/access'

/**
 * RelatedLinks — "liens utiles" / "démarches liées". A mix of internal rubrique
 * links and free external URLs, present on most templates (T2/T3/T4/T5/T7).
 */
export const RelatedLinks: Block = {
  slug: 'relatedLinks',
  interfaceName: 'RelatedLinksBlock',
  labels: { singular: 'Liens utiles', plural: 'Liens utiles' },
  fields: [
    { name: 'title', type: 'text', label: 'Titre' },
    {
      name: 'links',
      type: 'array',
      required: true,
      label: 'Liens',
      labels: { singular: 'Lien', plural: 'Liens' },
      fields: [
        {
          name: 'type',
          type: 'select',
          label: 'Type de lien',
          defaultValue: 'internal',
          options: [
            { label: 'Rubrique interne', value: 'internal' },
            { label: 'URL externe', value: 'external' },
          ],
        },
        {
          name: 'rubrique',
          type: 'relationship',
          relationTo: RUBRIQUES_SLUG,
          label: 'Rubrique',
          admin: { condition: (_, sibling) => sibling?.type === 'internal' },
        },
        {
          name: 'label',
          type: 'text',
          label: 'Libellé',
          admin: { description: 'Libellé affiché (vide = titre de la rubrique).' },
        },
        {
          name: 'url',
          type: 'text',
          label: 'URL externe',
          admin: { condition: (_, sibling) => sibling?.type === 'external' },
        },
      ],
    },
  ],
}
