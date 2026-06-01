import Link from 'next/link'
import { RichText } from '@payloadcms/richtext-lexical/react'

import { Container, SectionLabel, Icon, ArrowLink, CornerSeal } from '@/components/ui'
import { Blocks } from '@/components/blocks/BlockRenderer'
import { ShareRow } from '@/components/shared/share-row'
import { BackToRubrique } from '@/components/shared/back-to-rubrique'
import { PrintButton } from '@/components/shared/print-button'
import { getPayloadClient } from '@/lib/payload'
import { isInternalHref } from '@/lib/href'

import type { Article, Media, Rubrique } from '@/payload-types'

/**
 * ArticleTemplate — front-office gabarit for the `article` collection, serving
 * BOTH archetypes the collection exposes via its `type` discriminant
 * (collections/Article.ts):
 *
 *   - `presentation` (T3) — rich institutional editorial: chapô lead + composed
 *     body (the shared block library) + downloads + service contacts.
 *   - `demarche` (T4) — task-oriented « Je veux… » page: the same chrome plus the
 *     numbered `steps` walkthrough (« Étapes de la démarche »).
 *
 * Template contract: this is a React Server Component that returns ONLY the
 * page's MAIN CONTENT (inner content). It does NOT render Topbar/SiteHeader/
 * SiteFooter, the outer <main>, or the breadcrumb — the dispatcher route owns
 * that chrome.
 *
 * Styling: semantic design tokens only (CLAUDE.md §1/§2 — no arbitrary Tailwind
 * values, no raw palette colours). Patterns mirror BlockRenderer.tsx
 * (Container/SectionLabel/Icon, the `mediaSrc` helper, DownloadListBlockView).
 */

/** Pull a usable URL + alt off a populated (or unpopulated) media relation. */
const mediaSrc = (
  m: (number | null) | Media | undefined,
): { url: string; alt: string; filename: string } | null => {
  if (!m || typeof m !== 'object') return null
  if (!m.url) return null
  return { url: m.url, alt: m.alt ?? '', filename: m.filename ?? '' }
}

/** Front-office path of a rubrique relation, from its breadcrumbs / slug. */
const rubriqueHref = (r: (number | null) | Rubrique | undefined): string => {
  if (!r || typeof r !== 'object') return '#'
  const crumbs = r.breadcrumbs ?? []
  if (crumbs.length > 0 && crumbs[crumbs.length - 1]?.url) {
    const url = crumbs[crumbs.length - 1]!.url as string
    return url.startsWith('/') ? url : `/${url}`
  }
  return r.slug ? `/${r.slug}` : '#'
}

/** Front-office href of an article = its primary rubrique path + '/' + slug. */
const articleHref = (a: Article): string =>
  rubriqueHref(a.rubriques?.[0]) + `/${a.slug ?? a.id}`

/** Collect the rubrique ids a doc is attached to (ids or populated docs). */
const docRubriqueIds = (doc: Article): number[] => {
  const ids: number[] = []
  for (const r of doc.rubriques ?? []) {
    const id = typeof r === 'object' && r !== null ? r.id : r
    if (typeof id === 'number') ids.push(id)
  }
  return ids
}

/**
 * Fetch up to 3 sibling editorial articles (same `type`) sharing a rubrique,
 * excluding the current doc — powers the « À lire aussi » strip (catalogue #4).
 * Editors can still curate cross-collection picks via a NewsList body block.
 */
async function findRelatedArticles(doc: Article): Promise<Article[]> {
  const branches = docRubriqueIds(doc)
  if (branches.length === 0) return []
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'article',
    draft: false,
    depth: 2,
    limit: 3,
    pagination: false,
    where: {
      and: [
        { rubriques: { in: branches } },
        { type: { equals: doc.type } },
        { id: { not_equals: doc.id } },
      ],
    },
  })
  return result.docs
}

/** « À lire aussi » card — image-less editorial sibling (title + chapô + arrow). */
function RelatedArticleCard({ item }: { item: Article }) {
  const href = articleHref(item)
  const inner = (
    <>
      <CornerSeal />
      <h3 className="font-display text-brand-primary-dark text-xl font-bold leading-snug">
        {item.title}
      </h3>
      {item.chapo ? (
        <p className="text-text-muted mt-2 line-clamp-3 text-sm leading-relaxed">
          {item.chapo}
        </p>
      ) : null}
      <span className="mt-4 inline-block">
        <ArrowLink as="span">Lire la suite</ArrowLink>
      </span>
    </>
  )
  const className =
    'group bg-surface-main border-border-main hover:shadow-card-hover relative block overflow-hidden rounded-xl border px-6 pb-6 pt-[26px] no-underline transition-all duration-[400ms] ease-[cubic-bezier(.2,.7,.2,1)] hover:-translate-y-1.5 hover:border-transparent'
  return isInternalHref(href) ? (
    <Link href={href} aria-label={`${item.title} — lire l’article`} className={className}>
      {inner}
    </Link>
  ) : (
    <a href={href} aria-label={`${item.title} — lire l’article`} className={className}>
      {inner}
    </a>
  )
}

/** « À lire aussi » strip — sibling editorial articles in the same rubrique. */
function RelatedArticles({ items }: { items: Article[] }) {
  if (items.length === 0) return null
  return (
    <Container className="py-12">
      <SectionLabel>À lire aussi</SectionLabel>
      <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
        {items.map((a) => (
          <RelatedArticleCard key={a.id} item={a} />
        ))}
      </div>
    </Container>
  )
}

function StepsView({ steps }: { steps: NonNullable<Article['steps']> }) {
  return (
    <Container className="py-10">
      <SectionLabel>Démarche</SectionLabel>
      <h2 className="font-display text-brand-primary-dark mb-7 mt-2.5 text-3xl font-bold leading-tight">
        Étapes de la démarche
      </h2>
      <ol className="flex flex-col gap-4">
        {steps.map((step, i) => (
          <li
            key={step.id ?? `${step.title}-${i}`}
            className="bg-surface-main border-border-main flex gap-4 rounded-xl border p-6"
          >
            <span
              aria-hidden="true"
              className="bg-surface-brand text-text-inverse flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold"
            >
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-brand-primary-dark mb-2 text-lg font-bold">
                <span className="sr-only">Étape {i + 1} : </span>
                {step.title}
              </h3>
              <div className="prose-touraine text-text-primary text-sm leading-relaxed">
                <RichText data={step.richText} />
              </div>
            </div>
          </li>
        ))}
      </ol>
    </Container>
  )
}

function DownloadsView({ downloads }: { downloads: NonNullable<Article['downloads']> }) {
  const files = downloads
    .map((d) => mediaSrc(d))
    .filter((f): f is NonNullable<ReturnType<typeof mediaSrc>> => f !== null)
  if (files.length === 0) return null
  return (
    <Container className="py-10">
      <h2 className="font-display text-brand-primary-dark mb-7 mt-2.5 text-3xl font-bold leading-tight">
        Pièces à fournir et téléchargements
      </h2>
      <ul className="flex flex-col gap-2">
        {files.map((f, i) => (
          <li key={`${f.url}-${i}`}>
            <a
              href={f.url}
              download
              className="bg-surface-main border-border-main text-brand-primary-dark hover:shadow-card-sm flex items-center gap-3 rounded-lg border p-4 no-underline transition-shadow"
            >
              <Icon name="file-text" size={20} />
              <span className="text-sm font-semibold">{f.alt || f.filename || 'Fichier'}</span>
            </a>
          </li>
        ))}
      </ul>
    </Container>
  )
}

function ContactsView({ contacts }: { contacts: NonNullable<Article['contacts']> }) {
  return (
    <Container className="py-10">
      <SectionLabel>Contacts</SectionLabel>
      <h2 className="font-display text-brand-primary-dark mb-7 mt-2.5 text-3xl font-bold leading-tight">
        Contacts du service
      </h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {contacts.map((c, i) => (
          <div
            key={c.id ?? `${c.name}-${i}`}
            className="bg-surface-main border-border-main rounded-xl border p-6"
          >
            <h3 className="text-brand-primary-dark text-lg font-bold">{c.name}</h3>
            {c.role ? (
              <p className="text-text-muted mt-1 text-sm font-semibold">{c.role}</p>
            ) : null}
            <dl className="mt-4 flex flex-col gap-2 text-sm">
              {c.email ? (
                <div className="flex items-start gap-2">
                  <dt className="text-text-muted shrink-0">
                    <Icon name="mail" size={16} />
                    <span className="sr-only">Courriel</span>
                  </dt>
                  <dd>
                    <a
                      href={`mailto:${c.email}`}
                      className="text-action hover:text-action-hover no-underline"
                    >
                      {c.email}
                    </a>
                  </dd>
                </div>
              ) : null}
              {c.phone ? (
                <div className="flex items-start gap-2">
                  <dt className="text-text-muted shrink-0">
                    <Icon name="phone" size={16} />
                    <span className="sr-only">Téléphone</span>
                  </dt>
                  <dd>
                    <a
                      href={`tel:${c.phone.replace(/\s+/g, '')}`}
                      className="text-text-primary no-underline"
                    >
                      {c.phone}
                    </a>
                  </dd>
                </div>
              ) : null}
              {c.address ? (
                <div className="flex items-start gap-2">
                  <dt className="text-text-muted shrink-0">
                    <Icon name="map-pin" size={16} />
                    <span className="sr-only">Adresse</span>
                  </dt>
                  <dd className="text-text-primary whitespace-pre-line">{c.address}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        ))}
      </div>
    </Container>
  )
}

export async function ArticleTemplate({
  doc,
  rubrique,
}: {
  doc: Article
  rubrique: Rubrique
}) {
  const isDemarche = doc.type === 'demarche'
  const hasSteps = isDemarche && Array.isArray(doc.steps) && doc.steps.length > 0
  const hasDownloads = Array.isArray(doc.downloads) && doc.downloads.length > 0
  const hasContacts = Array.isArray(doc.contacts) && doc.contacts.length > 0
  // Editorial « presentation » pages get a sibling « À lire aussi » strip; the
  // task-oriented démarche archetype keeps its own steps/contacts chrome.
  const related = isDemarche ? [] : await findRelatedArticles(doc)
  const shareUrl = articleHref(doc)

  return (
    <article>
      <Container className="pt-10">
        {isDemarche ? <SectionLabel>Démarche</SectionLabel> : null}
        <h1 className="font-display text-brand-primary-dark mt-2.5 max-w-3xl text-4xl font-black leading-tight md:text-5xl">
          {doc.title}
        </h1>
        {doc.chapo ? (
          <p className="text-text-primary mt-5 max-w-3xl text-lg leading-relaxed">
            {doc.chapo}
          </p>
        ) : null}
        <div className="mt-6">
          <PrintButton />
        </div>
      </Container>

      <Blocks blocks={doc.body} rubrique={rubrique} />

      {hasSteps ? <StepsView steps={doc.steps!} /> : null}
      {hasDownloads ? <DownloadsView downloads={doc.downloads!} /> : null}
      {hasContacts ? <ContactsView contacts={doc.contacts!} /> : null}

      <RelatedArticles items={related} />

      <Container className="pb-12 pt-2">
        <div className="max-w-3xl">
          <ShareRow title={doc.title} url={shareUrl} />
          <div className="mt-8">
            <BackToRubrique title={rubrique.title} href={rubriqueHref(rubrique)} />
          </div>
        </div>
      </Container>
    </article>
  )
}

export default ArticleTemplate
