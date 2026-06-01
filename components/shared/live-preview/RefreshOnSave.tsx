'use client'

import { useRouter } from 'next/navigation'
import { RefreshRouteOnSave as PayloadRefreshRouteOnSave } from '@payloadcms/live-preview-react'

/**
 * RefreshOnSave — client island that wires Payload's Live Preview iframe to the
 * Next.js router. It listens for the `payload-document-saved` postMessage the
 * admin broadcasts (only when this page is embedded in the Live Preview iframe)
 * and calls `router.refresh()`, so the iframe re-renders the freshly-saved draft
 * without a manual reload.
 *
 * The server side is already draft-aware: `next/preview` enables draft mode and
 * `[...slug]/page.tsx` bypasses the cache to resolve `{ draft: true }`. This
 * supplies the missing client half so the panel actually updates on save.
 *
 * Outside the iframe (normal public visits) it renders nothing and attaches no
 * listeners of consequence, but we still only mount it in draft mode (see the
 * frontend layout) to keep public pages free of preview wiring.
 */
export function RefreshOnSave() {
  const router = useRouter()
  return (
    <PayloadRefreshRouteOnSave
      refresh={() => router.refresh()}
      serverURL={process.env.NEXT_PUBLIC_SERVER_URL ?? ''}
    />
  )
}

export default RefreshOnSave
