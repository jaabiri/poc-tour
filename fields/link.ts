import type { Field } from 'payload'

import { RUBRIQUES_SLUG } from '@/lib/access'

/**
 * linkField — the single, reusable way to author a link anywhere in the admin
 * (menus, footer columns, CTAs…). A link is EITHER:
 *   - `rubrique`: a relationship to a rubrique, whose front-office path is
 *     resolved from its nested-docs breadcrumbs (see lib/link.ts `resolveLink`);
 *   - `custom`:   a free string — an internal path (`/plan-du-site`) or an
 *     external URL (`https://…`).
 *
 * Mirrors the internal/external pattern already used by `blocks/RelatedLinks.ts`
 * so editors meet one consistent control. The fields are returned flat (to be
 * spread into an array row or group) by `linkFields()`, or wrapped under a named
 * `group` by `linkField()`.
 */

export interface LinkFieldOptions {
  /** Whether the visible label is required. Default: true (menus need a label). */
  labelRequired?: boolean
  /** Include the "open in new tab" checkbox. Default: true. */
  includeNewTab?: boolean
}

/**
 * The raw fields composing a link, ready to be spread into an `array` row or a
 * `group`. `type` + `label` share a row; `rubrique` / `url` are mutually
 * exclusive (shown by `type`).
 */
export const linkFields = (opts: LinkFieldOptions = {}): Field[] => {
  const { labelRequired = true, includeNewTab = true } = opts

  const fields: Field[] = [
    {
      type: 'row',
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          defaultValue: 'rubrique',
          label: 'Type de lien',
          options: [
            { label: 'Rubrique interne', value: 'rubrique' },
            { label: 'URL / lien personnalisé', value: 'custom' },
          ],
          admin: { width: '35%' },
        },
        {
          name: 'label',
          type: 'text',
          required: labelRequired,
          label: 'Libellé',
          admin: {
            width: '65%',
            description:
              'Texte affiché. Laisser vide pour reprendre le titre de la rubrique (lien interne).',
          },
        },
      ],
    },
    {
      name: 'rubrique',
      type: 'relationship',
      relationTo: RUBRIQUES_SLUG,
      label: 'Rubrique',
      admin: {
        condition: (_, sibling) => sibling?.type === 'rubrique',
        description: 'Le chemin est résolu automatiquement depuis l’arborescence.',
      },
    },
    {
      name: 'url',
      type: 'text',
      label: 'URL',
      admin: {
        condition: (_, sibling) => sibling?.type === 'custom',
        description: 'Chemin interne (ex. /plan-du-site) ou URL externe (https://…).',
      },
    },
  ]

  if (includeNewTab) {
    fields.push({
      name: 'newTab',
      type: 'checkbox',
      label: 'Ouvrir dans un nouvel onglet',
      defaultValue: false,
    })
  }

  return fields
}

/** A single named link as a `group` (e.g. an "Espace privé" link, a CTA). */
export const linkField = (
  name: string,
  label?: string,
  opts?: LinkFieldOptions,
): Field => ({
  name,
  type: 'group',
  label,
  fields: linkFields(opts),
})
