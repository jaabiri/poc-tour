import { RichText } from '@payloadcms/richtext-lexical/react'

import { Container, SectionLabel, ArrowLink } from '@/components/ui'

import type { Breve, Rubrique } from '@/payload-types'

/**
 * BreveDetailTemplate — the detail gabarit for a « brève » (site-tree T9). A
 * brève is intentionally light (titre, date, texte court, lien source
 * optionnel), so this template is compact: a single Container, no block stack.
 *
 * Template contract (CLAUDE.md / gabarit spec): this is a React Server
 * Component that returns ONLY the page's MAIN CONTENT. It does NOT render the
 * Topbar / SiteHeader / SiteFooter, the outer <main>, or the breadcrumb — the
 * dispatcher route supplies all of that chrome. The owning `rubrique` is
 * accepted to honour the shared gabarit signature even though a brève renders
 * no rubrique-specific structure.
 *
 * Styling follows BlockRenderer.tsx exactly: semantic design tokens only
 * (CLAUDE.md §1/§2 — no arbitrary Tailwind values, no raw palette colours).
 */

/** A short, accessible French date (e.g. « 30 mai 2026 ») from an ISO string. */
const formatFrenchDate = (iso: string): string => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function BreveDetailTemplate({
  doc,
}: {
  doc: Breve
  rubrique: Rubrique
}) {
  const dateLabel = formatFrenchDate(doc.date)

  return (
    <Container className="py-10">
      <article className="max-w-3xl">
        <SectionLabel>Brève</SectionLabel>
        <h1 className="font-display text-brand-primary-dark mb-3 mt-2.5 text-3xl font-bold leading-tight">
          {doc.title}
        </h1>
        {dateLabel ? (
          <p className="text-text-muted mb-7 text-sm">
            <time dateTime={doc.date}>{dateLabel}</time>
          </p>
        ) : null}

        <div className="prose-touraine text-text-primary leading-relaxed">
          <RichText data={doc.body} />
        </div>

        {doc.sourceUrl ? (
          <div className="mt-7">
            <ArrowLink href={doc.sourceUrl} iconSize={16}>
              Voir la source
            </ArrowLink>
          </div>
        ) : null}
      </article>
    </Container>
  )
}

export default BreveDetailTemplate
