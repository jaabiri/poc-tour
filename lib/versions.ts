import type { CollectionConfig } from 'payload'

/**
 * Shared `versions` config for the content collections that get Live Preview
 * (rubriques, page, article, actualite, evenement, breve).
 *
 * `drafts.autosave` turns the manual « Enregistrer » into a debounced automatic
 * save: while the editor types, Payload persists the draft every `interval` ms.
 * Combined with the front-office `RefreshOnSave` island, each autosave refreshes
 * the Live Preview iframe — so the panel tracks edits without any click.
 *
 * The interval is deliberately not ultra-short: every save triggers a full RSC
 * route refresh (the draft path is resolved uncached), so 1500 ms balances a
 * "live" feel against re-render cost. Autosaves write `_status: 'draft'`, so the
 * per-collection publish-gate hooks never fire on them — only on real publishes.
 */
export const draftsWithAutosave: NonNullable<CollectionConfig['versions']> = {
  drafts: {
    autosave: {
      interval: 1500,
    },
  },
}
