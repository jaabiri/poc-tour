import type { Field, FieldHook } from 'payload'

/**
 * slugField — a URL-safe, unique, indexed slug that auto-derives from a source
 * field (default `title`) when left empty, via a `beforeValidate` hook.
 *
 * The slug participates in the URL (rubrique breadcrumb + content slug per
 * site-tree). It lives in the admin sidebar so editors see it but aren't
 * distracted by it. Editors may override the auto value; once set, we don't
 * clobber their choice.
 */

/** Lowercase, accent-free, hyphenated slug (French-aware via NFD folding). */
export const slugify = (input: string): string =>
  input
    .normalize('NFD') // split accented chars into base + diacritic
    .replace(/[̀-ͯ]/g, '') // drop diacritics (é → e, à → a)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // non-alphanumerics → hyphen
    .replace(/^-+|-+$/g, '') // trim leading/trailing hyphens

interface SlugFieldOptions {
  /** Field to derive the slug from when empty. Default: `title`. */
  sourceField?: string
  /** Override the field name. Default: `slug`. */
  name?: string
}

/**
 * The beforeValidate hook: if the editor left the slug empty, generate one from
 * the source field's value (on the incoming `data`). Returns the value Payload
 * stores. Runs on create and update.
 */
const makeSlugHook =
  (sourceField: string): FieldHook =>
  ({ value, data }) => {
    if (typeof value === 'string' && value.trim().length > 0) {
      // Editor provided a slug — normalise it but keep their intent.
      return slugify(value)
    }
    const source = (data as Record<string, unknown> | undefined)?.[sourceField]
    if (typeof source === 'string' && source.length > 0) {
      return slugify(source)
    }
    return value
  }

export const slugField = (options: SlugFieldOptions = {}): Field => {
  const name = options.name ?? 'slug'
  const sourceField = options.sourceField ?? 'title'

  return {
    name,
    type: 'text',
    unique: true, // enforced at the DB level → no duplicate URLs
    index: true, // slugs are looked up on every request to resolve a path
    admin: {
      position: 'sidebar',
      description: 'Identifiant URL. Laisser vide pour générer depuis le titre.',
    },
    hooks: {
      beforeValidate: [makeSlugHook(sourceField)],
    },
  }
}
