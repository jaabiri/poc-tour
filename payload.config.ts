import path from 'path'
import { fileURLToPath } from 'url'

import { buildConfig } from 'payload'
import type { Payload } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { fr } from 'payload/i18n/fr'
import sharp from 'sharp'

import { collections } from './collections'
import { globals } from './globals'
import { plugins } from './plugins'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/**
 * Front-office base URL for the Live Preview iframe + the admin "Aperçu" button.
 * Falls back to '' (same-origin relative) when the env var is unset.
 */
export const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? ''

/**
 * Content collections that get inline editing / Live Preview. The global
 * `admin.livePreview.collections` list below enables the iframe for each of
 * these in the admin; per-collection `admin.preview` + `admin.livePreview.url`
 * (defined in each collection file) build the actual front-office URL.
 */
export const LIVE_PREVIEW_COLLECTIONS = [
  'rubriques',
  'page',
  'article',
  'actualite',
  'evenement',
  'breve',
] as const

/**
 * Responsive viewport presets shown in the Live Preview toolbar so editors can
 * check a page at the three breakpoints the design system targets.
 */
export const LIVE_PREVIEW_BREAKPOINTS = [
  { name: 'mobile', label: 'Mobile', width: 375, height: 812 },
  { name: 'tablet', label: 'Tablette', width: 768, height: 1024 },
  { name: 'desktop', label: 'Bureau', width: 1440, height: 900 },
] as const

/**
 * Front-office path of a rubrique, derived from the nested-docs breadcrumbs
 * (last crumb's url) with a slug fallback. Mirrors `rubriqueHref` in
 * components/blocks/BlockRenderer.tsx so preview URLs match real front URLs.
 */
const rubriquePath = (r: unknown): string => {
  if (!r || typeof r !== 'object') return ''
  const rec = r as { breadcrumbs?: { url?: string | null }[] | null; slug?: string | null }
  const crumbs = rec.breadcrumbs ?? []
  const lastUrl = crumbs.length > 0 ? crumbs[crumbs.length - 1]?.url : undefined
  if (lastUrl) return lastUrl.startsWith('/') ? lastUrl : `/${lastUrl}`
  return rec.slug ? `/${rec.slug}` : ''
}

/** First (primary / URL-bearing) rubrique attached to a content doc, if populated. */
const primaryRubrique = (doc: Record<string, unknown>): unknown => {
  const rubriques = doc.rubriques
  if (Array.isArray(rubriques)) return rubriques[0]
  return rubriques
}

/**
 * Resolve a rubrique reference — a populated object OR a bare id — to its
 * front-office path. In the admin (Live Preview / "Aperçu") the form data
 * exposes `rubriques` as bare ids WITHOUT the nested-docs `breadcrumbs`, so when
 * we only have an id we fetch the rubrique to read its breadcrumbs. Without this,
 * the URL collapsed to a single-segment `/slug` that the resolver can't match
 * (→ 404 in the preview iframe). Returns '' when it cannot be resolved.
 */
const resolveRubriquePath = async (
  rubrique: unknown,
  payload?: Payload,
): Promise<string> => {
  if (rubrique == null) return ''
  if (typeof rubrique === 'object') {
    const fromCrumbs = rubriquePath(rubrique)
    if (fromCrumbs) return fromCrumbs
    const id = (rubrique as { id?: number | string }).id
    if (id != null) return resolveRubriquePath(id, payload)
    return ''
  }
  // Bare id → fetch the rubrique so we can read its breadcrumbs.
  if (!payload) return ''
  try {
    const doc = await payload.findByID({
      collection: 'rubriques',
      id: rubrique as number | string,
      depth: 0,
      overrideAccess: true,
    })
    return rubriquePath(doc)
  } catch {
    return ''
  }
}

/**
 * Best-effort front-office path for a document of `kind`:
 *   - rubrique → its own breadcrumb path
 *   - content  → primary rubrique breadcrumb path + '/' + the doc slug
 * Always returns an absolute, same-origin path (leading '/'). `payload` lets it
 * resolve rubrique paths from bare ids (the shape admin form data uses).
 */
export const previewPathFor = async (
  kind: (typeof LIVE_PREVIEW_COLLECTIONS)[number],
  doc: Record<string, unknown>,
  payload?: Payload,
): Promise<string> => {
  const slug = typeof doc.slug === 'string' ? doc.slug : ''
  if (kind === 'rubriques') {
    const own =
      rubriquePath(doc) ||
      (doc.id != null ? await resolveRubriquePath(doc.id, payload) : '')
    return own || (slug ? `/${slug}` : '/')
  }
  const base = await resolveRubriquePath(primaryRubrique(doc), payload)
  if (base && slug) return `${base}/${slug}`
  // Best effort when the parent rubrique cannot be resolved.
  return slug ? `/${slug}` : '/'
}

/**
 * Build the enable-preview URL the admin should open for a given doc. Routes
 * through `app/(frontend)/next/preview` with the shared secret so draft mode is
 * enabled before the front-office path is rendered. Used by both the "Aperçu"
 * button (`admin.preview`) and the Live Preview iframe (`admin.livePreview.url`).
 * Pass the request's `payload` so rubrique paths resolve from bare ids.
 */
export const buildPreviewURL = async (
  kind: (typeof LIVE_PREVIEW_COLLECTIONS)[number],
  doc: Record<string, unknown>,
  payload?: Payload,
): Promise<string> => {
  const path = await previewPathFor(kind, doc, payload)
  const params = new URLSearchParams({
    secret: process.env.PREVIEW_SECRET ?? '',
    path,
  })
  return `${SERVER_URL}/next/preview?${params.toString()}`
}

export default buildConfig({
  admin: {
    user: 'users',
    importMap: {
      baseDir: path.resolve(dirname),
    },
    // Live Preview (inline editing) for the content collections. The iframe
    // renders the real front-office route in draft mode; per-collection
    // `admin.preview` / `admin.livePreview.url` build each doc's URL.
    livePreview: {
      breakpoints: [...LIVE_PREVIEW_BREAKPOINTS],
      collections: [...LIVE_PREVIEW_COLLECTIONS],
    },
  },
  collections,
  globals,
  plugins,
  editor: lexicalEditor(),
  // French only — no content localization (CONTEXT.md i18n: explicit "non").
  // This `i18n` only sets the admin-UI language; content stays single-locale.
  i18n: {
    fallbackLanguage: 'fr',
    supportedLanguages: { fr },
  },
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || 'file:./poc.db',
    },
  }),
  sharp,
})
