import type { Plugin } from 'payload'

import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { searchPlugin } from '@payloadcms/plugin-search'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'

import {
  ACTUALITE_SLUG,
  EVENEMENT_SLUG,
  FORMULAIRE_SLUG,
  MEDIA_SLUG,
} from '@/fields'
import { RUBRIQUES_SLUG } from '@/lib/access'

/**
 * Plugin stack wired into payload.config.ts.
 *
 * - nestedDocsPlugin   → injects the `parent` field + `breadcrumbs` the rubriques
 *   tree depends on (the front-office route resolver and the branch-scoped RBAC
 *   both read these; depth is unbounded — 3 levels recommended, not enforced).
 * - formBuilderPlugin  → provides the T10 « formulaire » capability: a `formulaire`
 *   forms collection (unlimited fields) + a `form-submissions` collection, with
 *   per-form email routing to the concerned service, redirect, and a confirmation
 *   message.
 * - searchPlugin       → a facetable index over the public content collections.
 */
export const plugins: Plugin[] = [
  /**
   * NESTED DOCS — owns the structural arborescence on `rubriques` only.
   * `generateLabel` builds the admin breadcrumb label from each ancestor's
   * `title`; `generateURL` joins ancestor `slug`s into the front-office path the
   * router resolves against (URL = rubrique breadcrumb). These breadcrumbs are
   * what `getAllowedBranchIds` walks to expand a granted branch DOWN the tree.
   */
  nestedDocsPlugin({
    collections: [RUBRIQUES_SLUG],
    generateLabel: (_, doc) => (doc?.title as string) ?? '',
    generateURL: (docs) =>
      docs.reduce<string>(
        (url, doc) => `${url}/${(doc?.slug as string) ?? ''}`,
        '',
      ),
  }),

  /**
   * FORM BUILDER — the « formulaire » capability (T10). Its forms collection is
   * renamed to `formulaire` so the slug matches `FORMULAIRE_SLUG` (the slug the
   * CtaForm block + CtaForm/agenda relations reference). Each form document owns:
   *   - `fields`   → unlimited dynamic fields (text, email, select, upload, …);
   *   - `emails`   → per-form email routing, so a submission is sent to the
   *                  concerned service (the CCTP « plus »);
   *   - `confirmationType` = 'redirect' | 'message' → a redirect to an internal
   *                  rubrique/page or an on-screen confirmation message.
   * `redirectRelationships` enables redirecting to internal documents; the
   * `upload` field is enabled so forms can collect file uploads (pièces jointes),
   * scoped to the media collection.
   */
  formBuilderPlugin({
    fields: {
      text: true,
      textarea: true,
      select: true,
      email: true,
      checkbox: true,
      country: true,
      state: true,
      number: true,
      message: true,
      // File uploads (pièces jointes) routed to the media collection.
      upload: true,
      // No online payment on an institutional contact/démarche form.
      payment: false,
    },
    uploadCollections: [MEDIA_SLUG],
    // Allow a form's "redirect" confirmation to target internal content.
    redirectRelationships: [RUBRIQUES_SLUG, 'page', ACTUALITE_SLUG],
    formOverrides: {
      slug: FORMULAIRE_SLUG,
      labels: {
        singular: 'Formulaire',
        plural: 'Formulaires',
      },
      admin: {
        group: 'Contenus',
        description:
          'Formulaires en ligne (contact, démarches). Champs illimités ; routage e-mail par formulaire vers le service concerné ; redirection ou message de confirmation.',
      },
    },
    formSubmissionOverrides: {
      labels: {
        singular: 'Soumission de formulaire',
        plural: 'Soumissions de formulaires',
      },
      admin: {
        group: 'Contenus',
      },
    },
  }),

  /**
   * SEARCH — a single, facetable index collection over the public-facing content
   * types. Faceting (date / type / event) is driven by the indexed documents'
   * own fields at query time; the collections listed here are the ones whose
   * publish/update keeps the index in sync.
   */
  searchPlugin({
    collections: [ACTUALITE_SLUG, EVENEMENT_SLUG, 'article', 'page', 'breve'],
    defaultPriorities: {
      // Timely content surfaces above evergreen pages by default.
      [ACTUALITE_SLUG]: 20,
      [EVENEMENT_SLUG]: 20,
      breve: 15,
      article: 10,
      page: 5,
    },
    searchOverrides: {
      labels: {
        singular: 'Résultat de recherche',
        plural: 'Index de recherche',
      },
      admin: {
        group: 'Administration',
      },
    },
  }),

  /**
   * VERCEL BLOB STORAGE — médias hors disque local. Sur Vercel le système de
   * fichiers est en lecture seule / éphémère : les fichiers écrits par le upload
   * Payload (staticDir `./media`) seraient perdus à chaque invocation. On bascule
   * donc le stockage de la collection `media` vers Vercel Blob dès que le jeton
   * `BLOB_READ_WRITE_TOKEN` est présent. En local (jeton absent) on garde le
   * disque (`./media`) — `enabled: false` ne touche pas au comportement existant.
   * Note ADR-0003 : en cible un objet S3 souverain remplacera ce plugin par
   * `@payloadcms/storage-s3`, sans changer la collection.
   */
  vercelBlobStorage({
    enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    collections: { [MEDIA_SLUG]: true },
    token: process.env.BLOB_READ_WRITE_TOKEN ?? '',
  }),
]

export default plugins
