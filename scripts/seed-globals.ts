/**
 * seed-globals — populate the `header` / `footer` globals from data/*.json.
 *
 *   pnpm payload run ./scripts/seed-globals.ts
 *
 * NON-DESTRUCTIVE: only writes the two globals (idempotent upsert). Touches no
 * collection content. Run it once so the admin "Apparence → En-tête / Pied de
 * page" screens start populated; the front-office already falls back to the
 * JSON until then. Links are seeded as `custom` URLs (the same hrefs the
 * fallback used) — switch any of them to a rubrique relationship in the admin.
 *
 * The same logic also runs inside seed.ts; this script is the standalone,
 * content-safe entry point.
 */
import { getPayload } from 'payload'
import config from '../payload.config'

import navigationJson from '../data/navigation.json'
import topbarJson from '../data/topbar.json'
import footerJson from '../data/footer.json'
import newsletterJson from '../data/newsletter.json'

type JsonLink = { label: string; href: string }
const customLink = (l: JsonLink) => ({ type: 'custom' as const, label: l.label, url: l.href })
const splitColumns = (links: JsonLink[], parts: number) => {
  const size = Math.ceil(links.length / parts)
  return Array.from({ length: parts }, (_, i) => ({
    links: links.slice(i * size, (i + 1) * size).map(customLink),
  })).filter((c) => c.links.length > 0)
}

const run = async () => {
  const payload = await getPayload({ config })

  await payload.updateGlobal({
    slug: 'header',
    overrideAccess: true,
    data: {
      topbar: {
        intro: topbarJson.intro,
        links: topbarJson.links.map(customLink),
        privateSpace: customLink(topbarJson.privateSpace),
      },
      primaryNav: navigationJson.map((item) => {
        const sub = item.sub ?? []
        const menuType: 'direct' | 'dropdown' | 'mega' = item.wide
          ? 'mega'
          : sub.length > 0
            ? 'dropdown'
            : 'direct'
        return {
          menuType,
          type: 'custom' as const,
          label: item.label,
          url: item.href,
          sublinks: menuType === 'dropdown' ? sub.map(customLink) : [],
          columns: menuType === 'mega' ? splitColumns(sub, 2) : [],
        }
      }),
      search: { enabled: true, placeholder: 'Rechercher…', action: '/recherche' },
    },
  })

  await payload.updateGlobal({
    slug: 'footer',
    overrideAccess: true,
    data: {
      newsletter: newsletterJson,
      contact: footerJson.contact,
      socials: footerJson.socials.map((s) => ({
        network: s.icon as 'facebook' | 'instagram' | 'linkedin' | 'youtube',
        url: s.href,
      })),
      columns: footerJson.columns.map((c) => ({
        heading: c.heading,
        links: c.links.map(customLink),
      })),
      legalLinks: footerJson.legalLinks.map(customLink),
      copyright: footerJson.copyright,
    },
  })

  console.log('✓ Globals « header » et « footer » initialisés depuis data/*.json')
}

try {
  await run()
} catch (err) {
  console.error('seed-globals failed:', err)
  process.exit(1)
}
