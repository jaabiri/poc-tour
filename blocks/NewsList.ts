import type { Block } from 'payload'

import { ACTUALITE_SLUG } from '@/fields'
import { RUBRIQUES_SLUG } from '@/lib/access'

/**
 * NewsList — lists `actualite` documents (T2 landings, accueil, T6). Either pins
 * specific actualités or auto-queries the latest, optionally filtered to one or
 * more rubrique branches so a section shows only its own news.
 */
export const NewsList: Block = {
  slug: 'newsList',
  interfaceName: 'NewsListBlock',
  labels: { singular: 'Liste d’actualités', plural: 'Listes d’actualités' },
  fields: [
    { name: 'title', type: 'text', label: 'Titre' },
    {
      name: 'mode',
      type: 'select',
      label: 'Mode',
      defaultValue: 'auto',
      options: [
        { label: 'Dernières actualités (auto)', value: 'auto' },
        { label: 'Actualités sélectionnées', value: 'manual' },
      ],
    },
    {
      name: 'filterRubriques',
      type: 'relationship',
      relationTo: RUBRIQUES_SLUG,
      hasMany: true,
      label: 'Filtrer par rubriques',
      admin: {
        condition: (_, sibling) => sibling?.mode === 'auto',
        description: 'Limiter aux actualités rattachées à ces branches.',
      },
    },
    {
      name: 'items',
      type: 'relationship',
      relationTo: ACTUALITE_SLUG,
      hasMany: true,
      label: 'Actualités',
      admin: { condition: (_, sibling) => sibling?.mode === 'manual' },
    },
    {
      name: 'limit',
      type: 'number',
      label: "Nombre d'actualités",
      defaultValue: 6,
      admin: { condition: (_, sibling) => sibling?.mode === 'auto' },
    },
  ],
}
