import { revalidateTag } from 'next/cache'

/**
 * Canonical cache tag for the catch-all front-office route. EVERY resolved route
 * — a rubrique node OR a content detail page (article/actualité/événement/brève/
 * page) — is cached under this single tag in app/(frontend)/[...slug]/page.tsx.
 * So ANY content change that must appear on the front-office has to revalidate
 * THIS tag; per-collection tags alone bust nothing (the route isn't cached under
 * them). Kept here, the revalidation module, as the single source of truth;
 * lib/payload.ts re-exports it as `RUBRIQUES_TAG` for the route to consume.
 */
export const ROUTE_TAG = 'rubriques'

/**
 * Whether a write touches PUBLISHED state — a publish, an unpublish, or an edit
 * to an already-published doc. Pure draft writes (e.g. autosave ticks on an
 * unpublished doc) return false so they don't thrash the front-office cache.
 */
export const touchesPublished = (
  doc?: { _status?: unknown } | null,
  previousDoc?: { _status?: unknown } | null,
): boolean =>
  doc?._status === 'published' || previousDoc?._status === 'published'

/**
 * Revalidate the front-office after a content change. No-op for pure draft writes
 * (so autosave doesn't purge the cache on every keystroke). When it does fire it
 * ALWAYS busts `ROUTE_TAG` (the only tag the catch-all route is cached under),
 * plus any extra collection/document tags passed in for future per-tag consumers.
 *
 * Use from a content collection's afterChange (`{ doc, previousDoc }`) and
 * afterDelete (`{ doc }`). Identity/structure collections without a draft
 * lifecycle (groupes, media) should call `safeRevalidateTag(ROUTE_TAG, …)`
 * directly instead — they have no `_status` to gate on.
 */
export const revalidateContentChange = (
  args: {
    doc?: { _status?: unknown; slug?: unknown } | null
    previousDoc?: { _status?: unknown; slug?: unknown } | null
  },
  extraTags: string[] = [],
): void => {
  if (!touchesPublished(args.doc, args.previousDoc)) return
  safeRevalidateTag(ROUTE_TAG, 'max')
  for (const tag of extraTags) safeRevalidateTag(tag, 'max')
}

/**
 * safeRevalidateTag — a request-context-tolerant wrapper around Next's
 * `revalidateTag`.
 *
 * Payload `afterChange` / `afterDelete` hooks call `revalidateTag` to invalidate
 * the front-office cache on publish (CONTEXT.md rendering model: instant publish,
 * no redeploy). At request time this works as intended. But the SAME hooks also
 * fire when Payload mutates documents OUTSIDE a Next request — in the seed
 * (`payload run ./seed.ts`), in migrations, and in scheduled Payload jobs. There
 * is no static-generation store in those contexts, so `revalidateTag` throws:
 *
 *   Invariant: static generation store missing in revalidateTag <tag>
 *
 * Outside a request there is nothing to revalidate, so the correct behaviour is a
 * silent no-op: we attempt the real call and swallow only that specific invariant,
 * letting every other error surface. This keeps production request-time
 * invalidation identical while making seeds/migrations/jobs robust.
 *
 * The second argument mirrors Next 16's cache-life profile (e.g. `'max'`).
 */
export const safeRevalidateTag = (tag: string, profile?: string): void => {
  try {
    // Next 16 accepts an optional cache-life profile as the 2nd arg.
    ;(revalidateTag as (tag: string, profile?: string) => void)(tag, profile)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    // Only swallow the "no request context" invariant; rethrow anything else.
    if (message.includes('static generation store missing')) return
    throw err
  }
}
