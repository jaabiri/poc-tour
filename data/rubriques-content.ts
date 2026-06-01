/**
 * rubriques-content.ts — typed, production-ready editorial content + SEO for
 * every rubrique of the touraine.fr arborescence.
 *
 * The catalog is authored as plain serialisable data (no Lexical nodes); the seed
 * (`seed.ts`) translates each entry into the rubrique `landing` block stack
 * (hero + richText + faq + relatedLinks + downloadList + ctaForm + mapEmbed) and
 * the per-page `seo` overrides, and — for démarche entries — into a companion
 * `article` (type=demarche) with numbered steps + service contacts.
 *
 * Keys are the rubrique SLUG PATH (e.g. "mes-services-au-quotidien/sport"), the
 * same path the seed builds from the tree (see `rubriqueIdByPath`). Regenerate the
 * underlying JSON with `node scripts/build-rubrique-content.mjs`.
 */
import type { IconName } from '@/lib/icons'

import raw from './rubriques-content.json'

/** Per-page SEO overrides (auto-derivation is the fallback when absent). */
export interface RubriqueSeo {
  title: string
  description: string
}

/** One big "chiffre-clé" rendered in a stats row (Fraunces) or the side rail. */
export interface KeyFigure {
  /** The headline number, pre-formatted (e.g. "3 700 km", "58 %"). */
  value: string
  label: string
}

/** A thematic feature item (icon + label + optional text) — richer than a bullet. */
export interface FeatureItem {
  icon: IconName
  label: string
  text?: string
}

/**
 * A section visual placed beside the text in a `media` layout. Either a real
 * image (`url` + `alt`) OR — when no photo is available — a branded « aplat de
 * charte » : a deep-brand panel carrying a thematic icon and a CornerSeal, on
 * tone-driven tokens (never the rainbow under text).
 */
export interface SectionMedia {
  /** Side the visual sits on (desktop). Defaults to alternating from the section index. */
  side?: 'left' | 'right'
  /** Real image source (optional — falls back to the branded aplat). */
  url?: string
  alt?: string
  /** Aplat de charte: the thematic icon shown when there is no `url`. */
  icon?: IconName
  /** Aplat tone: deep brand (default) or light blue tint. */
  tone?: 'brand' | 'tint'
}

/**
 * A rich-text section: an H2 heading, paragraphs and an optional bullet list.
 *
 * To break the monotony of « titre + paragraphes + puces » repeated down the page,
 * each section can declare a `layout` and carry the matching extra data:
 *  - `'cards'` (default) — bullets/features rendered as aerated feature-cards;
 *  - `'stats'` — a row of big « chiffres-clés » (Fraunces + rainbow accent);
 *  - `'media'` — a visual beside the text, side alternating left/right.
 */
export interface ContentSection {
  heading: string
  paragraphs?: string[]
  bullets?: string[]
  /**
   * Short coral eyebrow shown above the heading in the « Fiche service / rubrique »
   * gabarit (SectionLabel). Optional — falls back to a visually-hidden « Section ».
   */
  eyebrow?: string
  /** Optional pull-quote / key figure rendered as a highlight box in the section. */
  highlight?: string
  /** Section presentation. Defaults to `'cards'` so legacy entries are unchanged. */
  layout?: 'cards' | 'stats' | 'media'
  /** `layout: 'stats'` — the big figures shown as a row. */
  stats?: KeyFigure[]
  /** `layout: 'media'` — the side visual. */
  media?: SectionMedia
  /** Thematic feature items (icon per item) — an iconographed alternative to `bullets`. */
  features?: FeatureItem[]
}

/** A FAQ entry. */
export interface FaqItem {
  q: string
  a: string
}

/** A "liens utiles" entry — internal rubrique (path) OR external URL. */
export interface RelatedLink {
  label: string
  /** Internal: a rubrique slug-path (resolved to an id by the seed). */
  path?: string
  /** External: an absolute URL. */
  url?: string
}

/** One numbered step of a démarche (T4). */
export interface DemarcheStep {
  title: string
  text: string
}

/** A service contact block (démarche pages). */
export interface ServiceContact {
  name: string
  role?: string
  email?: string
  phone?: string
  address?: string
}

/** A démarche payload → a companion `article` (type=demarche) is also seeded. */
export interface DemarcheContent {
  steps: DemarcheStep[]
  contacts?: ServiceContact[]
}

/** An ArcGIS map (T12 cartographic page) → a `mapEmbed` block. */
export interface RubriqueMap {
  title: string
  arcgisItemUrl: string
}

/** The full editorial payload for one rubrique. */
export interface RubriqueContent {
  seo: RubriqueSeo
  heroSubtitle: string
  intro: string[]
  sections?: ContentSection[]
  faq?: FaqItem[]
  related?: RelatedLink[]
  downloads?: string[]
  /**
   * Contacts utiles rendered in the side rail of the « Fiche service / rubrique »
   * gabarit (RubriqueServiceTemplate). Reuses the démarche `ServiceContact` shape.
   */
  contacts?: ServiceContact[]
  /** Side-rail « Chiffres-clés » card (CornerSeal + big Fraunces figures). */
  keyFigures?: KeyFigure[]
  /** Side-rail « En 1 clic » quick links (real page links, not anchors). */
  quickLinks?: RelatedLink[]
  /** Append a contact-form CTA at the bottom of the landing (default true). */
  contactCta?: boolean
  demarche?: DemarcheContent
  map?: RubriqueMap
}

/** path → content, covering every editorial rubrique of the arborescence. */
export const RUBRIQUE_CONTENT = raw as Record<string, RubriqueContent>

export default RUBRIQUE_CONTENT
