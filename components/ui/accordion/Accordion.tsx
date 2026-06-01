'use client'

import { useState } from 'react'
import { Icon } from '@/components/ui/icon'

/**
 * Accordion — accessible FAQ accordion (gabarit « Fiche service / rubrique »).
 *
 * A11y (RGAA / WCAG AA): each header is a real <button aria-expanded> controlling
 * its panel via aria-controls; the panel is a labelled region. Keyboard works
 * natively (Tab to move, Entrée/Espace to toggle), the focus ring is the global
 * 3px coral. The open/close height transition is purely decorative and is
 * disabled under `prefers-reduced-motion` by the global reset in globals.css.
 *
 * Presentation-only and data-driven: feed it the rubrique FAQ items.
 */

interface AccordionItem {
  q: string
  a: string
}

export function Accordion({
  items,
  idBase = 'faq',
}: {
  items: AccordionItem[]
  idBase?: string
}) {
  // Independent open state per item; the first answer starts open so the section
  // reads as populated without forcing a click.
  const [open, setOpen] = useState<Record<number, boolean>>({ 0: true })

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => {
        const isOpen = open[i] ?? false
        const btnId = `${idBase}-q-${i}`
        const panelId = `${idBase}-a-${i}`
        return (
          <div
            key={btnId}
            className="bg-surface-main border-border-main overflow-hidden rounded-lg border"
          >
            <h3 className="m-0">
              <button
                type="button"
                id={btnId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() =>
                  setOpen((prev) => ({ ...prev, [i]: !(prev[i] ?? false) }))
                }
                className="text-brand-primary-dark flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold"
              >
                <span>{item.q}</span>
                <span
                  aria-hidden="true"
                  className={`text-action shrink-0 transition-transform duration-300 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                >
                  <Icon name="chevron-down" size={20} />
                </span>
              </button>
            </h3>
            {/* grid-rows 1fr/0fr is the modern, height-agnostic reveal; the inner
                wrapper clips the content. The region stays labelled by its button. */}
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              }`}
            >
              <div className="overflow-hidden">
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={btnId}
                  className="text-text-primary px-5 pb-5 text-sm leading-relaxed"
                >
                  {item.a}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Accordion
