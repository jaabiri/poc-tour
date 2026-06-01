import type { Block } from 'payload'

import { EVENEMENT_SLUG } from '@/fields'
import { RUBRIQUES_SLUG } from '@/lib/access'

/**
 * Agenda — lists `evenement` documents (T8, accueil). Auto-queries upcoming
 * events (optionally scoped to rubrique branches) or pins a manual selection.
 * Powers "Agenda à la une" and thematic agendas off the single `evenement`
 * collection.
 */
export const Agenda: Block = {
  slug: 'agenda',
  interfaceName: 'AgendaBlock',
  labels: { singular: 'Agenda', plural: 'Agendas' },
  fields: [
    { name: 'title', type: 'text', label: 'Titre' },
    {
      name: 'mode',
      type: 'select',
      label: 'Mode',
      defaultValue: 'auto',
      options: [
        { label: 'Événements à venir (auto)', value: 'auto' },
        { label: 'Événements sélectionnés', value: 'manual' },
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
        description: 'Limiter aux événements rattachés à ces branches.',
      },
    },
    {
      name: 'items',
      type: 'relationship',
      relationTo: EVENEMENT_SLUG,
      hasMany: true,
      label: 'Événements',
      admin: { condition: (_, sibling) => sibling?.mode === 'manual' },
    },
    {
      name: 'limit',
      type: 'number',
      label: "Nombre d'événements",
      defaultValue: 6,
      admin: { condition: (_, sibling) => sibling?.mode === 'auto' },
    },
  ],
}
