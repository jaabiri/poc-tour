---
name: touraine-charte-palette-discrepancy
description: The skill charte.md palette differs from the implemented globals.css palette — which one is the source of truth
metadata:
  type: project
---

Le skill `touraine-gabarits/charte.md` décrit une palette **teal #0f8a8d / green #5fb44a / red #e2342b / ink #1a2b32 / cream #f7f4ee**, MAIS l'implémentation réelle (`app/globals.css`) utilise une palette **bleu #006090/#003d5c + corail #d9533b + rainbow** (château/Loire du logo). L'audit a tranché en faveur de l'**implémentation existante** (bleu/corail) comme source de vérité, car cohérente sur tout le repo et fidèle au logo réel — la charte.md du skill semble obsolète sur les couleurs.

**Why:** un agent qui suit littéralement charte.md « corrigerait » toute la palette vers teal/green/red et casserait la cohérence visuelle de tout le portail.

**How to apply:** garder bleu/corail (`--brand-primary` #006090, `--color-action` corail AA #c0432b, `--rainbow` en accent seulement). Ne PAS migrer vers teal/green/red sans validation explicite du client. Voir [[touraine-demo-lundi-livraison]].

Le vrai CCTP client est `docs/cahier des charges.md` (Conseil départemental d'Indre-et-Loire / Touraine) — source des exigences dures (recherche sur chaque page, A=/A+/A−, fil d'Ariane, impression A4, cartes ArcGIS plein écran, ≤2 clics, RGAA).
