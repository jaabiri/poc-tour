import 'server-only'

import { unstable_cache } from 'next/cache'

import { getPayloadClient } from '@/lib/payload'
import { resolveLink, linkHref, linkLabel, type RawLink } from '@/lib/link'
import { HEADER_TAG } from '@/globals/Header'
import { FOOTER_TAG } from '@/globals/Footer'

import navigationJson from '@/data/navigation.json'
import topbarJson from '@/data/topbar.json'
import footerJson from '@/data/footer.json'
import newsletterJson from '@/data/newsletter.json'

import type { Header as HeaderGlobal, Footer as FooterGlobal } from '@/payload-types'
import type { IconName } from '@/lib/icons'
import type {
  HeaderContent,
  FooterContent,
  NavItem,
  NavLink,
  NewsletterContent,
  TopbarContent,
} from '@/types/content'

/**
 * Front-office loaders for the `header` / `footer` globals.
 *
 * Each global is fetched once and resolved into the existing front-office view
 * models (NavItem/TopbarContent/FooterContent…), so the layout components stay
 * data-agnostic. Reads are `unstable_cache`d and tagged so the globals'
 * `afterChange` hooks (HEADER_TAG/FOOTER_TAG) bust them on save — the same
 * on-demand ISR pattern the rubriques tree uses.
 *
 * Until an editor saves a global (empty arrays), we FALL BACK to the seeded
 * data/*.json so the site keeps rendering exactly as before headless config.
 */

// ---------------------------------------------------------------------------
// Link mapping
// ---------------------------------------------------------------------------

const toNavLink = (raw: RawLink | null | undefined): NavLink | null => {
  const r = resolveLink(raw)
  return r ? { label: r.label, href: r.href, newTab: r.newTab } : null
}

const toNavLinks = (raws: RawLink[] | null | undefined): NavLink[] =>
  (raws ?? []).map(toNavLink).filter((l): l is NavLink => l !== null)

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

/** Map a `header` global's primaryNav row to a front-office NavItem. */
const toNavItem = (
  row: NonNullable<HeaderGlobal['primaryNav']>[number],
): NavItem | null => {
  const label = linkLabel(row)
  const href = linkHref(row)
  // A direct link must resolve to a target; dropdown/mega only need a label.
  if (row.menuType === 'direct' && !href) return null
  if (!label) return null

  const sub = row.menuType === 'dropdown' ? toNavLinks(row.sublinks) : []
  const columns =
    row.menuType === 'mega'
      ? (row.columns ?? [])
          .map((c) => ({ heading: c.heading ?? undefined, links: toNavLinks(c.links) }))
          .filter((c) => c.links.length > 0)
      : []

  return {
    label,
    href: href || '#',
    newTab: Boolean(row.newTab),
    menuType: row.menuType,
    sub,
    columns,
    wide: row.menuType === 'mega' && columns.length > 1,
  }
}

/** navigation.json (legacy shape) → NavItem[] used when the global is empty. */
const fallbackNav = (): NavItem[] =>
  (navigationJson as { label: string; href: string; wide?: boolean; sub: NavLink[] }[]).map(
    (item) => ({
      label: item.label,
      href: item.href,
      menuType: item.sub.length > 0 ? 'dropdown' : 'direct',
      sub: item.sub,
      columns: [],
      wide: item.wide,
    }),
  )

const fallbackTopbar = (): TopbarContent => topbarJson as TopbarContent

const resolveHeader = async (): Promise<HeaderContent> => {
  const payload = await getPayloadClient()
  const g = (await payload.findGlobal({ slug: 'header', depth: 2 })) as HeaderGlobal

  const nav = (g.primaryNav ?? [])
    .map(toNavItem)
    .filter((i): i is NavItem => i !== null)

  const privateSpace = resolveLink(g.topbar?.privateSpace)
  const topbar: TopbarContent =
    g.topbar?.links?.length || privateSpace
      ? {
          intro: g.topbar?.intro ?? '',
          links: toNavLinks(g.topbar?.links),
          privateSpace: privateSpace
            ? { label: privateSpace.label, href: privateSpace.href, newTab: privateSpace.newTab }
            : fallbackTopbar().privateSpace,
        }
      : fallbackTopbar()

  return {
    topbar,
    nav: nav.length > 0 ? nav : fallbackNav(),
    search: {
      enabled: g.search?.enabled ?? true,
      placeholder: g.search?.placeholder?.trim() || 'Rechercher…',
      action: g.search?.action?.trim() || '/recherche',
    },
  }
}

/** The resolved header view model, cache-tagged on HEADER_TAG. */
export const getHeader = (): Promise<HeaderContent> =>
  unstable_cache(resolveHeader, ['global-header'], {
    tags: [HEADER_TAG],
    revalidate: 3600,
  })()

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------

const SOCIAL_LABELS: Record<NonNullable<FooterGlobal['socials']>[number]['network'], string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
}

const fallbackFooter = (): FooterContent => footerJson as FooterContent
const fallbackNewsletter = (): NewsletterContent => newsletterJson as NewsletterContent

const resolveFooter = async (): Promise<{
  footer: FooterContent
  newsletter: NewsletterContent
}> => {
  const payload = await getPayloadClient()
  const g = (await payload.findGlobal({ slug: 'footer', depth: 2 })) as FooterGlobal

  const hasContent =
    (g.columns?.length ?? 0) > 0 ||
    (g.socials?.length ?? 0) > 0 ||
    Boolean(g.contact?.address || g.contact?.phone || g.contact?.email)

  const footer: FooterContent = hasContent
    ? {
        contact: {
          address: g.contact?.address ?? '',
          phone: g.contact?.phone ?? '',
          email: g.contact?.email ?? '',
        },
        socials: (g.socials ?? []).map((s) => ({
          icon: s.network as IconName,
          label: SOCIAL_LABELS[s.network],
          href: s.url,
        })),
        columns: (g.columns ?? []).map((c) => ({
          heading: c.heading ?? '',
          links: toNavLinks(c.links),
        })),
        legalLinks: toNavLinks(g.legalLinks),
        copyright: g.copyright ?? fallbackFooter().copyright,
      }
    : fallbackFooter()

  const nl = g.newsletter
  const newsletter: NewsletterContent = nl?.title
    ? {
        title: nl.title,
        description: nl.description ?? '',
        placeholder: nl.placeholder ?? '',
        button: nl.button ?? '',
      }
    : fallbackNewsletter()

  return { footer, newsletter }
}

/** The resolved footer + newsletter view models, cache-tagged on FOOTER_TAG. */
export const getFooter = (): Promise<{ footer: FooterContent; newsletter: NewsletterContent }> =>
  unstable_cache(resolveFooter, ['global-footer'], {
    tags: [FOOTER_TAG],
    revalidate: 3600,
  })()
