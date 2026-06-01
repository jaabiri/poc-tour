import Image from 'next/image'
import { RichText } from '@payloadcms/richtext-lexical/react'

import { Container, SectionLabel, Tag } from '@/components/ui'
import { NewsCard } from '@/components/sections/news/NewsCard'
import { ShareRow } from '@/components/shared/share-row'
import { BackToRubrique } from '@/components/shared/back-to-rubrique'
import { getPayloadClient } from '@/lib/payload'

import type { Actualite, Media, Rubrique } from '@/payload-types'

/**
 * ActualiteDetailTemplate — gabarit T5 « Actualité (détail) » (site-tree §5).
 *
 * Returns ONLY the page's MAIN CONTENT (the inner stack): header (thème + date +
 * visuel), chapô, corps RichText, une barre « Partager » et une bande
 * « Actualités liées ». The dispatcher route supplies the chrome (Topbar,
 * SiteHeader, SiteFooter, outer <main>, breadcrumb), so none of that is rendered
 * here — per the template contract.
 *
 * Styling: semantic design tokens only (CLAUDE.md §1/§2 — no arbitrary Tailwind
 * values, no raw palette colours). The visual language and the `mediaSrc` /
 * `rubriqueHref` helpers are copied from `components/blocks/BlockRenderer.tsx` so
 * a detail page reads as the same site.
 */

/** Pull a usable URL + alt off a populated (or unpopulated) media relation. */
const mediaSrc = (
  m: (number | null) | Media | undefined,
): { url: string; alt: string } | null => {
  if (!m || typeof m !== 'object') return null
  if (!m.url) return null
  return { url: m.url, alt: m.alt ?? '' }
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

/** Front-office href of an actualité = its primary rubrique path + '/' + slug. */
const actualiteHref = (a: Actualite): string =>
  rubriqueHref(a.rubriques?.[0]) + `/${a.slug ?? a.id}`

/** Long French date for the article header (e.g. « 12 mars 2026 »). */
const formatLongDate = (iso: string | null | undefined): string => {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** Collect the rubrique ids a doc is attached to (ids or populated docs). */
const docRubriqueIds = (doc: Actualite): number[] => {
  const list = doc.rubriques ?? []
  const ids: number[] = []
  for (const r of list) {
    const id = typeof r === 'object' && r !== null ? r.id : r
    if (typeof id === 'number') ids.push(id)
  }
  return ids
}

/** Fetch up to 3 other actualités sharing a rubrique, excluding the current doc. */
async function findRelatedActualites(doc: Actualite): Promise<Actualite[]> {
  const branches = docRubriqueIds(doc)
  if (branches.length === 0) return []
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'actualite',
    draft: false,
    depth: 2,
    limit: 3,
    pagination: false,
    sort: '-date',
    where: {
      and: [
        { rubriques: { in: branches } },
        { id: { not_equals: doc.id } },
      ],
    },
  })
  return result.docs
}

/** « Actualités liées » strip — reuses NewsCard, the prop-driven homepage card. */
function RelatedStrip({ items }: { items: Actualite[] }) {
  if (items.length === 0) return null
  return (
    <Container className="py-12">
      <SectionLabel>Actualités liées</SectionLabel>
      <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5">
        {items.map((a) => {
          const img = mediaSrc(a.image)
          return (
            <NewsCard
              key={a.id}
              item={{
                tag: a.tag ?? 'Actualité',
                title: a.title,
                // NewsCard renders `image` as a CSS background; fall back to a
                // token-driven brand wash when there is no media.
                image: img ? `url(${img.url}) center/cover` : 'var(--color-surface-brand)',
                href: actualiteHref(a),
              }}
            />
          )
        })}
      </div>
    </Container>
  )
}

/**
 * « En images » gallery — renders the actualité's additional visuals (real data
 * that was previously dropped). Each image is a <figure> with an optional
 * caption; auto-fit grid per the charte. Images with no `alt` are decorative
 * (alt=""), so a screen reader skips the visual but still reads the caption.
 */
function GalleryView({ gallery }: { gallery: NonNullable<Actualite['gallery']> }) {
  const figures = gallery.flatMap((g, i) => {
    const src = mediaSrc(g.image)
    return src ? [{ src, caption: g.caption ?? '', key: g.id ?? `${src.url}-${i}` }] : []
  })
  if (figures.length === 0) return null
  return (
    <Container className="pb-4">
      <div className="max-w-3xl">
        <SectionLabel>En images</SectionLabel>
        <h2 className="font-display text-brand-primary-dark mb-6 mt-2.5 text-2xl font-bold leading-tight">
          La galerie
        </h2>
      </div>
      <ul className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5">
        {figures.map((f) => (
          <li key={f.key}>
            <figure className="m-0">
              <Image
                src={f.src.url}
                alt={f.src.alt}
                width={600}
                height={400}
                className="h-auto w-full rounded-lg object-cover"
              />
              {f.caption ? (
                <figcaption className="text-text-muted mt-2 text-sm">{f.caption}</figcaption>
              ) : null}
            </figure>
          </li>
        ))}
      </ul>
    </Container>
  )
}

export async function ActualiteDetailTemplate({
  doc,
  rubrique,
}: {
  doc: Actualite
  rubrique: Rubrique
}) {
  const img = mediaSrc(doc.image)
  const longDate = formatLongDate(doc.date)
  // The dispatcher resolved this doc under `rubrique`, so its own path is the
  // authoritative front-office URL of the article (more reliable than picking
  // doc.rubriques[0], which may differ when the doc is attached transversally).
  const shareUrl = rubriqueHref(rubrique) + `/${doc.slug ?? doc.id}`
  const hasGallery = Array.isArray(doc.gallery) && doc.gallery.length > 0
  const related = await findRelatedActualites(doc)

  return (
    <>
      <article>
        <Container className="pt-10">
          <header className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              {doc.tag ? <Tag>{doc.tag}</Tag> : null}
              {longDate ? (
                <time
                  dateTime={doc.date ?? undefined}
                  className="text-text-muted text-sm font-semibold"
                >
                  {longDate}
                </time>
              ) : null}
            </div>
            <h1 className="font-display text-brand-primary-dark mt-4 text-4xl font-black leading-tight md:text-5xl">
              {doc.title}
            </h1>
            {doc.chapo ? (
              <p className="text-text-primary mt-5 text-lg leading-relaxed">
                {doc.chapo}
              </p>
            ) : null}
          </header>

          {img ? (
            <Image
              src={img.url}
              alt={img.alt}
              width={1040}
              height={585}
              priority
              className="mt-8 h-auto w-full rounded-lg object-cover"
            />
          ) : null}

          {doc.body ? (
            <div className="prose-touraine text-text-primary mt-10 max-w-3xl leading-relaxed">
              <RichText data={doc.body} />
            </div>
          ) : null}
        </Container>

        {hasGallery ? <GalleryView gallery={doc.gallery!} /> : null}

        <Container className="pb-12 pt-8">
          <div className="max-w-3xl">
            <ShareRow title={doc.title} url={shareUrl} />
            <div className="mt-8">
              <BackToRubrique title={rubrique.title} href={rubriqueHref(rubrique)} />
            </div>
          </div>
        </Container>
      </article>

      <RelatedStrip items={related} />
    </>
  )
}

export default ActualiteDetailTemplate
