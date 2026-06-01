import Image from 'next/image'
import { RichText } from '@payloadcms/richtext-lexical/react'

import { SectionLabel, Icon, CornerSeal } from '@/components/ui'
import { EventCard } from '@/components/sections/agenda/EventCard'
import { getPayloadClient } from '@/lib/payload'
import { mediaSrc } from '@/lib/agenda'
import type { IconName } from '@/lib/icons'

import type {
  Evenement,
  EventRichTextBlock,
  EventProgrammeBlock,
  EventPraticalInfoBlock,
  EventMediaBlock,
  EventMapBlock,
  EventDocumentsBlock,
  EventCtaBlock,
  EventRelatedBlock,
} from '@/payload-types'

/**
 * EventBlockRenderer — moitié front du page-builder ÉVÉNEMENT (gabarit Détail T7).
 * Chaque membre du `layout` d'un événement est mappé sur un composant React
 * dédié, data-driven et conditionnel, en tokens sémantiques uniquement
 * (CLAUDE.md §1/§2 : pas de valeurs Tailwind arbitraires, pas de couleur brute).
 *
 * Les blocks sont répartis en TROIS zones par `splitEventLayout` :
 *  - `main`    : description, programme, médias, documents, rappel d'action
 *  - `aside`   : infos pratiques + carte de situation (colonne « Infos pratiques »)
 *  - `related` : événements liés (pleine largeur, bas de page)
 * La langue visuelle (cartes blanches bordées, filet/tick rainbow en accent,
 * CornerSeal, EventCard) est reprise des gabarits existants pour rester cohérent.
 */

/** Tout block du `layout` d'un événement. */
export type EventBlock = NonNullable<NonNullable<Evenement['layout']>[number]>

/* ── En-tête de section partagée (eyebrow rainbow + titre Fraunces) ─────────── */

function EventSectionHead({
  eyebrow,
  children,
}: {
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
      <h2 className="font-display text-brand-primary-dark mt-3 text-2xl font-bold leading-tight md:text-3xl">
        {children}
      </h2>
    </header>
  )
}

/* ── 1. Description (richText) ──────────────────────────────────────────────── */

function EventRichTextView({ block }: { block: EventRichTextBlock }) {
  return (
    <section>
      {block.title ? <EventSectionHead>{block.title}</EventSectionHead> : null}
      <div className="prose-touraine text-text-primary max-w-prose leading-relaxed">
        <RichText data={block.content} />
      </div>
    </section>
  )
}

/* ── 2. Programme (timeline horaire) ────────────────────────────────────────── */

function EventProgrammeView({ block }: { block: EventProgrammeBlock }) {
  if (!block.items?.length) return null
  return (
    <section>
      <EventSectionHead eyebrow="Déroulé">{block.title ?? 'Au programme'}</EventSectionHead>
      <ol className="border-border-main relative ml-2 flex flex-col gap-6 border-l-2 pl-6">
        {block.items.map((item, i) => (
          <li key={item.id ?? i} className="relative">
            {/* Pastille horaire sur la ligne de temps (décorative). */}
            <span
              aria-hidden="true"
              className="bg-brand-primary ring-surface-page absolute -left-[1.95rem] top-1 h-3 w-3 rounded-full ring-4"
            />
            <div className="flex flex-col gap-1">
              <span className="text-brand-accent font-display text-lg font-black leading-none tabular-nums">
                {item.time}
              </span>
              <span className="text-brand-primary-dark text-base font-semibold leading-snug">
                {item.label}
              </span>
              {item.speaker || item.place ? (
                <span className="text-text-muted flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                  {item.speaker ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Icon name="hand-heart" size={14} />
                      {item.speaker}
                    </span>
                  ) : null}
                  {item.place ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Icon name="map-pin" size={14} />
                      {item.place}
                    </span>
                  ) : null}
                </span>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

/* ── 3. Médias / galerie ────────────────────────────────────────────────────── */

function EventMediaView({ block }: { block: EventMediaBlock }) {
  const images = (block.images ?? [])
    .map((it) => ({ src: mediaSrc(it.image), caption: it.caption ?? null }))
    .filter((it): it is { src: { url: string; alt: string }; caption: string | null } => it.src != null)
  if (images.length === 0) return null

  if (block.layout === 'single' || images.length === 1) {
    const { src, caption } = images[0]
    return (
      <section>
        {block.title ? <EventSectionHead>{block.title}</EventSectionHead> : null}
        <figure className="m-0">
          <div className="border-border-main relative aspect-[16/9] w-full overflow-hidden rounded-2xl border">
            <Image src={src.url} alt={src.alt} fill sizes="(max-width: 1024px) 100vw, 720px" className="object-cover" />
          </div>
          {caption ? (
            <figcaption className="text-text-muted mt-2 text-sm">{caption}</figcaption>
          ) : null}
        </figure>
      </section>
    )
  }

  return (
    <section>
      {block.title ? <EventSectionHead>{block.title}</EventSectionHead> : null}
      <ul className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
        {images.map(({ src, caption }, i) => (
          <li key={i}>
            <figure className="m-0">
              <div className="border-border-main relative aspect-[4/3] w-full overflow-hidden rounded-xl border">
                <Image src={src.url} alt={src.alt} fill sizes="(max-width: 640px) 100vw, 320px" className="object-cover" />
              </div>
              {caption ? (
                <figcaption className="text-text-muted mt-1.5 text-xs">{caption}</figcaption>
              ) : null}
            </figure>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ── 4. Documents (type + poids) ────────────────────────────────────────────── */

const DOC_TYPE_LABELS: Record<NonNullable<NonNullable<EventDocumentsBlock['files']>[number]['docType']>, string> = {
  programme: 'Programme',
  plan: 'Plan d’accès',
  reglement: 'Règlement',
  affiche: 'Affiche',
  autre: 'Document',
}

/** Format humain du poids fichier, ex. « 1,2 Mo », « 340 Ko ». */
const formatFilesize = (bytes?: number | null): string | null => {
  if (!bytes || bytes <= 0) return null
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} Mo`
}

/** Extension en majuscules depuis un nom de fichier, ex. « PDF ». */
const fileFormat = (filename?: string | null): string | null => {
  if (!filename) return null
  const ext = filename.split('.').pop()
  return ext ? ext.toUpperCase() : null
}

function EventDocumentsView({ block }: { block: EventDocumentsBlock }) {
  if (!block.files?.length) return null
  return (
    <section>
      <EventSectionHead eyebrow="À télécharger">
        {block.title ?? 'Documents à télécharger'}
      </EventSectionHead>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {block.files.map((f, i) => {
          const media = typeof f.file === 'object' ? f.file : null
          if (!media?.url) return null
          const label = f.label ?? media.filename ?? 'Fichier'
          const typeLabel = DOC_TYPE_LABELS[f.docType ?? 'autre']
          const meta = [fileFormat(media.filename), formatFilesize(media.filesize)]
            .filter(Boolean)
            .join(' · ')
          return (
            <li key={f.id ?? i}>
              <a
                href={media.url}
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
                    {label}
                  </span>
                  <span className="text-text-muted mt-1 block text-xs font-semibold uppercase tracking-wide">
                    {typeLabel}
                    {meta ? ` · ${meta}` : ''} · Télécharger
                  </span>
                </span>
              </a>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/* ── 5. Rappel d'action (CTA) ───────────────────────────────────────────────── */

function EventCtaView({ block, event }: { block: EventCtaBlock; event: Evenement }) {
  // Mode inscription sans URL → réutilise le lien d'inscription de l'événement.
  const href =
    block.url ?? (block.mode === 'inscription' ? (event.registrationUrl ?? null) : null)
  const isExternal = !!href && /^https?:\/\//.test(href)
  const label =
    block.buttonLabel ?? (block.mode === 'inscription' ? "S'inscrire" : 'Nous contacter')
  return (
    <section>
      <div className="bg-surface-main border-border-main relative overflow-hidden rounded-2xl border p-8 shadow-card-sm md:p-10">
        <span aria-hidden="true" className="bg-rainbow absolute inset-x-0 top-0 h-1.5" />
        <CornerSeal />
        <div className="md:flex md:items-center md:justify-between md:gap-8">
          <div className="max-w-2xl">
            <SectionLabel>{block.mode === 'inscription' ? 'Inscription' : 'Contact'}</SectionLabel>
            <h2 className="font-display text-brand-primary-dark mt-3 text-2xl font-bold leading-tight md:text-3xl">
              {block.title}
            </h2>
            {block.text ? (
              <p className="text-text-primary mt-3 leading-relaxed">{block.text}</p>
            ) : null}
          </div>
          {href ? (
            <div className="mt-6 shrink-0 md:mt-0">
              <a
                href={href}
                {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="bg-action text-text-inverse hover:bg-action-hover rounded-pill inline-flex min-h-touch items-center gap-2 px-7 py-3 text-base font-semibold no-underline transition-colors"
              >
                {label}
                <Icon name="arrow-right" size={18} />
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

/* ── 6. Infos pratiques (label/valeur) — colonne latérale ───────────────────── */

export function EventPraticalInfoView({ block }: { block: EventPraticalInfoBlock }) {
  if (!block.items?.length) return null
  return (
    <div className="border-border-main border-t pt-5">
      <h3 className="text-brand-primary-dark mb-3 text-sm font-bold uppercase tracking-wide">
        {block.title ?? 'Infos pratiques'}
      </h3>
      <dl className="flex flex-col gap-3">
        {block.items.map((item, i) => (
          <div key={item.id ?? i} className="flex items-start gap-3">
            <dt className="text-icon-muted mt-0.5 shrink-0">
              <Icon name={(item.icon ?? 'info') as IconName} size={18} />
              <span className="sr-only">{item.label}</span>
            </dt>
            <dd className="min-w-0">
              <span className="text-text-muted block text-xs font-semibold uppercase tracking-wide">
                {item.label}
              </span>
              <span className="text-text-primary block whitespace-pre-line text-sm leading-snug">
                {item.value}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

/* ── 7. Carte de situation (OSM) — colonne latérale ─────────────────────────── */

/** URL d'embed OpenStreetMap (locator) autour d'un point lat/lng. */
const osmEmbedSrc = (lat: number, lng: number): string => {
  const d = 0.008
  const bbox = `${lng - d}%2C${lat - d}%2C${lng + d}%2C${lat + d}`
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`
}

export function EventMapView({ block, event }: { block: EventMapBlock; event: Evenement }) {
  // `geo` Payload point = [lng, lat]. fromEvent lit le point de l'événement.
  const lat = block.source === 'custom' ? block.lat : event.geo?.[1]
  const lng = block.source === 'custom' ? block.lng : event.geo?.[0]
  const address = [event.location, event.locationAddress].filter(Boolean).join(' — ')
  if (lat == null || lng == null) return null
  return (
    <div className="border-border-main border-t pt-5">
      <h3 className="text-brand-primary-dark mb-3 text-sm font-bold uppercase tracking-wide">
        {block.title ?? 'Comment s’y rendre'}
      </h3>
      <figure className="m-0">
        <iframe
          src={osmEmbedSrc(lat, lng)}
          title={`Carte de situation : ${address || event.title}`}
          loading="lazy"
          className="border-border-main h-48 w-full rounded-lg border"
        />
        {/* Alternative texte (adresse) — accessibilité : l'info de localisation
            ne dépend pas du rendu de la carte. */}
        <figcaption className="text-text-muted mt-2 flex items-start gap-2 text-sm">
          <Icon name="map-pin" size={16} className="mt-0.5 shrink-0" />
          <span>{address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`}</span>
        </figcaption>
      </figure>
    </div>
  )
}

/* ── 8. Événements liés ─────────────────────────────────────────────────────── */

export async function EventRelatedView({
  block,
  event,
}: {
  block: EventRelatedBlock
  event: Evenement
}) {
  let items: Evenement[]
  if (block.mode === 'manual') {
    items = (block.events ?? []).filter(
      (e): e is Evenement => typeof e === 'object' && e !== null,
    )
  } else {
    const payload = await getPayloadClient()
    const res = await payload.find({
      collection: 'evenement',
      where: {
        and: [
          { id: { not_equals: event.id } },
          { startDate: { greater_than_equal: new Date().toISOString() } },
          ...(event.category ? [{ category: { equals: event.category } }] : []),
        ],
      },
      sort: 'startDate',
      limit: block.limit ?? 3,
      draft: false,
      depth: 2,
    })
    items = res.docs as Evenement[]
  }
  if (items.length === 0) return null

  return (
    <section aria-labelledby="event-related-title">
      <SectionLabel>Agenda</SectionLabel>
      <h2
        id="event-related-title"
        className="font-display text-brand-primary-dark mb-6 mt-2 text-2xl font-bold leading-tight md:text-3xl"
      >
        {block.title ?? 'À ne pas manquer'}
      </h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5">
        {items.map((e) => (
          <EventCard key={e.id} event={e} />
        ))}
      </div>
    </section>
  )
}

/* ── Répartition + rendu de la colonne principale ───────────────────────────── */

/** Range les blocks du `layout` dans les trois zones du gabarit. */
export function splitEventLayout(layout: Evenement['layout']): {
  main: EventBlock[]
  aside: (EventPraticalInfoBlock | EventMapBlock)[]
  related: EventRelatedBlock[]
} {
  const main: EventBlock[] = []
  const aside: (EventPraticalInfoBlock | EventMapBlock)[] = []
  const related: EventRelatedBlock[] = []
  for (const block of layout ?? []) {
    switch (block.blockType) {
      case 'eventPraticalInfo':
      case 'eventMap':
        aside.push(block)
        break
      case 'eventRelated':
        related.push(block)
        break
      default:
        main.push(block)
    }
  }
  return { main, aside, related }
}

/** Rend un block de la colonne principale (switch exhaustif sur les blocks « main »). */
function MainBlock({ block, event }: { block: EventBlock; event: Evenement }) {
  switch (block.blockType) {
    case 'eventRichText':
      return <EventRichTextView block={block} />
    case 'eventProgramme':
      return <EventProgrammeView block={block} />
    case 'eventMedia':
      return <EventMediaView block={block} />
    case 'eventDocuments':
      return <EventDocumentsView block={block} />
    case 'eventCta':
      return <EventCtaView block={block} event={event} />
    // Les blocks « aside »/« related » sont rendus hors de la colonne principale.
    case 'eventPraticalInfo':
    case 'eventMap':
    case 'eventRelated':
      return null
    default: {
      const _exhaustive: never = block
      return _exhaustive
    }
  }
}

/** Rend la liste des blocks de la colonne principale, dans l'ordre. */
export function EventMainBlocks({
  blocks,
  event,
}: {
  blocks: EventBlock[]
  event: Evenement
}) {
  if (blocks.length === 0) return null
  return (
    <div className="flex flex-col gap-12">
      {blocks.map((block, i) => (
        <MainBlock key={block.id ?? `${block.blockType}-${i}`} block={block} event={event} />
      ))}
    </div>
  )
}
