import type { Rubrique } from '@/payload-types'

/**
 * Resolve a Payload "link" (the shape produced by `fields/link.ts`) into a flat
 * `{ href, label, newTab }` the front-office components can render directly.
 *
 * A link is either a rubrique relationship (resolved to its breadcrumb path) or
 * a custom URL. The component layer decides internal-vs-external rendering from
 * the href itself (see `lib/href.ts` `isInternalHref`), so we only surface the
 * href, the visible label, and whether to open a new tab.
 */

export interface ResolvedLink {
  href: string
  label: string
  newTab: boolean
}

/** A populated (or bare-id) link value as stored by `linkFields()`. */
export interface RawLink {
  type: 'rubrique' | 'custom'
  label?: string | null
  rubrique?: (number | null) | Rubrique
  url?: string | null
  newTab?: boolean | null
}

/** Front-office path of a rubrique relation, from its breadcrumbs / slug. */
export const rubriqueHref = (
  r: (number | null) | Rubrique | undefined,
): string => {
  if (!r || typeof r !== 'object') return ''
  const crumbs = r.breadcrumbs ?? []
  const last = crumbs.length > 0 ? crumbs[crumbs.length - 1]?.url : undefined
  if (last) return last.startsWith('/') ? last : `/${last}`
  return r.slug ? `/${r.slug}` : ''
}

/** Visible label of a link: explicit label, else the rubrique title, else ''. */
const linkLabel = (link: RawLink): string => {
  const explicit = link.label?.trim()
  if (explicit) return explicit
  if (link.type === 'rubrique' && link.rubrique && typeof link.rubrique === 'object') {
    return link.rubrique.title ?? ''
  }
  return ''
}

/** href of a link, or '' when its target is missing/unresolved. */
export const linkHref = (link: RawLink): string => {
  if (link.type === 'rubrique') return rubriqueHref(link.rubrique)
  return link.url?.trim() ?? ''
}

/**
 * Resolve a link to `{ href, label, newTab }`, or `null` when it has no usable
 * target (so callers can `.filter(Boolean)` out half-authored rows). Use
 * `linkLabel` / `linkHref` directly when a label-without-target is acceptable
 * (e.g. a dropdown trigger that only toggles a panel).
 */
export const resolveLink = (
  link: RawLink | null | undefined,
): ResolvedLink | null => {
  if (!link) return null
  const href = linkHref(link)
  if (!href) return null
  const label = linkLabel(link) || href
  return { href, label, newTab: Boolean(link.newTab) }
}

export { linkLabel }
