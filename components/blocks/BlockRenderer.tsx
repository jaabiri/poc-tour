import Image from 'next/image'
import Link from 'next/link'
import { RichText } from '@payloadcms/richtext-lexical/react'

import { Container, SectionLabel, ArrowLink, Icon, CornerSeal } from '@/components/ui'
import { NewsCard } from '@/components/sections/news/NewsCard'
import { AgendaCard } from '@/components/sections/agenda/AgendaCard'
import { RubriqueHero } from '@/components/shared/rubrique-hero'
import { RubriqueCard } from '@/components/shared/rubrique-card'
import { getPayloadClient } from '@/lib/payload'
import type { IconName } from '@/lib/icons'

import type { Actualite, Evenement, Media, Rubrique } from '@/payload-types'

/**
 * BlockRenderer — maps each Payload landing block (the curated block library) to
 * a React component, using semantic design tokens only (CLAUDE.md §1/§2: no
 * arbitrary Tailwind values, no raw palette colours). This is the front-office
 * half of the page-builder: editors stack blocks on a rubrique landing, this
 * renders them.
 *
 * Reuse: the homepage section components (`Hero`, `Services`, `News`, `Agenda`,
 * `DedicatedSpaces`, `Newsletter`, `Featured`) are bound to static `data/*.json`
 * and take no props, so they cannot be fed block data directly. We therefore
 * reuse the prop-driven pieces they are built from — the card components
 * (`NewsCard`, `AgendaCard`) and the shared UI primitives (`Container`,
 * `SectionLabel`, `Tag`, `ArrowLink`, `Icon`) — to render the same
 * visual language driven by Payload data. Blocks with no existing component get a
 * minimal, token-only placeholder.
 */

/**
 * A landing block is one member of the `Rubrique.landing` union. Article bodies
 * (`Article['body']`) and page layouts (`Page['layout']`) are the SAME block
 * library typed per-collection; we treat them as structurally identical here.
 * `BlockLike` is the permissive element type the public `Blocks` component
 * accepts so callers can pass any of those arrays (cast at the call boundary if
 * the per-collection element type does not assign cleanly).
 */
type LandingBlock = NonNullable<NonNullable<Rubrique['landing']>[number]>
type BlockLike = LandingBlock

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

/** Id of a (populated or bare) rubrique relation. */
const relIdOf = (r: (number | null) | Rubrique | undefined): number | null =>
  r && typeof r === 'object' ? r.id : typeof r === 'number' ? r : null

/**
 * Rubrique ids to filter an auto NewsList/Agenda by: the block's explicit
 * `filterRubriques`, falling back to the current rubrique so a landing section
 * shows its own thematic content by default.
 */
const filterRubriqueIds = (
  filter: ((number | null) | Rubrique)[] | null | undefined,
  rubrique?: Rubrique,
): number[] => {
  const ids = (filter ?? []).map(relIdOf).filter((x): x is number => x != null)
  if (ids.length > 0) return ids
  return rubrique ? [rubrique.id] : []
}

/** "Voir tout" target for a NewsList/Agenda: first filter branch, else the rubrique. */
const seeAllHref = (
  filter: ((number | null) | Rubrique)[] | null | undefined,
  rubrique?: Rubrique,
): string | null => {
  const populated = (filter ?? []).find(
    (r): r is Rubrique => typeof r === 'object' && r !== null,
  )
  const target = populated ?? rubrique
  return target ? rubriqueHref(target) : null
}

/** A short prose date for events (no extra date lib). */
const eventDateParts = (iso: string): { day: string; month: string } => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return { day: '', month: '' }
  return {
    day: String(d.getDate()).padStart(2, '0'),
    month: d.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase(),
  }
}

/**
 * A section heading shared by most blocks: optional SectionLabel-style eyebrow is
 * skipped, we just render the block `title` as an h2 in the brand voice.
 */
function BlockHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-brand-primary-dark mb-7 mt-2.5 text-3xl font-bold leading-tight">
      {children}
    </h2>
  )
}

function HeroBlockView({
  block,
  rubrique,
}: {
  block: Extract<LandingBlock, { blockType: 'hero' }>
  rubrique?: Rubrique
}) {
  // The shared rubrique title band (compact, aplat de charte / visual). The
  // page-top filet is rendered by the route; the fil d'Ariane is integrated
  // INTO this band (one cohesive masthead) when the owning rubrique is known.
  return (
    <RubriqueHero
      title={block.title}
      intro={block.subtitle}
      image={mediaSrc(block.image)}
      breadcrumbs={rubrique?.breadcrumbs ?? []}
      currentTitle={rubrique?.title}
    >
      {block.ctas && block.ctas.length > 0 ? (
        <div className="mt-7 flex flex-wrap gap-3">
          {block.ctas.map((cta) => (
            <a
              key={cta.id ?? cta.url}
              href={cta.url}
              className="bg-brand-primary text-text-inverse hover:bg-brand-primary-mid rounded-md px-6 py-3 text-base font-semibold no-underline transition-colors"
            >
              {cta.label}
            </a>
          ))}
        </div>
      ) : null}
    </RubriqueHero>
  )
}

function RichTextBlockView({
  block,
}: {
  block: Extract<LandingBlock, { blockType: 'richText' }>
}) {
  return (
    <Container className="py-10">
      <div className="prose-touraine text-text-primary max-w-3xl leading-relaxed">
        <RichText data={block.content} />
      </div>
    </Container>
  )
}

function ImageTextBlockView({
  block,
}: {
  block: Extract<LandingBlock, { blockType: 'imageText' }>
}) {
  const img = mediaSrc(block.image)
  const imageRight = block.imagePosition === 'right'
  return (
    <Container className="py-10">
      <div
        className={`grid items-center gap-8 md:grid-cols-2 ${
          imageRight ? 'md:[direction:rtl]' : ''
        }`}
      >
        <div className="md:[direction:ltr]">
          {img ? (
            <Image
              src={img.url}
              alt={img.alt}
              width={640}
              height={420}
              className="h-auto w-full rounded-lg object-cover"
            />
          ) : null}
        </div>
        <div className="prose-touraine text-text-primary md:[direction:ltr]">
          <RichText data={block.content} />
        </div>
      </div>
    </Container>
  )
}

function CardGridBlockView({
  block,
}: {
  block: Extract<LandingBlock, { blockType: 'cardGrid' }>
}) {
  const heading = block.title ? (
    <>
      <SectionLabel>Découvrir</SectionLabel>
      <BlockHeading>{block.title}</BlockHeading>
    </>
  ) : null

  // Sub-rubriques source: the section's child rubriques as iconographed cards
  // (the heart of a T2 landing) — icon + title + short description + CornerSeal.
  if (block.source === 'rubriques') {
    const cards = (block.rubriques ?? [])
      .filter((r): r is Rubrique => typeof r === 'object' && r !== null)
      .map((r) => ({
        key: String(r.id),
        icon: (r.icon ?? null) as IconName | null,
        title: r.title,
        description: r.seo?.metaDescription ?? null,
        href: rubriqueHref(r),
      }))
    if (cards.length === 0) return null
    return (
      <Container className="py-12">
        {heading}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(290px,1fr))] gap-5">
          {cards.map((c) => (
            <RubriqueCard
              key={c.key}
              item={{ icon: c.icon, title: c.title, description: c.description, href: c.href }}
            />
          ))}
        </div>
      </Container>
    )
  }

  // Manual source: authored image cards (title + text + visual + link).
  const cards = (block.cards ?? []).map((c) => ({
    key: c.id ?? c.title,
    title: c.title,
    text: c.text ?? null,
    image: mediaSrc(c.image),
    href: c.url ?? '#',
  }))
  if (cards.length === 0) return null
  return (
    <Container className="py-12">
      {heading}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
        {cards.map((card) => (
          <a
            key={card.key}
            href={card.href}
            className="group bg-surface-main border-border-main hover:shadow-card-hover relative block overflow-hidden rounded-xl border p-6 no-underline transition-all hover:-translate-y-1.5"
          >
            <CornerSeal />
            {card.image ? (
              <Image
                src={card.image.url}
                alt={card.image.alt}
                width={400}
                height={220}
                className="mb-4 h-40 w-full rounded-md object-cover"
              />
            ) : null}
            <h3 className="text-brand-primary-dark mb-2 text-lg font-bold">
              {card.title}
            </h3>
            {card.text ? (
              <p className="text-text-muted text-sm leading-relaxed">{card.text}</p>
            ) : null}
          </a>
        ))}
      </div>
    </Container>
  )
}

function FaqBlockView({ block }: { block: Extract<LandingBlock, { blockType: 'faq' }> }) {
  return (
    <Container className="py-10">
      {block.title ? <BlockHeading>{block.title}</BlockHeading> : null}
      <div className="flex flex-col gap-3">
        {block.items.map((item) => (
          <details
            key={item.id ?? item.question}
            className="bg-surface-main border-border-main group rounded-lg border p-5"
          >
            <summary className="text-brand-primary-dark cursor-pointer list-none text-base font-semibold">
              {item.question}
            </summary>
            <div className="prose-touraine text-text-primary mt-3 text-sm leading-relaxed">
              <RichText data={item.answer} />
            </div>
          </details>
        ))}
      </div>
    </Container>
  )
}

function CtaFormBlockView({
  block,
}: {
  block: Extract<LandingBlock, { blockType: 'ctaForm' }>
}) {
  const formId =
    typeof block.formulaire === 'object' ? block.formulaire.id : block.formulaire
  return (
    <Container className="py-10">
      <div className="bg-surface-brand text-text-inverse rounded-xl p-8">
        {block.title ? (
          <h2 className="font-display text-text-inverse text-2xl font-bold">
            {block.title}
          </h2>
        ) : null}
        {block.description ? (
          <p className="text-text-on-brand mt-3 max-w-2xl leading-relaxed">
            {block.description}
          </p>
        ) : null}
        <div className="mt-6">
          <a
            href={`/formulaire/${formId}`}
            className="bg-brand-primary text-text-inverse hover:bg-brand-primary-mid inline-block rounded-md px-6 py-3 text-base font-semibold no-underline transition-colors"
          >
            {block.displayMode === 'inline' ? 'Remplir le formulaire' : 'Accéder au formulaire'}
          </a>
        </div>
      </div>
    </Container>
  )
}

function MapEmbedBlockView({
  block,
}: {
  block: Extract<LandingBlock, { blockType: 'mapEmbed' }>
}) {
  return (
    <Container className="py-10">
      {block.title ? <BlockHeading>{block.title}</BlockHeading> : null}
      {block.displayMode === 'inline-iframe' ? (
        <iframe
          src={block.arcgisItemUrl}
          title={block.title ?? 'Carte'}
          className="border-border-main h-96 w-full rounded-lg border"
        />
      ) : (
        <a
          href={block.arcgisItemUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-brand-primary text-text-inverse hover:bg-brand-primary-dark inline-flex items-center gap-2 rounded-md px-6 py-3 text-base font-semibold no-underline transition-colors"
        >
          <Icon name="map-pin" size={18} />
          Ouvrir la carte en plein écran
        </a>
      )}
    </Container>
  )
}

async function NewsListBlockView({
  block,
  rubrique,
}: {
  block: Extract<LandingBlock, { blockType: 'newsList' }>
  rubrique?: Rubrique
}) {
  // Reuses NewsCard (the prop-driven card behind the homepage News section).
  // `manual` pins a selection; `auto` queries the latest actualités filtered to
  // the block's branches (or the current rubrique) — the "filtered news" of a T2.
  let items: Actualite[]
  if (block.mode === 'manual') {
    items = (block.items ?? []).filter(
      (a): a is Actualite => typeof a === 'object' && a !== null,
    )
  } else {
    const payload = await getPayloadClient()
    const ids = filterRubriqueIds(block.filterRubriques, rubrique)
    const res = await payload.find({
      collection: 'actualite',
      where: ids.length > 0 ? { rubriques: { in: ids } } : {},
      sort: '-date',
      limit: block.limit ?? 4,
      draft: false,
      depth: 2,
    })
    items = res.docs as Actualite[]
  }
  if (items.length === 0) return null

  const allHref = seeAllHref(block.filterRubriques, rubrique)
  return (
    <Container className="py-12">
      <SectionLabel>{block.title ?? 'Actualités'}</SectionLabel>
      <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5">
        {items.map((a) => {
          const img = mediaSrc(a.image)
          return (
            <NewsCard
              key={a.id}
              item={{
                tag: a.tag ?? 'Actualité',
                title: a.title,
                // NewsCard renders `image` as a CSS background; pass a token-driven
                // brand wash when there is no media so it stays on-palette.
                image: img ? `url(${img.url}) center/cover` : 'var(--color-surface-brand)',
                href: rubriqueHref(a.rubriques?.[0]) + `/${a.slug ?? a.id}`,
              }}
            />
          )
        })}
      </div>
      {allHref ? (
        <div className="mt-7">
          <ArrowLink href={allHref} groupTriggered={false}>
            Toutes les actualités
          </ArrowLink>
        </div>
      ) : null}
    </Container>
  )
}

async function AgendaBlockView({
  block,
  rubrique,
}: {
  block: Extract<LandingBlock, { blockType: 'agenda' }>
  rubrique?: Rubrique
}) {
  // Reuses AgendaCard (the prop-driven card behind the homepage Agenda section).
  // `manual` pins a selection; `auto` queries upcoming événements filtered to the
  // block's branches (or the current rubrique) — the "filtered agenda" of a T2.
  let items: Evenement[]
  if (block.mode === 'manual') {
    items = (block.items ?? []).filter(
      (e): e is Evenement => typeof e === 'object' && e !== null,
    )
  } else {
    const payload = await getPayloadClient()
    const ids = filterRubriqueIds(block.filterRubriques, rubrique)
    const res = await payload.find({
      collection: 'evenement',
      where: ids.length > 0 ? { rubriques: { in: ids } } : {},
      sort: 'startDate',
      limit: block.limit ?? 3,
      draft: false,
      depth: 2,
    })
    items = res.docs as Evenement[]
  }
  if (items.length === 0) return null

  const allHref = seeAllHref(block.filterRubriques, rubrique)
  return (
    <Container className="py-12">
      <SectionLabel>{block.title ?? 'Agenda'}</SectionLabel>
      <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
        {items.map((e) => {
          const { day, month } = eventDateParts(e.startDate)
          return (
            <AgendaCard
              key={e.id}
              item={{
                day,
                month,
                title: e.title,
                place: e.location ?? '',
                category: e.category ?? 'autre',
                href: rubriqueHref(e.rubriques?.[0]) + `/${e.slug ?? e.id}`,
              }}
            />
          )
        })}
      </div>
      {allHref ? (
        <div className="mt-7">
          <ArrowLink href={allHref} groupTriggered={false}>
            Tout l’agenda
          </ArrowLink>
        </div>
      ) : null}
    </Container>
  )
}

function PartnersBlockView({
  block,
}: {
  block: Extract<LandingBlock, { blockType: 'partners' }>
}) {
  return (
    <Container className="py-12">
      {block.title ? <BlockHeading>{block.title}</BlockHeading> : null}
      <div className="flex flex-wrap items-center gap-8">
        {block.partners.map((p) => {
          const logo = mediaSrc(p.logo)
          const inner = logo ? (
            <Image src={logo.url} alt={logo.alt || p.name} width={140} height={70} className="h-16 w-auto object-contain" />
          ) : (
            <span className="text-text-muted text-sm font-semibold">{p.name}</span>
          )
          return p.url ? (
            <a key={p.id ?? p.name} href={p.url} target="_blank" rel="noopener noreferrer" className="no-underline">
              {inner}
            </a>
          ) : (
            <span key={p.id ?? p.name}>{inner}</span>
          )
        })}
      </div>
    </Container>
  )
}

function RelatedLinksBlockView({
  block,
}: {
  block: Extract<LandingBlock, { blockType: 'relatedLinks' }>
}) {
  return (
    <Container className="py-10">
      <SectionLabel>{block.title ?? 'Liens utiles'}</SectionLabel>
      <ul className="mt-5 flex flex-col gap-2">
        {block.links.map((link) => {
          const href = link.type === 'external' ? (link.url ?? '#') : rubriqueHref(link.rubrique)
          const label =
            link.label ??
            (typeof link.rubrique === 'object' && link.rubrique ? link.rubrique.title : link.url) ??
            'Lien'
          return (
            <li key={link.id ?? label}>
              <span className="inline-block">
                <ArrowLink href={href} iconSize={16}>
                  {label}
                </ArrowLink>
              </span>
            </li>
          )
        })}
      </ul>
    </Container>
  )
}

function DownloadListBlockView({
  block,
}: {
  block: Extract<LandingBlock, { blockType: 'downloadList' }>
}) {
  return (
    <Container className="py-10">
      {block.title ? <BlockHeading>{block.title}</BlockHeading> : null}
      <ul className="flex flex-col gap-2">
        {block.files.map((f) => {
          const media = typeof f.file === 'object' ? f.file : null
          const href = media?.url ?? '#'
          const label = f.label ?? media?.filename ?? 'Fichier'
          return (
            <li key={f.id ?? label}>
              <a
                href={href}
                download
                className="bg-surface-main border-border-main text-brand-primary-dark hover:shadow-card-sm flex items-center gap-3 rounded-lg border p-4 no-underline transition-shadow"
              >
                <Icon name="file-text" size={20} />
                <span className="text-sm font-semibold">{label}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </Container>
  )
}

function BreadcrumbBlockView({
  block,
  rubrique,
}: {
  block: Extract<LandingBlock, { blockType: 'breadcrumb' }>
  rubrique: Rubrique
}) {
  const crumbs = rubrique.breadcrumbs ?? []
  return (
    <Container className="pt-6">
      <nav aria-label="Fil d'Ariane" className="text-text-muted text-sm">
        <ol className="flex flex-wrap items-center gap-2">
          {block.showHome !== false ? (
            <li>
              <Link href="/" className="hover:text-action no-underline">
                Accueil
              </Link>
              <span aria-hidden="true" className="ml-2">
                /
              </span>
            </li>
          ) : null}
          {crumbs.map((c, i) => {
            const isLast = i === crumbs.length - 1
            const label = isLast
              ? (block.currentLabelOverride ?? c.label ?? rubrique.title)
              : (c.label ?? '')
            const url = c.url ? (c.url.startsWith('/') ? c.url : `/${c.url}`) : '#'
            return (
              <li key={c.id ?? `${label}-${i}`}>
                {isLast ? (
                  <span aria-current="page" className="text-text-primary font-semibold">
                    {label}
                  </span>
                ) : (
                  <>
                    <a href={url} className="hover:text-action no-underline">
                      {label}
                    </a>
                    <span aria-hidden="true" className="ml-2">
                      /
                    </span>
                  </>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </Container>
  )
}

/** Render a single block, switching exhaustively on its discriminant. */
function Block({ block, rubrique }: { block: LandingBlock; rubrique?: Rubrique }) {
  switch (block.blockType) {
    case 'hero':
      return <HeroBlockView block={block} rubrique={rubrique} />
    case 'richText':
      return <RichTextBlockView block={block} />
    case 'imageText':
      return <ImageTextBlockView block={block} />
    case 'cardGrid':
      return <CardGridBlockView block={block} />
    case 'faq':
      return <FaqBlockView block={block} />
    case 'ctaForm':
      return <CtaFormBlockView block={block} />
    case 'mapEmbed':
      return <MapEmbedBlockView block={block} />
    case 'newsList':
      return <NewsListBlockView block={block} rubrique={rubrique} />
    case 'agenda':
      return <AgendaBlockView block={block} rubrique={rubrique} />
    case 'partners':
      return <PartnersBlockView block={block} />
    case 'relatedLinks':
      return <RelatedLinksBlockView block={block} />
    case 'downloadList':
      return <DownloadListBlockView block={block} />
    case 'breadcrumb':
      // The breadcrumb is structural: with no owning rubrique there is nothing
      // to render, so guard rather than crash when `Blocks` is fed a bare stack.
      return rubrique ? <BreadcrumbBlockView block={block} rubrique={rubrique} /> : null
    default: {
      // Exhaustiveness guard: a new block type must be handled above.
      const _exhaustive: never = block
      return _exhaustive
    }
  }
}

/**
 * Render an ARBITRARY block stack in order — the shared engine behind rubrique
 * landings, article bodies and page layouts. The optional `rubrique` is threaded
 * through so structural blocks (breadcrumb) can read its breadcrumbs; pass it
 * when the stack belongs to a rubrique, omit it for free-standing bodies.
 *
 * `blocks` is typed loosely (the landing block union, nullable) so callers can
 * feed `page.layout` / `article.body` — cast at the call site if the
 * per-collection element type does not assign cleanly.
 */
export function Blocks({
  blocks,
  rubrique,
}: {
  blocks: BlockLike[] | null | undefined
  rubrique?: Rubrique
}): React.ReactNode {
  if (!blocks || blocks.length === 0) return null
  return (
    <>
      {blocks.map((block, i) => (
        <Block key={block.id ?? `${block.blockType}-${i}`} block={block} rubrique={rubrique} />
      ))}
    </>
  )
}

/**
 * Render a rubrique's landing block stack in order. Thin wrapper over `Blocks`
 * that supplies the rubrique's own `landing` array and threads the rubrique so
 * structural blocks (breadcrumb) can read its breadcrumbs.
 */
export function BlockRenderer({ rubrique }: { rubrique: Rubrique }) {
  return <Blocks blocks={rubrique.landing} rubrique={rubrique} />
}

export default BlockRenderer
