import Image from 'next/image'

import { Container, SectionLabel, CornerSeal, Icon, ArrowLink, Reveal, StickySommaire } from '@/components/ui'
import { Accordion } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { RubriqueHero } from '@/components/shared/rubrique-hero'
import { RubriqueCard } from '@/components/shared/rubrique-card'
import { getPayloadClient } from '@/lib/payload'
import {
  RUBRIQUE_CONTENT,
  type RubriqueContent,
  type ContentSection,
  type FeatureItem,
  type KeyFigure,
  type SectionMedia,
} from '@/data/rubriques-content'
import type { IconName } from '@/lib/icons'

import type { Media, Rubrique } from '@/payload-types'

/**
 * RubriqueServiceTemplate — gabarit « Page de rubrique éditoriale » (refonte T2bis).
 *
 * Une page de rubrique longue (ex. « Un Département en action »), en DEUX COLONNES :
 *  - colonne principale (8/12) : chapô éditorial, puis des sections RYTHMÉES — chaque
 *    section porte un `layout` (`stats` : rangée de chiffres-clés Fraunces ; `media` :
 *    visuel/aplat de charte latéral en alternance gauche/droite ; `cards` : feature-cards
 *    à icône thématique), numérotées 01/02… en écho au sommaire, sur fonds alternés
 *    blanc / canvas. Puis FAQ accordéon, documents, liens utiles, et un CTA d'aide en
 *    BANDEAU CLAIR (séparé de la newsletter sombre du footer pour éviter le « mur sombre »).
 *  - colonne latérale (4/12, collante desktop, sous le contenu en mobile) : SOMMAIRE
 *    sticky avec scroll-spy (StickySommaire), encadré « Chiffres-clés », « En 1 clic »
 *    et « Contacts utiles ». La sidebar est TOUJOURS rendue → plus de vide à droite.
 *
 * DATA-DRIVEN : tout le contenu provient du catalogue typé `RUBRIQUE_CONTENT`
 * (clé = chemin de slug de la rubrique). Chaque section/encadré est conditionné par sa
 * donnée. Server Component qui ne renvoie QUE le contenu `main` (le filet du haut et le
 * chrome sont fournis par la route) ; tokens sémantiques uniquement (CLAUDE.md §1/§2).
 * Les seuls îlots client sont l'accordéon FAQ et le sommaire scroll-spy.
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

/**
 * The `RUBRIQUE_CONTENT` lookup key for a rubrique: its full slug-path, taken
 * from the last fil d'Ariane url (e.g. "mes-services-au-quotidien/securite").
 */
const contentKey = (rubrique: Rubrique): string => {
  const crumbs = rubrique.breadcrumbs ?? []
  const last = crumbs.length > 0 ? crumbs[crumbs.length - 1]?.url : null
  const path = (last ?? rubrique.slug ?? '').toString()
  return path.replace(/^\//, '')
}

/** A stable anchor id from a section heading (accents stripped, kebab-cased). */
const sectionId = (heading: string, i: number): string => {
  const slug = heading
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
  return slug || `section-${i + 1}`
}

/** Href of a « liens utiles » entry: internal rubrique path or external url. */
const relatedHref = (link: { path?: string; url?: string }): string => {
  if (link.url) return link.url
  if (link.path) return link.path.startsWith('/') ? link.path : `/${link.path}`
  return '#'
}

/** Split a download label like "Guide … (PDF)" into a title + format tag. */
const parseDownload = (label: string): { title: string; format: string | null } => {
  const m = label.match(/\(([^)]+)\)\s*$/)
  if (m && m.index !== undefined) {
    return { title: label.slice(0, m.index).trim(), format: m[1].toUpperCase() }
  }
  return { title: label, format: null }
}

/**
 * Whether a rubrique renders through the « Page de rubrique éditoriale » gabarit:
 * ANY editorial rubrique whose catalog entry has structured sections — across all
 * areas (« Mes services au quotidien », « Le Département », espaces dédiés, accès
 * directs…). The contact page and the actus/agenda/MDS index rubriques keep their
 * own gabarits because the dispatcher tests them BEFORE this one; démarche leaves
 * are article routes, so they never reach here. The dispatcher only calls this
 * for rubrique routes.
 */
export function isServiceRubrique(rubrique: Rubrique): boolean {
  const content = RUBRIQUE_CONTENT[contentKey(rubrique)]
  return !!(content?.sections && content.sections.length > 0)
}

/**
 * Section header shared across the whole main column. Every block has the SAME
 * structure so the page reads as one consistent rhythm:
 *  1. a charte accent line — the thematic `eyebrow` (coral SectionLabel) when one
 *     is set, otherwise a bare rainbow tick, so the rainbow accent is always
 *     present and no block looks "naked";
 *  2. the 01/02… number SIDE BY SIDE with the heading, baseline-aligned so the
 *     number sits on the title's first line — short titles stay tight, long /
 *     multi-line titles wrap in their own column without pushing the number out
 *     of place.
 *
 * The heading keeps a single fixed size everywhere (`text-2xl md:text-3xl`), so
 * there is never a mismatched-size or « two titles » effect between blocks.
 */
function SectionHead({
  num,
  eyebrow,
  children,
}: {
  num?: string | null
  eyebrow?: string | null
  children: React.ReactNode
}) {
  return (
    <header className="mb-5">
      {eyebrow ? (
        <SectionLabel>{eyebrow}</SectionLabel>
      ) : (
        <span aria-hidden="true" className="bg-rainbow block h-1 w-7 rounded-sm" />
      )}
      <div className="mt-3 flex items-baseline gap-3 md:gap-4">
        {num ? (
          <span
            aria-hidden="true"
            className="font-display text-brand-accent shrink-0 text-2xl font-black leading-none tabular-nums md:text-3xl"
          >
            {num}
          </span>
        ) : null}
        <h2 className="font-display text-brand-primary-dark text-2xl font-bold leading-tight md:text-3xl">
          {children}
        </h2>
      </div>
    </header>
  )
}

/** Editorial paragraphs at a comfortable measure (~65ch) for long-form reading. */
function Paragraphs({ items }: { items: string[] }) {
  return (
    <div className="max-w-prose">
      {items.map((p, j) => (
        <p
          key={j}
          className="text-text-primary mt-4 text-base leading-relaxed first:mt-0"
        >
          {p}
        </p>
      ))}
    </div>
  )
}

/** A highlight / pull-quote box for a strong piece of information. */
function Highlight({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="bg-surface-tint-blue text-brand-primary-dark border-brand-accent mt-6 rounded-r-lg border-l-4 p-5 text-base font-medium leading-relaxed">
      {children}
    </blockquote>
  )
}

/** Key bullets rendered as feature-items (icon + label) — the `bullets` fallback. */
function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="mt-6 grid gap-x-6 gap-y-3 sm:grid-cols-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="bg-surface-tint-blue text-brand-primary mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
          >
            <Icon name="check" size={16} />
          </span>
          <span className="text-text-primary text-sm leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  )
}

/**
 * One modern thematic feature-card: icon pastille (light blue → solid deep blue
 * with a white glyph + slight scale on hover/focus), Fraunces label, Outfit
 * description, and a thin RAINBOW liseré at the top that thickens on hover —
 * the SAME accent language as `RubriqueCard` (charte consistency, no corner
 * seal here). `flex h-full flex-col` so cards align to a homogeneous height in
 * the grid; the icon + filet are decorative (`aria-hidden`, never under text).
 */
function FeatureCard({ item }: { item: FeatureItem }) {
  return (
    <li className="group bg-surface-main border-border-main shadow-card-sm hover:shadow-card-hover ease-brand relative flex h-full flex-col overflow-hidden rounded-card border p-5 transition-all duration-[400ms] hover:-translate-y-1 hover:border-brand-primary-mid">
      <span
        aria-hidden="true"
        className="bg-rainbow ease-brand absolute inset-x-0 top-0 h-[3px] origin-top transition-transform duration-[400ms] group-hover:scale-y-[2.3]"
      />
      <span
        aria-hidden="true"
        className="bg-surface-tint-blue text-brand-primary group-hover:bg-surface-tint-blue-strong group-hover:text-text-inverse ease-brand mb-4 grid h-12 w-12 shrink-0 place-items-center rounded-[14px] transition-all duration-[400ms] group-hover:scale-105"
      >
        <Icon name={item.icon} size={24} />
      </span>
      <h3 className="font-display text-brand-primary-dark text-base font-semibold leading-snug">
        {item.label}
      </h3>
      {item.text ? (
        <p className="text-text-muted mt-2 text-sm leading-relaxed">{item.text}</p>
      ) : null}
    </li>
  )
}

/**
 * The feature-card grid — ALWAYS full width of its container, never squeezed
 * beside a media panel. `auto-fit minmax(230px, 1fr)` guarantees no column ever
 * drops below 230px (so descriptions wrap as normal prose, never word-by-word):
 * 1 column on mobile, 2–3 on tablet/desktop, with equal-height cards.
 */
function FeatureCards({ items }: { items: FeatureItem[] }) {
  return (
    <ul className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] items-stretch gap-4">
      {items.map((f, i) => (
        <FeatureCard key={i} item={f} />
      ))}
    </ul>
  )
}

/**
 * A row of big « chiffres-clés » rendered as ONE connected panel: white cells
 * separated by hairline dividers (a `gap-px` over a border-coloured backdrop),
 * each with a rainbow accent tick + Fraunces figure + label. It reads as a
 * deliberate stats block (same surface/border language as the side-rail card).
 *
 * Layout: 2 columns by default, 4 across only at `xl` where the main column is
 * wide enough — so a long value like « +100 M€ » never gets squeezed into a
 * too-narrow 4-up cell. `whitespace-nowrap` + `tabular-nums` keep every figure
 * on a single line; the figure grows to `4xl` only at `xl` (room to breathe).
 */
function StatsRow({ items }: { items: KeyFigure[] }) {
  return (
    <dl className="bg-border-main border-border-main mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border xl:grid-cols-4">
      {items.map((s, i) => (
        <div key={i} className="bg-surface-main flex flex-col p-5 md:p-6">
          <span aria-hidden="true" className="bg-rainbow mb-3 block h-1 w-8 rounded-sm" />
          <dt className="font-display text-brand-primary-dark whitespace-nowrap text-3xl font-black leading-none tracking-tight tabular-nums xl:text-4xl">
            {s.value}
          </dt>
          <dd className="text-text-muted mt-2 text-sm leading-snug">{s.label}</dd>
        </div>
      ))}
    </dl>
  )
}

/** The section visual for a `media` layout: a real image OR a branded aplat de charte. */
function SectionMediaPanel({ media }: { media: SectionMedia }) {
  if (media.url) {
    return (
      <div className="border-border-main relative aspect-[4/3] overflow-hidden rounded-2xl border">
        <Image
          src={media.url}
          alt={media.alt ?? ''}
          fill
          sizes="(min-width: 768px) 40vw, 100vw"
          className="object-cover"
        />
      </div>
    )
  }
  // Aplat de charte — no photo: a tone-driven panel with a thematic icon + seal.
  const onTint = media.tone === 'tint'
  return (
    <div
      className={`relative grid aspect-[4/3] place-items-center overflow-hidden rounded-2xl ${
        onTint ? 'bg-surface-tint-blue' : 'bg-surface-brand'
      }`}
    >
      <CornerSeal />
      {media.icon ? (
        <Icon
          name={media.icon}
          size={84}
          className={onTint ? 'text-brand-primary' : 'text-text-inverse'}
        />
      ) : null}
      <span aria-hidden="true" className="bg-rainbow absolute inset-x-0 bottom-0 h-1.5" />
    </div>
  )
}

/** A side-rail card shell (white surface, border, optional CornerSeal). */
function AsideCard({
  label,
  seal = false,
  children,
}: {
  label: string
  seal?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="bg-surface-main border-border-main relative overflow-hidden rounded-2xl border p-6">
      {seal ? <CornerSeal /> : null}
      <SectionLabel>{label}</SectionLabel>
      <div className="mt-5">{children}</div>
    </div>
  )
}

/** « Chiffres-clés » side-rail card — compact figures at the département scale. */
function KeyFiguresAside({ figures }: { figures: KeyFigure[] }) {
  return (
    <AsideCard label="Chiffres-clés" seal>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-5">
        {figures.map((f, i) => (
          <div key={i}>
            <dt className="font-display text-brand-primary-dark text-2xl font-black leading-none">
              {f.value}
            </dt>
            <dd className="text-text-muted mt-1.5 text-xs leading-snug">{f.label}</dd>
          </div>
        ))}
      </dl>
    </AsideCard>
  )
}

/** « En 1 clic » side-rail card — real page links (not anchors). */
function QuickLinksAside({
  links,
}: {
  links: NonNullable<RubriqueContent['quickLinks']>
}) {
  return (
    <AsideCard label="En 1 clic">
      <ul className="flex flex-col gap-2.5">
        {links.map((link, i) => (
          <li key={i}>
            <span className="inline-block">
              <ArrowLink href={relatedHref(link)} iconSize={16}>
                {link.label}
              </ArrowLink>
            </span>
          </li>
        ))}
      </ul>
    </AsideCard>
  )
}

/** Contacts utiles — side-rail card. */
function ContactsAside({
  contacts,
}: {
  contacts: NonNullable<RubriqueContent['contacts']>
}) {
  return (
    <AsideCard label="Contacts utiles" seal>
      <ul className="divide-border-main -mt-1 flex flex-col divide-y">
        {contacts.map((c, i) => (
          <li key={`${c.name}-${i}`} className="py-4 first:pt-0 last:pb-0">
            <h3 className="text-brand-primary-dark text-base font-bold leading-snug">
              {c.name}
            </h3>
            {c.role ? (
              <p className="text-text-muted mt-0.5 text-xs font-semibold uppercase tracking-wide">
                {c.role}
              </p>
            ) : null}
            <dl className="mt-3 flex flex-col gap-2 text-sm">
              {c.phone ? (
                <div className="flex items-start gap-2">
                  <dt className="text-icon-muted shrink-0">
                    <Icon name="phone" size={16} />
                    <span className="sr-only">Téléphone</span>
                  </dt>
                  <dd>
                    <a
                      href={`tel:${c.phone.replace(/[^0-9+]/g, '')}`}
                      className="text-text-primary no-underline"
                    >
                      {c.phone}
                    </a>
                  </dd>
                </div>
              ) : null}
              {c.email ? (
                <div className="flex items-start gap-2">
                  <dt className="text-icon-muted shrink-0">
                    <Icon name="mail" size={16} />
                    <span className="sr-only">Courriel</span>
                  </dt>
                  <dd className="min-w-0">
                    <a
                      href={`mailto:${c.email}`}
                      className="text-action hover:text-action-hover break-all no-underline"
                    >
                      {c.email}
                    </a>
                  </dd>
                </div>
              ) : null}
              {c.address ? (
                <div className="flex items-start gap-2">
                  <dt className="text-icon-muted shrink-0">
                    <Icon name="map-pin" size={16} />
                    <span className="sr-only">Adresse</span>
                  </dt>
                  <dd className="text-text-primary">{c.address}</dd>
                </div>
              ) : null}
            </dl>
          </li>
        ))}
      </ul>
    </AsideCard>
  )
}

/** Render one editorial section's body according to its `layout`. */
function SectionBody({ section, index }: { section: ContentSection; index: number }) {
  const layout = section.layout ?? 'cards'

  if (layout === 'stats') {
    return (
      <>
        {section.paragraphs?.length ? <Paragraphs items={section.paragraphs} /> : null}
        {section.stats?.length ? <StatsRow items={section.stats} /> : null}
        {section.highlight ? <Highlight>{section.highlight}</Highlight> : null}
      </>
    )
  }

  if (layout === 'media' && section.media) {
    const side = section.media.side ?? (index % 2 === 0 ? 'left' : 'right')
    // Two stacked rows, NOT two squeezed columns:
    //  1. visual (≈40%) + intro text (≈60%) side by side — image above text on
    //     mobile; side alternates left/right on desktop only;
    //  2. the feature-cards in a FULL-WIDTH grid below, so they are never
    //     crammed into the 40% gutter (the cause of the staircase text).
    return (
      <>
        <div className="mt-2 grid gap-6 md:grid-cols-5 md:items-center md:gap-8">
          <div className={side === 'right' ? 'md:order-2 md:col-span-2' : 'md:col-span-2'}>
            <SectionMediaPanel media={section.media} />
          </div>
          <div className={side === 'right' ? 'md:order-1 md:col-span-3' : 'md:col-span-3'}>
            {section.paragraphs?.length ? <Paragraphs items={section.paragraphs} /> : null}
            {section.highlight ? <Highlight>{section.highlight}</Highlight> : null}
          </div>
        </div>
        {section.features?.length ? (
          <FeatureCards items={section.features} />
        ) : section.bullets?.length ? (
          <FeatureList items={section.bullets} />
        ) : null}
      </>
    )
  }

  // Default 'cards' layout — prose at a comfortable measure, then the
  // feature-cards in a full-width auto-fit grid.
  return (
    <>
      {section.paragraphs?.length ? <Paragraphs items={section.paragraphs} /> : null}
      {section.highlight ? <Highlight>{section.highlight}</Highlight> : null}
      {section.features?.length ? (
        <FeatureCards items={section.features} />
      ) : section.bullets?.length ? (
        <FeatureList items={section.bullets} />
      ) : null}
    </>
  )
}

export async function RubriqueServiceTemplate({ rubrique }: { rubrique: Rubrique }) {
  const content = RUBRIQUE_CONTENT[contentKey(rubrique)]

  // Defensive fallback: if the catalog has no entry, degrade to the rubrique's
  // own fields so the page still renders a coherent (if sparse) masthead.
  const heroSubtitle = content?.heroSubtitle ?? rubrique.seo?.metaDescription ?? null
  const intro = content?.intro ?? []
  const sections = (content?.sections ?? []).map((s, i) => ({
    ...s,
    id: sectionId(s.heading, i),
  }))
  const faq = content?.faq ?? []
  const related = content?.related ?? []
  const downloads = content?.downloads ?? []
  const contacts = content?.contacts ?? []
  const keyFigures = content?.keyFigures ?? []
  const quickLinks = content?.quickLinks ?? []
  const map = content?.map ?? null
  const showCta = content?.contactCta !== false

  // Child rubriques (if any) keep their card grid, so this gabarit is a safe
  // superset of the auto-listing for N2 hubs (e.g. « Enfance et famille »).
  const payload = await getPayloadClient()
  const childrenRes = await payload.find({
    collection: 'rubriques',
    where: {
      and: [{ parent: { equals: rubrique.id } }, { visible: { equals: true } }],
    },
    sort: 'order',
    draft: false,
    depth: 1,
  })
  const children = childrenRes.docs as Rubrique[]

  // Build the summary: one anchor per section + the trailing service blocks.
  const summary: { id: string; label: string }[] = [
    ...sections.map((s) => ({ id: s.id, label: s.heading })),
    ...(map ? [{ id: 'carte', label: map.title || 'Carte interactive' }] : []),
    ...(children.length > 0 ? [{ id: 'explorer', label: 'Explorer cette rubrique' }] : []),
    ...(faq.length > 0 ? [{ id: 'faq', label: 'Questions fréquentes' }] : []),
    ...(downloads.length > 0 ? [{ id: 'documents', label: 'Documents à télécharger' }] : []),
    ...(related.length > 0 ? [{ id: 'liens', label: 'Liens utiles' }] : []),
  ]

  // The number shown on a main-column block, taken from its position in the
  // summary so every section's 01/02… badge matches the sommaire exactly.
  const numberOf = (id: string): string | null => {
    const idx = summary.findIndex((s) => s.id === id)
    return idx >= 0 ? String(idx + 1).padStart(2, '0') : null
  }

  // The side rail is rendered whenever it has at least one block; otherwise the
  // main column spans the full width (no empty 4/12 gutter on the right).
  const hasSommaire = summary.length >= 2
  const hasAside =
    hasSommaire || keyFigures.length > 0 || quickLinks.length > 0 || contacts.length > 0

  return (
    <article>
      <RubriqueHero
        title={rubrique.title}
        intro={heroSubtitle}
        image={mediaSrc(rubrique.seo?.ogImage)}
        breadcrumbs={rubrique.breadcrumbs ?? []}
        currentTitle={rubrique.title}
      />

      <Container className="py-10 lg:py-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          {/* ─── Colonne principale (8/12, ou pleine largeur sans sidebar) ─ */}
          <div className={`min-w-0 ${hasAside ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
            {/* Intro / chapô éditorial */}
            {intro.length > 0 ? (
              <div className="mb-12 max-w-prose">
                {intro.map((p, i) => (
                  <p
                    key={i}
                    className={`text-text-primary leading-relaxed ${
                      i === 0
                        ? 'text-brand-primary-dark text-xl font-medium'
                        : 'mt-4 text-lg'
                    }`}
                  >
                    {p}
                  </p>
                ))}
              </div>
            ) : null}

            {/* Sections éditoriales rythmées — cartes blanches homogènes, numérotées ;
                le rythme vient des layouts variés (stats / media / cards), pas du fond. */}
            <div className="flex flex-col gap-8">
              {sections.map((section, i) => (
                <Reveal key={section.id}>
                  <section
                    id={section.id}
                    tabIndex={-1}
                    className="bg-surface-main border-border-main shadow-card-sm scroll-mt-28 rounded-2xl border p-6 focus:outline-none md:p-9"
                  >
                    <SectionHead num={String(i + 1).padStart(2, '0')} eyebrow={section.eyebrow}>
                      {section.heading}
                    </SectionHead>
                    <SectionBody section={section} index={i} />
                  </section>
                </Reveal>
              ))}
            </div>

            {/* Carte interactive (ArcGIS) */}
            {map ? (
              <section id="carte" className="scroll-mt-28 mt-12">
                <SectionHead num={numberOf('carte')}>
                  {map.title || 'Carte interactive'}
                </SectionHead>
                <iframe
                  src={map.arcgisItemUrl}
                  title={map.title || 'Carte interactive'}
                  loading="lazy"
                  className="border-border-main h-96 w-full rounded-2xl border"
                />
              </section>
            ) : null}

            {/* Explorer — sous-rubriques (hubs N2) */}
            {children.length > 0 ? (
              <section id="explorer" className="scroll-mt-28 mt-12">
                <SectionHead num={numberOf('explorer')}>
                  Dans cette rubrique
                </SectionHead>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(290px,1fr))] gap-5">
                  {children.map((child) => (
                    <RubriqueCard
                      key={child.id}
                      item={{
                        icon: (child.icon ?? null) as IconName | null,
                        title: child.title,
                        description: child.seo?.metaDescription ?? null,
                        href: rubriqueHref(child),
                      }}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {/* FAQ — accordéon accessible (îlot client) */}
            {faq.length > 0 ? (
              <section id="faq" className="scroll-mt-28 mt-12">
                <SectionHead num={numberOf('faq')}>
                  Vos questions, nos réponses
                </SectionHead>
                <Accordion items={faq} idBase={`faq-${rubrique.slug ?? rubrique.id}`} />
              </section>
            ) : null}

            {/* Documents à télécharger — cartes type + format */}
            {downloads.length > 0 ? (
              <section id="documents" className="scroll-mt-28 mt-12">
                <SectionHead num={numberOf('documents')}>
                  Documents utiles
                </SectionHead>
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {downloads.map((label, i) => {
                    const { title, format } = parseDownload(label)
                    return (
                      <li key={i}>
                        <a
                          href="#"
                          download
                          className="group bg-surface-main border-border-main hover:shadow-card-sm flex items-center gap-4 rounded-xl border p-4 no-underline transition-shadow"
                        >
                          <span
                            aria-hidden="true"
                            className="bg-surface-tint-blue text-brand-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
                          >
                            <Icon name="file-text" size={22} />
                          </span>
                          <span className="min-w-0">
                            <span className="text-brand-primary-dark block text-sm font-semibold leading-snug">
                              {title}
                            </span>
                            {format ? (
                              <span className="text-text-muted mt-1 block text-xs font-semibold uppercase tracking-wide">
                                {format} · Télécharger
                              </span>
                            ) : null}
                          </span>
                        </a>
                      </li>
                    )
                  })}
                </ul>
              </section>
            ) : null}

            {/* Liens utiles */}
            {related.length > 0 ? (
              <section id="liens" className="scroll-mt-28 mt-12">
                <SectionHead num={numberOf('liens')}>
                  Liens utiles
                </SectionHead>
                <ul className="flex flex-col gap-2">
                  {related.map((link, i) => (
                    <li key={i}>
                      <span className="inline-block">
                        <ArrowLink href={relatedHref(link)} iconSize={16}>
                          {link.label}
                        </ArrowLink>
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {/* CTA — Besoin d'aide ? Bandeau CLAIR (séparé de la newsletter sombre). */}
            {showCta ? (
              <section className="mt-14">
                <div className="bg-surface-main border-border-main relative overflow-hidden rounded-2xl border p-8 shadow-card-sm md:p-10">
                  {/* Filet rainbow en tête — accent de charte. */}
                  <span aria-hidden="true" className="bg-rainbow absolute inset-x-0 top-0 h-1.5" />
                  <CornerSeal />
                  <div className="md:flex md:items-center md:justify-between md:gap-8">
                    <div className="max-w-2xl">
                      <SectionLabel>Besoin d&apos;aide ?</SectionLabel>
                      <h2 className="font-display text-brand-primary-dark mt-3 text-2xl font-bold leading-tight md:text-3xl">
                        Une question sur «&nbsp;{rubrique.title}&nbsp;» ?
                      </h2>
                      <p className="text-text-primary mt-3 leading-relaxed">
                        Nos services vous orientent vers le bon interlocuteur et vous
                        accompagnent dans vos démarches.
                      </p>
                    </div>
                    <div className="mt-6 shrink-0 md:mt-0">
                      <Button href="/nous-contacter" variant="accent" size="lg" icon="arrow-right">
                        Nous contacter
                      </Button>
                    </div>
                  </div>
                </div>
              </section>
            ) : null}
          </div>

          {/* ─── Colonne latérale (4/12) — sticky desktop, sous le contenu en mobile ─ */}
          {hasAside ? (
            <aside aria-label="Sommaire et informations utiles" className="lg:col-span-4">
              <div className="flex flex-col gap-6 lg:sticky lg:top-24">
                {hasSommaire ? <StickySommaire links={summary} /> : null}
                {keyFigures.length > 0 ? <KeyFiguresAside figures={keyFigures} /> : null}
                {quickLinks.length > 0 ? <QuickLinksAside links={quickLinks} /> : null}
                {contacts.length > 0 ? <ContactsAside contacts={contacts} /> : null}
              </div>
            </aside>
          ) : null}
        </div>
      </Container>
    </article>
  )
}

export default RubriqueServiceTemplate
