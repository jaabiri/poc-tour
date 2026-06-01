import type { Block } from 'payload'

import { FORMULAIRE_SLUG } from '@/fields'

/**
 * CtaForm — a call-to-action that surfaces an online form (T4 démarches, T10).
 * Links to a `formulaire` (Form Builder) document and renders it inline or as a
 * button to the dedicated form page.
 *
 * NOTE: `relationTo` targets the `formulaire` collection slug. If the Form
 * Builder plugin registers its collection under a different slug, the collection
 * agent should align this relation when wiring the plugin.
 */
export const CtaForm: Block = {
  slug: 'ctaForm',
  interfaceName: 'CtaFormBlock',
  labels: { singular: 'Appel à l’action / Formulaire', plural: 'Appels à l’action' },
  fields: [
    { name: 'title', type: 'text', label: 'Titre' },
    { name: 'description', type: 'textarea', label: 'Description' },
    {
      name: 'formulaire',
      type: 'relationship',
      relationTo: FORMULAIRE_SLUG,
      required: true,
      label: 'Formulaire',
    },
    {
      name: 'displayMode',
      type: 'select',
      label: 'Affichage',
      defaultValue: 'inline',
      options: [
        { label: 'Formulaire intégré', value: 'inline' },
        { label: 'Bouton vers la page formulaire', value: 'button' },
      ],
    },
  ],
}
