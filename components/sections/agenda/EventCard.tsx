import Image from 'next/image'
import Link from 'next/link'

import { Icon, Tag } from '@/components/ui'
import {
  CATEGORY_LABELS,
  eventDateParts,
  evenementHref,
  formatTimeRange,
  mediaSrc,
} from '@/lib/agenda'
import { AddToCalendar } from './AddToCalendar'
import type { Evenement } from '@/payload-types'

/**
 * EventCard — rich agenda card (T7/T8). A VERTICAL card (image on top) so it
 * reads well inside the multi-column agenda grid: a visual banner with the date
 * block + category badge overlaid, then a Fraunces title, time + location meta
 * with icons, a short description, and two actions (« Détails » + « Ajouter au
 * calendrier »).
 *
 * Interaction (charte + RGAA): hover-lift + soft blue shadow, a thin rainbow
 * filet accent on top, inner image scales on hover. The whole card is a single
 * primary link to the event (a stretched-link `::after` over the title) so it is
 * one tab stop; the secondary .ics action sits above it (`z-10`) and stays
 * independently focusable — no nested/invalid anchors.
 */
export function EventCard({ event }: { event: Evenement }) {
  const { day, month } = eventDateParts(event.startDate)
  const categoryLabel = event.category ? CATEGORY_LABELS[event.category] : 'Autre'
  const timeRange = formatTimeRange(event.startDate, event.endDate)
  const img = mediaSrc(event.image)

  return (
    <article className="group bg-surface-main border-border-main shadow-card-sm hover:shadow-card-hover ease-brand relative flex flex-col overflow-hidden rounded-card border transition-all duration-300 hover:-translate-y-1.5">
      {/* Thin rainbow accent (decorative) */}
      <span aria-hidden="true" className="filet-rainbow absolute inset-x-0 top-0 z-10" />

      {/* Visual banner + overlaid date chip & category badge */}
      <div className="relative h-40 w-full shrink-0 overflow-hidden">
        {img ? (
          <Image
            src={img.url}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 22rem"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span aria-hidden="true" className="bg-surface-brand absolute inset-0" />
        )}
        {/* Legibility scrim under the date/badge overlays */}
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-brand-primary-dark/55 via-transparent to-brand-primary-dark/25"
        />
        <span className="bg-surface-main text-brand-primary-dark absolute left-3 top-3 flex w-14 flex-col items-center rounded-md py-2 text-center shadow-card-sm">
          <span className="font-display text-xl font-black leading-none">{day}</span>
          <span className="text-text-muted mt-0.5 text-[0.6rem] font-semibold tracking-wide">
            {month}
          </span>
        </span>
        <span className="absolute right-3 top-3">
          <Tag>{categoryLabel}</Tag>
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-brand-primary-dark group-hover:text-brand-primary text-lg font-bold leading-snug transition-colors">
          <Link
            href={evenementHref(event)}
            className="no-underline after:absolute after:inset-0 after:content-['']"
          >
            {event.title}
          </Link>
        </h3>

        <ul className="text-text-muted mt-2 flex flex-col gap-1 text-sm">
          {timeRange ? (
            <li className="flex items-center gap-1.5">
              <Icon name="clock" size={14} /> {timeRange}
            </li>
          ) : null}
          {event.location ? (
            <li className="flex items-center gap-1.5">
              <Icon name="map-pin" size={14} /> <span className="truncate">{event.location}</span>
            </li>
          ) : null}
        </ul>

        {event.excerpt ? (
          <p className="text-text-primary mt-2.5 line-clamp-2 text-sm leading-relaxed">
            {event.excerpt}
          </p>
        ) : null}

        <div className="border-border-main mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-3">
          <span className="text-action inline-flex items-center gap-1.5 text-sm font-semibold">
            Détails
            <Icon
              name="arrow-right"
              size={15}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </span>
          <AddToCalendar event={event} tone="ghost" />
        </div>
      </div>
    </article>
  )
}
