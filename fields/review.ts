import type { Field } from 'payload'

/**
 * reviewField — the editorial validation signal (ADR-0002 « cycle de vie »).
 *
 * Payload drafts give a binary `_status` (`draft` | `published`). The CCTP asks
 * for an intermediate step — « en attente de validation » — between a Contributeur
 * finishing a draft and a Validateur publishing it. This field carries that
 * signal WITHOUT duplicating the publish lifecycle:
 *
 *   - `brouillon`               → work in progress (the default).
 *   - `en_attente_de_validation`→ the Contributeur has submitted it; a Validateur
 *                                 (whose groupe covers the branch) should review
 *                                 and publish it.
 *
 * It is purely a workflow marker: the REAL authorisation (who may set
 * `_status: 'published'`) is enforced by the branch-scoped publish gate
 * (`canPublishOnBranch` / `enforcePublishGate`). A Contributeur « autonome »
 * (groupe with `canPublish`) and a Validateur publish directly; a Contributeur
 * without the publish right uses « en attente de validation » to hand off.
 *
 * Values are stable identifiers — front-office / dashboards may filter on them
 * (e.g. a Validateur’s « à valider » queue = `reviewStatus = en_attente_de_validation`
 * AND `_status = draft`).
 */

export const REVIEW_STATUS = {
  brouillon: 'brouillon',
  enAttente: 'en_attente_de_validation',
} as const

export type ReviewStatus = (typeof REVIEW_STATUS)[keyof typeof REVIEW_STATUS]

export const reviewField = (): Field => ({
  name: 'reviewStatus',
  type: 'select',
  defaultValue: REVIEW_STATUS.brouillon,
  label: 'Cycle de validation',
  index: true,
  options: [
    { label: 'Brouillon', value: REVIEW_STATUS.brouillon },
    { label: 'En attente de validation', value: REVIEW_STATUS.enAttente },
  ],
  admin: {
    position: 'sidebar',
    description:
      "« Brouillon » : travail en cours. « En attente de validation » : soumis à un Validateur de la branche. " +
      "La publication effective dépend du statut (brouillon/publié) et de vos droits de publication.",
  },
})

export default reviewField
