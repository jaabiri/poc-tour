import type { CollectionSlug, Field } from 'payload'

/**
 * Slug of the media collection (images, PDF, audio, video). Centralised so the
 * upload relations below stay in sync with the real collection slug.
 *
 * Kept as the `'media'` STRING LITERAL (via `satisfies`, not `as CollectionSlug`)
 * so it both (a) validates as a real `CollectionSlug` and (b) preserves the
 * narrow literal type that `formBuilderPlugin`'s `uploadCollections: 'media'[]`
 * requires. A bare `as CollectionSlug` widened it to the full slug union, which
 * is NOT assignable to that literal-typed option. The literal is still assignable
 * to `CollectionSlug`, so every `relationTo: MEDIA_SLUG` upload field still type-checks.
 */
export const MEDIA_SLUG = 'media' satisfies CollectionSlug

/**
 * Content collection slugs referenced by blocks (NewsList, Agenda, CtaForm).
 * Same forward-reference cast as MEDIA_SLUG — valid once these collections
 * register in a later phase.
 */
export const ACTUALITE_SLUG = 'actualite' as CollectionSlug
export const EVENEMENT_SLUG = 'evenement' as CollectionSlug
export const FORMULAIRE_SLUG = 'formulaire' as CollectionSlug

/**
 * seoGroup — per-page SEO overrides. Per CONTEXT.md/site-tree, meta are
 * AUTO-DERIVED from content fields (title → metaTitle, chapô → metaDescription,
 * hero visual → ogImage) and these fields only OVERRIDE that default. They are
 * therefore all optional; an empty group means "use the derived value".
 *
 * Collections should fall back to derived values at render time when a field is
 * blank, not force editors to fill these.
 */

interface SeoGroupOptions {
  /** Override the group name. Default: `seo`. */
  name?: string
}

export const seoGroup = (options: SeoGroupOptions = {}): Field => ({
  name: options.name ?? 'seo',
  type: 'group',
  admin: {
    description: 'Méta SEO. Laisser vide pour dériver automatiquement du contenu.',
  },
  fields: [
    {
      name: 'metaTitle',
      type: 'text',
      admin: {
        description: 'Titre <title> / og:title. Vide = dérivé du titre du contenu.',
      },
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      admin: {
        description:
          'Meta description / og:description. Vide = dérivé du chapô du contenu.',
      },
    },
    {
      name: 'ogImage',
      type: 'upload',
      relationTo: MEDIA_SLUG,
      admin: {
        description: 'Image de partage (og:image). Vide = dérivé du visuel principal.',
      },
    },
  ],
})
