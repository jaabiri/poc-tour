import type { Evenement } from '@/payload-types'

/**
 * iCalendar (.ics) generation for events — RFC 5545, minimal single VEVENT.
 *
 * Shared by the agenda gabarits (listing cards + event detail) so the
 * « Ajouter à mon agenda » affordance is identical everywhere. The link is a
 * `data:text/calendar` download (no client JS, fully keyboard-accessible), in
 * line with the project's RSC-first, no-JS listing approach (CLAUDE.md §3).
 */

/** Escape a text value per RFC 5545 (commas, semicolons, backslashes, newlines). */
const icsEscape = (value: string): string =>
  value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')

/** UTC stamp in the basic ICS form `YYYYMMDDTHHMMSSZ`. */
const icsStamp = (iso: string): string => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

/** Build a minimal, valid VCALENDAR for a single event. */
export const buildIcs = (doc: Evenement): string => {
  const start = icsStamp(doc.startDate)
  const end = doc.endDate ? icsStamp(doc.endDate) : start
  const description = doc.excerpt ?? ''
  // LOCATION = nom du lieu + adresse postale quand les deux sont renseignés.
  const place = [doc.location, doc.locationAddress]
    .filter((v): v is string => !!v)
    .join(', ')
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//touraine.fr//Agenda//FR',
    'BEGIN:VEVENT',
    `UID:evenement-${doc.id}@touraine.fr`,
    `DTSTAMP:${icsStamp(doc.updatedAt)}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${icsEscape(doc.title)}`,
    description ? `DESCRIPTION:${icsEscape(description)}` : null,
    place ? `LOCATION:${icsEscape(place)}` : null,
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter((l): l is string => l !== null)
  return lines.join('\r\n')
}

/** A ready-to-use `href` for an `<a download>` that yields the event's .ics. */
export const icsHref = (doc: Evenement): string =>
  `data:text/calendar;charset=utf8,${encodeURIComponent(buildIcs(doc))}`

/** Suggested download filename for an event's .ics. */
export const icsFilename = (doc: Evenement): string =>
  `evenement-${doc.slug ?? doc.id}.ics`
