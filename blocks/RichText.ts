import type { Block } from 'payload'

/**
 * RichText — a prose block (titles, lists, links internal/external, inline media)
 * rendered from Lexical. The workhorse of T3 editorial pages and T2 intros.
 */
export const RichText: Block = {
  slug: 'richText',
  interfaceName: 'RichTextBlock',
  labels: { singular: 'Texte enrichi', plural: 'Textes enrichis' },
  fields: [{ name: 'content', type: 'richText', required: true, label: 'Contenu' }],
}
