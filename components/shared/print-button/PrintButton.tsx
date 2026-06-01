'use client'

import { Icon } from '@/components/ui'

/**
 * PrintButton — replaces the previously inert « Imprimer / PDF » control on the
 * article gabarit with a real action. A minimal client island whose sole job is
 * to trigger the browser print dialog (which doubles as “save as PDF”). Styling
 * matches the inline secondary actions in BlockRenderer (token-only, CLAUDE.md
 * §1/§2); the global focus ring and reduced-motion rules apply automatically.
 */
export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="border-border-main text-brand-primary-dark hover:shadow-card-sm inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold transition-shadow"
    >
      <Icon name="printer" size={16} />
      Imprimer / PDF
    </button>
  )
}

export default PrintButton
