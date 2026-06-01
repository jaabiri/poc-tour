# Memory index

- [Gabarit rendering architecture](gabarit-rendering-architecture.md) — pages are template-driven from the rubriques tree, never one-file-per-page
- [Editing model: Live Preview](editing-model-live-preview.md) — POC uses Payload inline Live Preview, not plain admin forms
- [Seed & cache gotchas](seed-and-cache-gotchas.md) — stop dev server before db:seed (SQLITE_BUSY); landings need _status:'published'; nuke whole .next in dev
- [Charte palette discrepancy](touraine-charte-palette-discrepancy.md) — skill charte.md (teal/green/red) ≠ implémentation (bleu/corail) ; garder bleu/corail
- [Démo lundi — livraison](touraine-demo-lundi-livraison.md) — audit + shell + home + /showcase livrés pour la démo client
- [Rubrique content catalog](rubrique-content-catalog.md) — real per-rubrique page content + SEO lives in data/rubriques-content.json, applied by seed.ts §4
