import type { Block } from 'payload'

/**
 * eventPraticalInfo — « Infos pratiques » d'un événement (gabarit Détail T7).
 * Repeater label/valeur (accès, tarif, public, accessibilité PMR, stationnement…)
 * avec une icône optionnelle par ligne. Affiché aussi bien en pleine largeur
 * dans la colonne principale qu'en encart dans la sidebar « Infos pratiques ».
 */
export const EventPraticalInfo: Block = {
  slug: 'eventPraticalInfo',
  interfaceName: 'EventPraticalInfoBlock',
  labels: { singular: 'Infos pratiques', plural: 'Infos pratiques' },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Titre',
      admin: { description: 'Optionnel — défaut « Infos pratiques ».' },
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      label: 'Lignes',
      labels: { singular: 'Ligne', plural: 'Lignes' },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'icon',
              type: 'select',
              label: 'Icône',
              defaultValue: 'info',
              admin: { width: '30%' },
              options: [
                { label: 'Info', value: 'info' },
                { label: 'Tarif (billet)', value: 'briefcase' },
                { label: 'Public', value: 'hand-heart' },
                { label: 'Accessibilité PMR', value: 'accessibility' },
                { label: 'Accès / transport', value: 'map-pinned' },
                { label: 'Horaires', value: 'clock' },
                { label: 'Contact', value: 'phone' },
              ],
            },
            {
              name: 'label',
              type: 'text',
              required: true,
              label: 'Intitulé',
              admin: { width: '70%', placeholder: 'Tarif' },
            },
          ],
        },
        {
          name: 'value',
          type: 'textarea',
          required: true,
          label: 'Valeur',
          admin: { placeholder: 'Gratuit, sur inscription' },
        },
      ],
    },
  ],
}

export default EventPraticalInfo
