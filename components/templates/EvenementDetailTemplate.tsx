import Image from 'next/image'

import { Container, Tag, Icon } from '@/components/ui'
import { AddToCalendar } from '@/components/sections/agenda/AddToCalendar'
import { ShareRow } from '@/components/shared/share-row'
import {
  splitEventLayout,
  EventMainBlocks,
  EventPraticalInfoView,
  EventMapView,
  EventRelatedView,
} from '@/components/blocks/EventBlockRenderer'
import {
  CATEGORY_LABELS,
  formatDateRange,
  formatTimeRange,
  mediaSrc,
  evenementHref,
} from '@/lib/agenda'

import type { Evenement, Rubrique } from '@/payload-types'

/**
 * EvenementDetailTemplate — gabarit front « Détail événement » (site-tree T7).
 *
 * Composé d'un EventHero (rendu depuis les champs fixes — gardé tel quel), puis
 * d'un layout DEUX COLONNES : la colonne principale rend les blocks `layout` de
 * contenu (description, programme, médias, documents, rappel d'action) via le
 * moteur `EventBlockRenderer`, et la colonne latérale STICKY « Infos pratiques »
 * agrège l'info-clé (date, horaires, lieu) + carte + CTA inscription + .ics +
 * partage + blocks d'infos pratiques. Les événements liés ferment la page ; la
 * newsletter + le footer sont fournis UNE seule fois par le layout global.
 *
 * Server Component qui ne renvoie QUE le contenu `main` (le filet du haut, le
 * fil d'Ariane et le chrome viennent de la route/layout). Tokens sémantiques
 * uniquement (CLAUDE.md §1/§2). Responsive : ≤ lg la sidebar « Infos pratiques »
 * REMONTE juste sous le hero (l'info-clé d'abord), puis le contenu.
 */

/** Libellé + ton du badge de statut (À venir laissé implicite — pas de badge). */
const STATUS_BADGE: Partial<Record<NonNullable<Evenement['status']>, string>> = {
  complet: 'Complet',
  passe: 'Terminé',
}

/** Une ligne de méta dans le hero (date / horaires / lieu). */
function HeroMeta({ icon, label, children }: { icon: 'calendar' | 'clock' | 'map-pin'; label: string; children: React.ReactNode }) {
  return (
    <li className="text-text-on-brand flex items-center gap-2.5 text-base leading-relaxed">
      <Icon name={icon} size={18} className="shrink-0" />
      <span className="sr-only">{label} : </span>
      <span>{children}</span>
    </li>
  )
}

/** Une ligne de méta dans la carte sidebar (icône + label + valeur). */
function AsideMeta({ icon, label, children }: { icon: 'calendar' | 'clock' | 'map-pin'; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span aria-hidden="true" className="text-brand-primary mt-0.5 shrink-0">
        <Icon name={icon} size={18} />
      </span>
      <div className="min-w-0">
        <span className="text-text-muted block text-xs font-semibold uppercase tracking-wide">
          {label}
        </span>
        <span className="text-text-primary block text-sm font-medium leading-snug">
          {children}
        </span>
      </div>
    </div>
  )
}

export function EvenementDetailTemplate({
  doc,
}: {
  doc: Evenement
  /**
   * Rubrique principale de l'événement — partie du contrat de gabarit (le
   * dispatcher la passe à chaque template). La vue détail ne rend que les
   * données propres de l'événement et le fil d'Ariane est fourni par la route ;
   * la rubrique reste dans le type pour une signature de template uniforme.
   */
  rubrique: Rubrique
}) {
  const categoryLabel = doc.category ? CATEGORY_LABELS[doc.category] : null
  const statusLabel = doc.status ? STATUS_BADGE[doc.status] : null
  const dateRange = formatDateRange(doc.startDate, doc.endDate)
  const timeRange = doc.allDay ? null : formatTimeRange(doc.startDate, doc.endDate)
  const place = [doc.location, doc.locationAddress].filter(Boolean).join(' — ')
  const img = mediaSrc(doc.image)

  const { main, aside, related } = splitEventLayout(doc.layout)
  const shareUrl = `https://www.touraine.fr${evenementHref(doc)}`

  // Repli data-driven : si l'éditeur n'a pas composé de blocks, la page reste
  // riche en dérivant le contenu des champs fixes — la carte (si géolocalisé) et
  // « À ne pas manquer » s'affichent toujours, et l'accroche tient lieu de
  // description. Aucun événement ne rend donc une page vide.
  const hasGeo = Array.isArray(doc.geo) && doc.geo.length === 2
  const showFallbackMap = hasGeo && !aside.some((b) => b.blockType === 'eventMap')
  const showFallbackRelated = related.length === 0

  return (
    <article>
      {/* ── EventHero (depuis les champs fixes) ─────────────────────────────── */}
      <Container className="py-10">
        <header className="bg-surface-brand text-text-inverse relative overflow-hidden rounded-xl">
          {img ? (
            <div className="relative h-44 w-full overflow-hidden md:h-56">
              <Image
                src={img.url}
                alt={img.alt}
                fill
                sizes="(max-width: 768px) 100vw, 1200px"
                className="object-cover"
                priority
              />
            </div>
          ) : null}
          <div className="p-8">
            <div className="flex flex-wrap items-center gap-2">
              {categoryLabel ? <Tag>{categoryLabel}</Tag> : null}
              {statusLabel ? (
                <span className="bg-surface-main text-brand-primary-dark rounded-pill px-3 py-1 text-xs font-bold uppercase tracking-wide">
                  {statusLabel}
                </span>
              ) : null}
            </div>
            <h1 className="font-display text-text-inverse mt-4 max-w-3xl text-3xl font-black leading-tight md:text-4xl">
              {doc.title}
            </h1>
            {doc.excerpt ? (
              <p className="text-text-on-brand mt-3 max-w-3xl text-lg leading-relaxed">
                {doc.excerpt}
              </p>
            ) : null}
            <ul className="mt-6 flex flex-col gap-3">
              <HeroMeta icon="calendar" label="Date">{dateRange}</HeroMeta>
              {timeRange ? <HeroMeta icon="clock" label="Horaires">{timeRange}</HeroMeta> : null}
              {doc.allDay ? <HeroMeta icon="clock" label="Horaires">Toute la journée</HeroMeta> : null}
              {doc.location ? <HeroMeta icon="map-pin" label="Lieu">{doc.location}</HeroMeta> : null}
            </ul>
            <div className="mt-7 flex flex-wrap gap-3">
              {doc.registrationUrl && doc.status !== 'passe' ? (
                <a
                  href={doc.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-action text-text-inverse hover:bg-action-hover rounded-md px-6 py-3 text-base font-semibold no-underline transition-colors"
                >
                  S&apos;inscrire à l&apos;événement
                </a>
              ) : null}
              <AddToCalendar event={doc} tone="solid" />
            </div>
          </div>
          {/* Filet rainbow en bas du hero — accent de charte (décoratif). */}
          <span aria-hidden="true" className="filet-rainbow block" />
        </header>
      </Container>

      {/* ── Corps : 2 colonnes (sidebar « Infos pratiques » d'abord en mobile) ── */}
      <Container className="pb-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Colonne latérale (4/12) — D'ABORD dans le DOM pour qu'en mobile elle
              REMONTE juste sous le hero (l'info-clé d'abord) ; renvoyée à droite au
              desktop via `order`. Sticky desktop. */}
          <aside aria-label="Infos pratiques" className="lg:order-2 lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <div className="bg-surface-main border-border-main relative overflow-hidden rounded-2xl border p-6 shadow-card-sm">
                <span aria-hidden="true" className="bg-rainbow absolute inset-x-0 top-0 h-1.5" />
                <h2 className="font-display text-brand-primary-dark text-lg font-bold">
                  Infos pratiques
                </h2>

                <div className="mt-5 flex flex-col gap-4">
                  <AsideMeta icon="calendar" label="Date">{dateRange}</AsideMeta>
                  {timeRange ? <AsideMeta icon="clock" label="Horaires">{timeRange}</AsideMeta> : null}
                  {doc.allDay ? <AsideMeta icon="clock" label="Horaires">Toute la journée</AsideMeta> : null}
                  {place ? <AsideMeta icon="map-pin" label="Lieu">{place}</AsideMeta> : null}
                </div>

                {/* Carte de situation + infos pratiques détaillées (blocks aside). */}
                {aside.map((block, i) =>
                  block.blockType === 'eventMap' ? (
                    <EventMapView key={block.id ?? i} block={block} event={doc} />
                  ) : (
                    <EventPraticalInfoView key={block.id ?? i} block={block} />
                  ),
                )}
                {/* Repli : carte dérivée de la géoloc si l'éditeur n'en a pas posé. */}
                {showFallbackMap ? (
                  <EventMapView block={{ blockType: 'eventMap', source: 'fromEvent', zoom: 15 }} event={doc} />
                ) : null}

                {/* CTA inscription + .ics. */}
                <div className="mt-6 flex flex-col gap-2.5">
                  {doc.registrationUrl && doc.status !== 'passe' ? (
                    <a
                      href={doc.registrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-action text-text-inverse hover:bg-action-hover rounded-md px-5 py-3 text-center text-base font-semibold no-underline transition-colors"
                    >
                      S&apos;inscrire
                    </a>
                  ) : null}
                  <AddToCalendar event={doc} tone="solid" className="w-full justify-center" />
                </div>

                {/* Partager. */}
                <div className="mt-2">
                  <ShareRow title={doc.title} url={shareUrl} />
                </div>
              </div>
            </div>
          </aside>

          {/* Colonne principale (8/12) — à gauche au desktop (order-1). */}
          <div className="min-w-0 lg:order-1 lg:col-span-8">
            {main.length > 0 ? (
              <EventMainBlocks blocks={main} event={doc} />
            ) : (
              /* Repli : pas de blocks éditeur → l'accroche tient lieu de présentation. */
              <section>
                <span aria-hidden="true" className="bg-rainbow block h-1 w-7 rounded-sm" />
                <h2 className="font-display text-brand-primary-dark mt-3 text-2xl font-bold leading-tight md:text-3xl">
                  Présentation
                </h2>
                <div className="prose-touraine text-text-primary mt-5 max-w-prose leading-relaxed">
                  <p>{doc.excerpt ?? 'Le détail de cet événement sera publié prochainement.'}</p>
                  {doc.location ? (
                    <p>
                      Rendez-vous {place ? `à ${place}` : `à ${doc.location}`} le {dateRange}
                      {timeRange ? `, de ${timeRange}` : ''}.
                    </p>
                  ) : null}
                </div>
              </section>
            )}
          </div>
        </div>
      </Container>

      {/* ── Événements liés (pleine largeur) ────────────────────────────────── */}
      {related.length > 0 || showFallbackRelated ? (
        <div className="border-border-main border-t">
          <Container className="py-14">
            {related.length > 0 ? (
              related.map((block, i) => (
                <EventRelatedView key={block.id ?? i} block={block} event={doc} />
              ))
            ) : (
              <EventRelatedView block={{ blockType: 'eventRelated', mode: 'auto', limit: 3 }} event={doc} />
            )}
          </Container>
        </div>
      ) : null}
    </article>
  )
}

export default EvenementDetailTemplate
