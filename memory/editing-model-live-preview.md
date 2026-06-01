---
name: editing-model-live-preview
description: touraine.fr POC uses Payload Live Preview (inline editing), not plain admin forms
metadata:
  type: project
---

For the touraine.fr POC the editor chose **inline Live Preview** as the content-editing model (over standard Payload admin forms). So content collections should carry `admin.livePreview` + `admin.preview` config and the front-office must support draft-mode reads for the preview iframe.

**Why:** decided 2026-05-30 when generating all page gabarits; best UX for non-technical CD37 editors.
**How to apply:** keep livePreview URLs/draft-mode routes working when touching `payload.config.ts`, collections, or the catch-all route. See [[gabarit-rendering-architecture]].
