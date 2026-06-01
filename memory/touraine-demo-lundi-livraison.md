---
name: touraine-demo-lundi-livraison
description: What was delivered for the Monday client demo of the Touraine portal (audit + shell + home + showcase)
metadata:
  type: project
---

Démo client du portail Touraine prévue **lundi 2026-06-01**. Objectif : effet « waaw » + conformité CCTP/charte/RGAA.

Livré (GO utilisateur sur plan complet, barre a11y complète, images SVG locales) :
- **Audit** : `REVIEW.md` (racine) — scoring 4 axes × 8 zones, checklist CCTP, correctifs P0/P1/P2, synthèse inspiration (maine-et-loire, eurelien, DSFR, tendances 2026).
- **Shell** (toutes pages) : skip-link, `AccessibilityBar` (A=/A+/A− + contraste, localStorage), recherche header, méga-menus clavier, drawer `dialog`+focus-trap, `aria-current`, footer Newsletter + filet rainbow en haut.
- **Home** : réordonnée CCTP, section `QuickAccess` « Je suis… », CornerSeal héros, vraies illustrations SVG (`public/images/*.svg`), purge hex/valeurs arbitraires.
- **Showcase** : `/showcase` (composant `components/templates/showcase/ShowcaseTemplate.tsx`, data `data/showcase.json`) — 6 gabarits, checklist CCTP cochée, mode annotations, liens plein écran. Lien « Showcase gabarits » dans la Topbar.

**Non fait (différé)** : Lot D = retouche profonde des templates Payload (Landing/Article/Démarche/Contact) — risqué sans DB tournante et hors « ne pas toucher la logique métier ». Les correctifs shell cascadent déjà sur ces pages. Détail des manques par gabarit dans `REVIEW.md` §3.

Validé : `npx tsc --noEmit` OK, `eslint` OK, `/` et `/showcase` → HTTP 200 sans erreur (dev server). Voir [[touraine-charte-palette-discrepancy]].
