import type { Block } from 'payload'

import { MEDIA_SLUG } from '@/fields'

/**
 * eventDocuments — documents téléchargeables d'un événement (gabarit Détail T7) :
 * programme PDF, plan d'accès, règlement… Chaque ligne porte un `docType` (pour
 * la pastille) ; le format et le POIDS du fichier sont lus côté front depuis le
 * média (`mimeType` / `filesize`), donc rien à ressaisir pour l'éditeur.
 */
export const EventDocuments: Block = {
  slug: 'eventDocuments',
  interfaceName: 'EventDocumentsBlock',
  labels: { singular: 'Documents', plural: 'Documents' },
  fields: [
    { name: 'title', type: 'text', label: 'Titre', admin: { description: 'Optionnel — défaut « Documents à télécharger ».' } },
    {
      name: 'files',
      type: 'array',
      required: true,
      label: 'Documents',
      labels: { singular: 'Document', plural: 'Documents' },
      fields: [
        { name: 'file', type: 'upload', relationTo: MEDIA_SLUG, required: true, label: 'Fichier' },
        {
          type: 'row',
          fields: [
            {
              name: 'label',
              type: 'text',
              label: 'Libellé',
              admin: { width: '60%', description: 'Vide = nom du fichier.' },
            },
            {
              name: 'docType',
              type: 'select',
              label: 'Type',
              defaultValue: 'autre',
              admin: { width: '40%' },
              options: [
                { label: 'Programme', value: 'programme' },
                { label: 'Plan d’accès', value: 'plan' },
                { label: 'Règlement', value: 'reglement' },
                { label: 'Affiche', value: 'affiche' },
                { label: 'Autre', value: 'autre' },
              ],
            },
          ],
        },
      ],
    },
  ],
}

export default EventDocuments
