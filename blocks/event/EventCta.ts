import type { Block } from 'payload'

/**
 * eventCta — rappel d'action sur la page événement (gabarit Détail T7) :
 * inscription/billetterie ou prise de contact. En mode `inscription`, l'URL
 * peut être laissée vide pour réutiliser automatiquement le `registrationUrl`
 * de l'événement (résolu côté front).
 */
export const EventCta: Block = {
  slug: 'eventCta',
  interfaceName: 'EventCtaBlock',
  labels: { singular: 'Rappel d’action', plural: 'Rappels d’action' },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Titre' },
    { name: 'text', type: 'textarea', label: 'Texte' },
    {
      name: 'mode',
      type: 'select',
      required: true,
      label: 'Type',
      defaultValue: 'inscription',
      options: [
        { label: 'Inscription / billetterie', value: 'inscription' },
        { label: 'Contact', value: 'contact' },
      ],
    },
    {
      name: 'url',
      type: 'text',
      label: 'Lien',
      admin: {
        description:
          'Mode inscription : vide = lien d’inscription de l’événement. Mode contact : URL ou mailto:.',
      },
    },
    { name: 'buttonLabel', type: 'text', label: 'Libellé du bouton' },
  ],
}

export default EventCta
