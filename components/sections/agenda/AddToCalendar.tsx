import { Icon } from '@/components/ui'
import { icsHref, icsFilename } from '@/lib/ics'
import type { Evenement } from '@/payload-types'

/**
 * « Ajouter à mon agenda » — downloads a single-event .ics (RFC 5545) via a
 * `data:text/calendar` href. No client JS: it is a plain, keyboard-focusable
 * download link (RGAA), reused on the agenda cards and the event detail page.
 *
 * `tone="solid"` is the standalone secondary button (cream pill on a dark
 * surface); `tone="ghost"` is the compact inline variant used on list cards.
 */
export function AddToCalendar({
  event,
  tone = 'ghost',
  className = '',
}: {
  event: Evenement
  tone?: 'solid' | 'ghost'
  className?: string
}) {
  const base =
    'relative z-10 inline-flex items-center gap-1.5 rounded-md font-semibold no-underline transition-colors'
  const toneClass =
    tone === 'solid'
      ? 'bg-surface-main text-brand-primary-dark hover:shadow-card-sm px-6 py-3 text-sm transition-shadow'
      : 'border-border-main text-brand-primary hover:border-brand-primary hover:text-brand-primary-dark border px-3 py-1.5 text-[0.8125rem]'

  return (
    <a
      href={icsHref(event)}
      download={icsFilename(event)}
      className={`${base} ${toneClass} ${className}`}
    >
      <Icon name="plus" size={tone === 'solid' ? 16 : 14} />
      {tone === 'solid' ? 'Ajouter au calendrier' : 'Au calendrier'}
      <span className="sr-only"> (fichier .ics)</span>
    </a>
  )
}
