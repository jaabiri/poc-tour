import type { Block } from 'payload'

/**
 * eventRichText — description éditoriale d'un événement (gabarit Détail T7).
 *
 * Bloc « événement » dédié, distinct du `richText` générique de rubrique : même
 * rendu Lexical, mais un slug propre à l'agenda pour que la librairie de blocks
 * d'un événement ne mélange jamais du contenu de rubrique (cf. brief : « de
 * vrais blocks d'événement »).
 */
export const EventRichText: Block = {
  slug: 'eventRichText',
  interfaceName: 'EventRichTextBlock',
  labels: { singular: 'Description', plural: 'Descriptions' },
  fields: [
    { name: 'title', type: 'text', label: 'Titre de section', admin: { description: 'Optionnel — ex. « À propos de l’événement ».' } },
    { name: 'content', type: 'richText', required: true, label: 'Contenu' },
  ],
}

export default EventRichText
