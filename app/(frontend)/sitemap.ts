import type { MetadataRoute } from 'next'

import { getVisibleTree } from '@/lib/payload'
import type { Rubrique } from '@/payload-types'

/**
 * Front-office sitemap — one entry per VISIBLE rubrique.
 *
 * The visible tree is already filtered by Payload `read` access (front-office
 * never sees hidden branches), so we simply map each node to its breadcrumb URL
 * path, made absolute against the public origin.
 */

const ORIGIN = process.env.NEXT_PUBLIC_SERVER_URL ?? 'https://www.touraine.fr'

/**
 * Front-office breadcrumb path of a rubrique, mirroring the BlockRenderer
 * `rubriqueHref` pattern: prefer the last breadcrumb `url`, fall back to slug.
 */
const rubriquePath = (r: Rubrique): string => {
  const crumbs = r.breadcrumbs ?? []
  if (crumbs.length > 0 && crumbs[crumbs.length - 1]?.url) {
    const url = crumbs[crumbs.length - 1]!.url as string
    return url.startsWith('/') ? url : `/${url}`
  }
  return r.slug ? `/${r.slug}` : '/'
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rubriques = await getVisibleTree()

  return rubriques.map((r) => ({
    url: `${ORIGIN}${rubriquePath(r)}`,
    lastModified: r.updatedAt ? new Date(r.updatedAt) : undefined,
  }))
}
