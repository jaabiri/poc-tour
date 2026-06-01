import type { GlobalAfterChangeHook, GlobalConfig } from 'payload'

import { safeRevalidateTag } from '@/lib/revalidate'
import { linkFields } from '@/fields'
import { adminOnly } from '@/lib/access'

/**
 * `footer` global — the whole bottom region of every page:
 *
 *   - `newsletter`  the newsletter band (title, description, field labels);
 *   - `contact`     address / phone / email;
 *   - `socials`     social network links (network icon + url);
 *   - `columns`     the footer link columns (heading + links);
 *   - `legalLinks`  the bottom legal bar;
 *   - `copyright`   the © holder name.
 *
 * Read via `getFooter()` (lib/globals.ts) with rubrique paths resolved and a
 * data/*.json fallback. Saving busts the `global:footer` cache tag.
 */

export const FOOTER_TAG = 'global:footer'

/** Social networks we ship brand icons for (see lib/icons.tsx). */
const SOCIAL_NETWORKS = [
  { label: 'Facebook', value: 'facebook' },
  { label: 'Instagram', value: 'instagram' },
  { label: 'LinkedIn', value: 'linkedin' },
  { label: 'YouTube', value: 'youtube' },
] as const

const revalidateFooter: GlobalAfterChangeHook = ({ doc }) => {
  safeRevalidateTag(FOOTER_TAG, 'max')
  return doc
}

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Pied de page (footer)',
  admin: {
    group: 'Apparence',
    description:
      'Bandeau newsletter, coordonnées, réseaux sociaux, colonnes de liens, liens légaux et copyright.',
  },
  access: {
    read: () => true,
    update: adminOnly,
  },
  hooks: {
    afterChange: [revalidateFooter],
  },
  fields: [
    {
      name: 'newsletter',
      type: 'group',
      label: 'Bandeau newsletter',
      fields: [
        { name: 'title', type: 'text', label: 'Titre' },
        { name: 'description', type: 'textarea', label: 'Description' },
        { name: 'placeholder', type: 'text', label: 'Texte indicatif du champ' },
        { name: 'button', type: 'text', label: 'Libellé du bouton' },
      ],
    },
    {
      name: 'contact',
      type: 'group',
      label: 'Coordonnées',
      fields: [
        { name: 'address', type: 'text', label: 'Adresse' },
        { name: 'phone', type: 'text', label: 'Téléphone' },
        { name: 'email', type: 'email', label: 'E-mail' },
      ],
    },
    {
      name: 'socials',
      type: 'array',
      label: 'Réseaux sociaux',
      labels: { singular: 'Réseau', plural: 'Réseaux' },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'network',
              type: 'select',
              required: true,
              label: 'Réseau',
              options: [...SOCIAL_NETWORKS],
              admin: { width: '40%' },
            },
            {
              name: 'url',
              type: 'text',
              required: true,
              label: 'URL',
              admin: { width: '60%' },
            },
          ],
        },
      ],
    },
    {
      name: 'columns',
      type: 'array',
      label: 'Colonnes de liens',
      labels: { singular: 'Colonne', plural: 'Colonnes' },
      fields: [
        { name: 'heading', type: 'text', label: 'Titre de colonne' },
        {
          name: 'links',
          type: 'array',
          label: 'Liens',
          labels: { singular: 'Lien', plural: 'Liens' },
          fields: linkFields(),
        },
      ],
    },
    {
      name: 'legalLinks',
      type: 'array',
      label: 'Liens légaux',
      labels: { singular: 'Lien', plural: 'Liens' },
      fields: linkFields(),
    },
    {
      name: 'copyright',
      type: 'text',
      label: 'Détenteur du copyright',
      admin: { description: 'Affiché après « © <année> ».' },
    },
  ],
}

export default Footer
