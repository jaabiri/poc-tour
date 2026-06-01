import type { Block } from 'payload'

/**
 * eventProgramme — déroulé horaire d'un événement (gabarit Détail T7), rendu en
 * timeline verticale. Repeater d'items { heure, intitulé, intervenant?, lieu? }.
 * L'heure est un simple texte libre (« 9h00 », « 14h–15h30 ») : on n'impose pas
 * un picker pour rester souple sur les formats de programme.
 */
export const EventProgramme: Block = {
  slug: 'eventProgramme',
  interfaceName: 'EventProgrammeBlock',
  labels: { singular: 'Programme', plural: 'Programmes' },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Titre',
      admin: { description: 'Optionnel — défaut « Au programme ».' },
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      label: 'Étapes du programme',
      labels: { singular: 'Étape', plural: 'Étapes' },
      admin: { description: 'Une ligne par moment de la journée (ordre = ordre d’affichage).' },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'time',
              type: 'text',
              required: true,
              label: 'Heure',
              admin: { width: '30%', placeholder: '9h00' },
            },
            {
              name: 'label',
              type: 'text',
              required: true,
              label: 'Intitulé',
              admin: { width: '70%' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'speaker', type: 'text', label: 'Intervenant', admin: { width: '50%' } },
            { name: 'place', type: 'text', label: 'Lieu / salle', admin: { width: '50%' } },
          ],
        },
      ],
    },
  ],
}

export default EventProgramme
