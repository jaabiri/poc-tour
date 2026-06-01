'use client'

import { useRowLabel } from '@payloadcms/ui'

/**
 * Admin row label for the header's `primaryNav` array: show the entry's own
 * label (falling back to a numbered placeholder) instead of "Entrée 01" so the
 * collapsed menu list is readable.
 */
export function NavRowLabel() {
  const { data, rowNumber } = useRowLabel<{ label?: string }>()
  const n = String((rowNumber ?? 0) + 1).padStart(2, '0')
  return <span>{data?.label?.trim() ? data.label : `Entrée ${n}`}</span>
}

export default NavRowLabel
