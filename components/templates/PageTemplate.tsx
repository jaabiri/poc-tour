import type { Page, Rubrique } from '@/payload-types'
import { Container } from '@/components/ui'
import { Blocks } from '@/components/blocks/BlockRenderer'

/**
 * PageTemplate — gabarit for T3 institutional pages and T12 cartographic pages.
 *
 * Renders the page title as the document <h1>, then defers all layout to the
 * composed blocks (MapEmbed, richText, etc. are all handled inside <Blocks>).
 *
 * RSC. Returns ONLY the page's main content — no Topbar/SiteHeader/SiteFooter,
 * no outer <main>, no breadcrumb. The dispatcher route provides that chrome.
 */
export function PageTemplate({ doc, rubrique }: { doc: Page; rubrique: Rubrique }) {
  return (
    <>
      <Container className="pt-12">
        <h1 className="font-display text-brand-primary-dark text-4xl font-bold leading-tight">
          {doc.title}
        </h1>
      </Container>
      <Blocks blocks={doc.layout} rubrique={rubrique} />
    </>
  )
}

export default PageTemplate
