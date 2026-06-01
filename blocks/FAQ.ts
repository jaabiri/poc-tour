import type { Block } from 'payload'

/**
 * FAQ — an accordion of question/answer pairs. Used on T3/T4 pages.
 */
export const FAQ: Block = {
  slug: 'faq',
  interfaceName: 'FaqBlock',
  labels: { singular: 'FAQ', plural: 'FAQ' },
  fields: [
    { name: 'title', type: 'text', label: 'Titre' },
    {
      name: 'items',
      type: 'array',
      required: true,
      label: 'Questions',
      labels: { singular: 'Question', plural: 'Questions' },
      fields: [
        { name: 'question', type: 'text', required: true, label: 'Question' },
        { name: 'answer', type: 'richText', required: true, label: 'Réponse' },
      ],
    },
  ],
}
