import type { Block } from 'payload'

import { EVENEMENT_SLUG } from '@/fields'

/**
 * eventRelated — « Événements liés » en bas de la page événement (gabarit Détail
 * T7). `manual` épingle une sélection ; `auto` requête côté front les prochains
 * événements de la MÊME catégorie (à venir, hors événement courant), dans la
 * limite `limit`.
 */
export const EventRelated: Block = {
  slug: 'eventRelated',
  interfaceName: 'EventRelatedBlock',
  labels: { singular: 'Événements liés', plural: 'Événements liés' },
  fields: [
    { name: 'title', type: 'text', label: 'Titre', admin: { description: 'Optionnel — défaut « À ne pas manquer ».' } },
    {
      name: 'mode',
      type: 'select',
      required: true,
      label: 'Mode',
      defaultValue: 'auto',
      options: [
        { label: 'Automatique (même catégorie, à venir)', value: 'auto' },
        { label: 'Sélection manuelle', value: 'manual' },
      ],
    },
    {
      name: 'events',
      type: 'relationship',
      relationTo: EVENEMENT_SLUG,
      hasMany: true,
      label: 'Événements',
      admin: { condition: (_, siblingData) => siblingData?.mode === 'manual' },
    },
    {
      name: 'limit',
      type: 'number',
      label: 'Nombre maximum',
      defaultValue: 3,
      min: 1,
      max: 6,
      admin: { condition: (_, siblingData) => siblingData?.mode === 'auto' },
    },
  ],
}

export default EventRelated
