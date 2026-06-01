import type { Block } from 'payload'

/**
 * Breadcrumb — the fil d'Ariane. Present on (almost) every page; the actual path
 * is computed from the rubrique breadcrumbs at render time, so this block only
 * carries display options (whether to show the homepage root, and a label
 * override for the current node).
 *
 * It exists as a block so editors can place/remove it within a landing's block
 * stack; on most templates it is rendered automatically by the layout.
 */
export const Breadcrumb: Block = {
  slug: 'breadcrumb',
  interfaceName: 'BreadcrumbBlock',
  labels: { singular: 'Fil d’Ariane', plural: 'Fils d’Ariane' },
  fields: [
    {
      name: 'showHome',
      type: 'checkbox',
      defaultValue: true,
      label: 'Afficher « Accueil »',
      admin: { description: 'Afficher le lien « Accueil » en tête.' },
    },
    {
      name: 'currentLabelOverride',
      type: 'text',
      label: 'Libellé du nœud courant',
      admin: { description: 'Libellé du nœud courant (vide = titre de la rubrique).' },
    },
  ],
}
