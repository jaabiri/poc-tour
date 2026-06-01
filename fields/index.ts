/**
 * Shared field helpers imported by every content collection. Keeping these in
 * one place guarantees consistent slugs, rubrique attachment, SEO overrides and
 * scheduling across `article`, `actualite`, `evenement`, `breve`, `page`,
 * `formulaire`, …
 */

export { slugField, slugify } from './slug'
export { rubriquesRelation } from './rubriques'
export { linkField, linkFields, type LinkFieldOptions } from './link'
export {
  seoGroup,
  MEDIA_SLUG,
  ACTUALITE_SLUG,
  EVENEMENT_SLUG,
  FORMULAIRE_SLUG,
} from './seo'
export { publishedFields } from './published'
