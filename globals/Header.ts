import type { GlobalAfterChangeHook, GlobalConfig } from 'payload'

import { safeRevalidateTag } from '@/lib/revalidate'
import { linkField, linkFields } from '@/fields'
import { adminOnly } from '@/lib/access'

/**
 * `header` global — the whole top region of every page, editable in the admin:
 *
 *   - `topbar`      utility bar above the header (intro line, utility links,
 *                   the "Espace privé" link);
 *   - `primaryNav`  the main navigation. Each entry is one of three kinds:
 *                     • direct   → a plain link, no dropdown;
 *                     • dropdown → a flat list of sub-links;
 *                     • mega     → several titled columns of links;
 *   - `search`      the global search box (toggle + placeholder + action).
 *
 * The front-office reads it via `getHeader()` (lib/globals.ts), which resolves
 * every rubrique relationship to a path and falls back to data/*.json until an
 * editor saves the global. Saving busts the `global:header` cache tag.
 */

export const HEADER_TAG = 'global:header'

/** On-demand ISR: purge the header cache tag on the next request after a save. */
const revalidateHeader: GlobalAfterChangeHook = ({ doc }) => {
  safeRevalidateTag(HEADER_TAG, 'max')
  return doc
}

export const Header: GlobalConfig = {
  slug: 'header',
  label: 'En-tête (header)',
  admin: {
    group: 'Apparence',
    description:
      'Barre utilitaire, navigation principale (lien direct, menu déroulant ou méga-menu) et recherche.',
  },
  access: {
    // Public read (the front-office renders it on every page); admins edit it.
    read: () => true,
    update: adminOnly,
  },
  hooks: {
    afterChange: [revalidateHeader],
  },
  fields: [
    {
      name: 'topbar',
      type: 'group',
      label: 'Barre utilitaire',
      fields: [
        {
          name: 'intro',
          type: 'text',
          label: 'Texte d’introduction',
          admin: { description: 'Court texte affiché à gauche de la barre (optionnel).' },
        },
        {
          name: 'links',
          type: 'array',
          label: 'Liens utilitaires',
          labels: { singular: 'Lien', plural: 'Liens' },
          fields: linkFields(),
        },
        linkField('privateSpace', 'Lien « Espace privé »'),
      ],
    },
    {
      name: 'primaryNav',
      type: 'array',
      label: 'Navigation principale',
      labels: { singular: 'Entrée de menu', plural: 'Entrées de menu' },
      admin: {
        initCollapsed: true,
        components: {
          // Use the entry's label as its admin row title for readability.
          RowLabel: '@/globals/NavRowLabel#NavRowLabel',
        },
      },
      fields: [
        {
          name: 'menuType',
          type: 'select',
          required: true,
          defaultValue: 'direct',
          label: 'Type d’entrée',
          options: [
            { label: 'Lien direct', value: 'direct' },
            { label: 'Menu déroulant', value: 'dropdown' },
            { label: 'Méga-menu (colonnes)', value: 'mega' },
          ],
        },
        // The top-level entry is itself a link (label + target).
        ...linkFields(),
        {
          name: 'sublinks',
          type: 'array',
          label: 'Sous-liens',
          labels: { singular: 'Sous-lien', plural: 'Sous-liens' },
          admin: { condition: (_, sibling) => sibling?.menuType === 'dropdown' },
          fields: linkFields(),
        },
        {
          name: 'columns',
          type: 'array',
          label: 'Colonnes',
          labels: { singular: 'Colonne', plural: 'Colonnes' },
          admin: { condition: (_, sibling) => sibling?.menuType === 'mega' },
          fields: [
            {
              name: 'heading',
              type: 'text',
              label: 'Titre de colonne',
            },
            {
              name: 'links',
              type: 'array',
              label: 'Liens',
              labels: { singular: 'Lien', plural: 'Liens' },
              fields: linkFields(),
            },
          ],
        },
      ],
    },
    {
      name: 'search',
      type: 'group',
      label: 'Recherche',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          label: 'Afficher la recherche',
          defaultValue: true,
        },
        {
          name: 'placeholder',
          type: 'text',
          label: 'Texte indicatif',
          defaultValue: 'Rechercher…',
        },
        {
          name: 'action',
          type: 'text',
          label: 'Page de résultats',
          defaultValue: '/recherche',
        },
      ],
    },
  ],
}

export default Header
