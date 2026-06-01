# REVIEW — Audit des gabarits Touraine (démo client lundi)

> Audit conduit en **PO + Lead UX/UI** sur 4 axes :
> **(a) Conformité CCTP** · **(b) Respect charte** (logo : bleu dominant, corail accent, rainbow décoratif, Fraunces/Outfit, CornerSeal, filets) · **(c) Qualité UX/UI & modernité** · **(d) Accessibilité RGAA/AA**.
> Sources de vérité : skill `touraine-gabarits` (charte.md / components.md / gabarits.md) + **CCTP réel** `docs/cahier des charges.md` (Conseil départemental d'Indre-et-Loire / Touraine).
> Méthode : 11 agents d'audit/veille (workflow) lisant le code réel + relecture directe (shell, home, CCTP).

---

## 1. Tableau récapitulatif (gabarit × axes)

Statut : ✅ OK · 🟠 À corriger · 🔴 Manquant/critique — note /5.

| # | Gabarit / Zone | Fichier | CCTP | Charte | UX/UI | A11y | Score |
|---|----------------|---------|:----:|:------:|:-----:|:----:|:-----:|
| 1 | **Page d'accueil** | `app/(frontend)/page.tsx` + `components/sections/*` | 🟠 3 | 🔴 2 | ✅ 4 | ✅ 4 | 13/20 |
| 2 | **Landing de rubrique** | `RubriqueListingTemplate.tsx` | 🔴 2 | ✅ 4 | 🟠 3 | ✅ 4 | 13/20 |
| 3 | **Page actualités** | `ActualiteListingTemplate.tsx` | ✅ 4 | ✅ 4 | ✅ 4 | ✅ 4 | 16/20 |
| 4 | **Page article** | `ArticleTemplate.tsx` | 🔴 2 | ✅ 4 | 🟠 3 | ✅ 4 | 13/20 |
| 5 | **Fiche démarche N3** | `DemarcheTemplate.tsx` | 🔴 2 | 🟠 3 | 🟠 3 | 🟠 3 | 11/20 |
| 6 | **Contact** | `ContactTemplate.tsx` | 🔴 2 | ✅ 5 | 🟠 3 | ✅ 4 | 14/20 |
| 7 | **Shell global** (Header/Footer/Topbar) ⚠️ | `app/(frontend)/layout.tsx` + `components/layout/*` | 🟠 3 | 🟠 3 | 🟠 3 | 🔴 2 | 11/20 |
| 8 | **Fondations** (tokens/blocks/ui) ⭐ | `app/globals.css` + `components/ui/*` | ✅ 4 | ✅ 5 | ✅ 4 | ✅ 4 | 17/20 |

**Lecture rapide :** socle exceptionnel (Fondations 17, Actualités 16). Deux points faibles structurants : le **Shell global** (impacte TOUTES les pages → priorité n°1) et la **conformité charte de la home** (valeurs arbitraires + hex bruts contraires à `CLAUDE.md`). **Landing, Article, Démarche et Contact sont incomplets vs CCTP** : plusieurs sections obligatoires sont déléguées à `doc.body` (donc non garanties par le template) ou absentes. La Démarche est propre visuellement mais ne garantit que 2/7 sections par elle-même (CTA, breadcrumb, démarches liées dépendent du contenu éditeur).

---

## 2. Conformité CCTP — checklist des exigences dures (sur chaque page)

| Exigence CCTP (réf.) | État | Où / Manque |
|---------------------|:----:|-------------|
| Menu horizontal **dynamique** (méga-menus) | ✅ | `SiteHeader` + `data/navigation.json` |
| **Moteur de recherche sur chaque page** (p.10/13) | 🔴 | Présent **seulement** dans le Hero de la home → absent des pages internes |
| **Fil d'Ariane** (p.10/13) | ✅ | Rendu par les routes (`<nav aria-label="Fil d'Ariane">`, `<ol>`, `aria-current`) |
| **Agenda** programmable | ✅ | `Agenda` + `AgendaListingTemplate` |
| Inscription **Newsletter** | ✅ | `Newsletter` + `data/newsletter.json` |
| **Pied de page dynamique** (coordonnées, arbo, mentions, plan, carte) | ✅ | `SiteFooter` + `data/footer.json` |
| Accès **espace privé** | ✅ | `Topbar` + `SiteHeader` (icône lock) |
| **Plan du site** | ✅ | `app/(frontend)/plan-du-site/page.tsx` |
| **Impression PDF / A4** (p.10/13) | 🟠 | `PrintButton` existe mais non systématisé (article/démarche) |
| Réglage **taille police A= / A+ / A−** (p.13, malvoyants) | 🔴 | **Barre d'accessibilité absente** |
| Lien d'évitement **« Aller au contenu »** (skip-link) | 🔴 | Absent (RGAA) |
| **Cartes ArcGIS en plein écran via bouton** (p.18) | 🟠 | `MapEmbed` en iframe ; mode bouton plein écran recommandé |
| **≤ 2 clics** depuis l'accueil | 🟠 | OK via méga-menus ; renforcer par « Accès rapides » autonome |
| Slider/visuel fort en accueil | ✅ | Hero plein-cadre |
| Entrée par profil **« Je suis… »** (inspiration eurelien) | 🔴 | Non implémentée |

---

## 3. Fiches de revue par gabarit (constats cités du code)

### 1 — Page d'accueil — 13/20
9 sections présentes, **data-driven**, contenu tourangeau réaliste.
- 🟠 **CCTP — ordre non conforme** : rendu Hero → Services → Featured → Espaces → Actus → Agenda → Newsletter ; CCTP attendu **Hero → Accès rapides → Mise en avant → Actualités → Agenda → Espaces dédiés → Services → Newsletter**.
- 🔴 **CCTP — « Accès rapides » pas autonome** : imbriqué dans le Hero (`Hero.tsx` L87-94).
- 🔴 **Charte — CornerSeal jamais monté** sur la home (composant conforme existe).
- 🔴 **Charte — hex bruts interdits** : `Featured.tsx` L17 `linear-gradient(135deg,#006090,#003D5C)` ; `data/news.json` images = dégradés hex injectés (`NewsCard.tsx` L11/L16 `rgba(0,61,92,.9)`).
- 🟠 **Charte — valeurs arbitraires massives** : `h-[420px]`, `max-w-[600px]`, `rounded-[20px]` (≠ `rounded-card`), `shadow-[…]` (≠ `shadow-card`), `text-[14.5px]`, `lg:-ml-[60px]`…
- 🟠 **Remplissage** : 2 actus (grille de 3 attendue) ; 2 espaces dédiés (cibles : familles/jeunes/seniors/handicap/pros/communes).
- ✅ UX/UI 4 (hero, watermark, overlap, Reveal) · A11y 4 (focus global, landmarks, `lang=fr`, labels recherche).

### 2 — Landing de rubrique — 13/20
- 🔴 **CCTP (2/5)** : sur 6 sections, ~2 servies. Manquent **sous-navigation**, **intro éditoriale 2 colonnes**, **liens clés**, **bloc contact/aide**. Actus non plafonnées à 3 (limit:6). C'est un **auto-listing**, pas une landing composée.
- 🔴 **Charte** : CornerSeal absent du `RubriqueHero`.
- ✅ Charte 4 (tokens propres) · A11y 4 (breadcrumb réel). 🟠 UX 3 (jusqu'à 6 grilles identiques, kicker « Explorer » répété 3×).

### 3 — Page actualités — 16/20 ⭐
- ✅ **CCTP (4)** : titre+intro, filtres thématiques + recherche plein-texte (searchParams RSC, **sans JS client**), à la une, grille paginée + compteur « X à Y sur Z », CTA Newsletter, bonus Magazine + Agenda. États excellents (vide, page inexistante, `aria-live`).
- 🟠 **CCTP** : **filtre par date manquant**.
- 🟠 **A11y** : cibles < 44px (chips `py-2`, pagination `h-10`) ; `aria-pressed` invalide sur des `<Link>` → utiliser `aria-current`.
- 🟠 **Charte** : valeurs arbitraires + hex (via `NewsCard`/`news.json`).

### 4 — Page article — 13/20
- 🔴 **CCTP (2/7)** : **image de couverture + légende absente**, **date/tag/temps de lecture absents** (champs inexistants dans `collections/Article.ts`), **bloc auteur/source absent**, partage relégué en pied, retour vers rubrique (≠ actualités). → nécessite **évolution de schéma**.
- ✅ Charte 4 (prose conforme) · A11y 4. Note : `ActualiteDetailTemplate` a déjà le header riche (date/tag/cover) à réutiliser.

### 5 — Fiche démarche N3 — 11/20 (propre mais structure CCTP non garantie)
- 🔴 **CCTP (2/7)** : seules **Étapes** (`<ol>`) et **Contacts** sont garanties par le template. **CTA « Faire ma demande »**, **démarches liées** et **breadcrumb** dépendent de `doc.body` → une fiche peut s'afficher **sans action principale ni fil d'Ariane**, et l'ordre CCTP n'est pas tenu (CTA peut sortir avant les étapes). Manquent en propre : encadré **« En bref » (qui/quoi/délai)** et **checklist documents requis** distincte des PDF (fusionnés dans `DownloadsView`).
- 🟠 Charte 3 (rayons `rounded-xl/lg/full` ≠ `rounded-card/pill` ; CTA `rounded-md` ≠ pill teal ; pas de CornerSeal) · 🟠 A11y 3 (`<article>` sans `<main>` garanti ; format/poids PDF absent RGAA 13 ; cibles tel/mailto <44px) · 🟠 UX 3 (action noyée, pas d'aside sticky).

### 6 — Contact — 14/20
- 🔴 **CCTP (2/6)** : titre, coordonnées+horaires, carte OSM (iframe réelle + `title`) OK. **Manquent** **annuaire des services clés** (tél directs), **FAQ/liens rapides**, et le **formulaire n'est pas sur la page** (le bloc `ctaForm` ne rend qu'un bouton vers `/formulaire/{id}` → champs nom/email/sujet/message sur une autre page).
- ✅ **Charte 5/5** (exemplaire : 0 hex/arbitraire) · ✅ A11y 4 (sections `aria-labelledby`, iframe `title`, sr-only) — reste cibles <44px (liens tel/mailto/légaux) + contraste muted.

### 7 — Shell global — 11/20 ⚠️ (priorité n°1 — impacte toutes les pages)
- ✅ Topbar + filet-rainbow, Header sticky (méga-menus dynamiques, drawer mobile), Footer dynamique riche + filet-rainbow, breadcrumb accessible.
- 🔴 **A11y (P0)** — méga-menus inaccessibles clavier (`onMouseEnter` only, pas d'`aria-expanded/haspopup/controls`, pas d'Escape).
- 🔴 **CCTP (P0)** — recherche absente du header.
- 🔴 **A11y (P0)** — pas de skip-link « Aller au contenu ».
- 🔴 **CCTP (P0)** — barre d'accessibilité A=/A+/A− absente.
- 🟠 Charte : valeurs arbitraires header (`h-[78px]`, `px-[13px]`, `text-[15px]`…) + largeurs méga-menu en style inline.
- 🟠 A11y : `aria-current` sur nav active absent ; drawer mobile sans focus-trap.

> **Note shell** : « Espace privé » est **dupliqué** (Topbar + Header) ; le breadcrumb est **implémenté 2× à l'identique** (`[...slug]/page.tsx` + `BlockRenderer`) → à factoriser ; RainbowRule du footer est **en bas** au lieu d'en haut ; Newsletter absente du footer.

### 8 — Fondations (tokens/blocks/ui) — 17/20 ⭐ (socle le plus fort)
- ✅ Tokens `@theme` complets et fidèles (bleu/corail, `--rainbow` accent-only documenté, radius 18px, shadows teintées) ; Fraunces+Outfit via `next/font` ; **focus 3px corail global** ; `prefers-reduced-motion` ; `prose-touraine` ; ui cohérents (CornerSeal/SectionLabel/ArrowLink/Tag/Reveal).
- 🟠 **Cause racine des valeurs arbitraires** : pas d'échelle **spacing nommée** (`--spacing-*`).
- 🟠 Pas de **composant Button** standardisé → boutons ad hoc.
- 🟠 Vérifier/ajouter utilitaire `.sr-only`.

---

## 4. Liste priorisée des correctifs

### 🔴 P0 — Bloquants (a11y dure / CCTP dur / crédibilité démo)
1. **Shell — accessibilité clavier des méga-menus** (`aria-expanded/haspopup/controls`, ouverture focus/clic, Escape, focus-trap drawer) — `SiteHeader.tsx`
2. **Shell — recherche globale dans le Header** (sur chaque page) — `SiteHeader.tsx`
3. **Shell — skip-link « Aller au contenu »** + `id` sur `<main>` — `layout.tsx`
4. **Shell — barre d'accessibilité A=/A+/A−** (taille police, exigée CCTP) — nouveau composant + `Topbar.tsx`
5. **Contact — `<label>` liés + `title` iframe + validation `aria-live`** — bloc formulaire / `ContactTemplate.tsx`

### 🟠 P1 — Conformité charte & CCTP importantes
6. **Fondations — échelle `--spacing-*` nommée** + **Button standardisé** + `.sr-only`, puis **éliminer valeurs arbitraires & hex bruts** (home + header en priorité) — `globals.css`, `components/ui/`
7. **Home — réordonner** selon le CCTP + extraire **« Accès rapides » en section autonome** (bento, profils « Je suis… ») — `page.tsx`, nouvelle section
8. **Home — monter le CornerSeal** sur le Hero + harmoniser héros rubrique/démarche — `Hero.tsx`, `RubriqueHero.tsx`
9. **Home — vraies images** (remplacer dégradés `news.json`) + compléter actus (3) & espaces (profils) — `NewsCard.tsx`, data
10. **Landing rubrique** — intro 2 colonnes + liens clés + bloc contact/aide + plafonner actus à 3 — `RubriqueListingTemplate.tsx`
11. **Article** — réutiliser le header riche d'`ActualiteDetailTemplate` (date/tag/cover+légende/temps de lecture/partage en tête) — `ArticleTemplate.tsx` (+ champs `collections/Article.ts`)
12. **Contact** — annuaire services clés (nom+tél) + FAQ — `ContactTemplate.tsx`
13. **`aria-current='page'`** sur nav active + chips/pagination ; cibles ≥44px — `SiteHeader.tsx`, listings

### 🟢 P2 — Polish / complétude
14. Fiche démarche — encadré **« En bref »** (qui/quoi/délai/coût) + distinction docs requis / formulaires
15. Actualités — filtre **par date** + tronquer pagination
16. Impression A4 systématisée (article, démarche) ; carte ArcGIS **bouton plein écran**
17. Unifier les rayons sur `rounded-card` (18px) ; `shadow-card` au repos ; vérifier contraste `text-muted` (#64748b ≈ 4.3-4.4:1)

---

## 5. Synthèse inspiration (veille web) — 10 enseignements applicables

Issue de **maine-et-loire.fr + eurelien.fr** (les 2 références **nommées dans le CCTP**), **DSFR/RGAA** et **tendances 2026**. Sans copie — cap « institutionnel mais moderne », le waaw ne sacrifie jamais lisibilité/accessibilité.

1. **Entrée par profil « Je suis… »** (eurelien) → section « Accès rapides » autonome + tuiles profils (Familles, Jeunes, Seniors, Handicap, Entreprises/Assos, Communes). *A11y : vrais liens explicites, ≥44px, focus 3px, sens jamais par couleur seule.*
2. **Accueil clair et hiérarchisé** (maine-et-loire) → réordonner la home selon le CCTP, aérer, lecture en F. *Ordre DOM = ordre visuel.*
3. **Démarches = CTA primaires** (eurelien) → fiche démarche : CTA corail visible + encadré « En bref ». *Contraste AA corail #c0432b.*
4. **Agenda & actus datés/filtrables** → filtre par date ; home actus en 3 + agenda 3 datés. *Filtres `aria-current`, dates en texte.*
5. **Footer de réassurance** → plan du site + accessibilité + carte de situation garantis. *Contraste gris muted à relever.*
6. **Bento grid** (2026) pour accès rapides / espaces dédiés. *Ordre DOM logique, empilement mobile propre.*
7. **Superpositions/overlap maîtrisés** (effet magazine, déjà amorcé en Featured) → harmoniser via tokens. *Fond plein sous le texte — jamais sur rainbow ; tester reflow mobile.*
8. **Typo éditoriale expressive** (Fraunces+Outfit) → chiffres clés « Le Département en chiffres ». *Clamp borné ≥16px corps, AA.*
9. **DSFR/RGAA** → tuiles/accordéons/fil d'Ariane, focus nets, callout « à savoir », densité maîtrisée. *On emprunte les règles a11y, on garde notre charte rainbow/Fraunces.*
10. **Micro-interactions sobres** (hover lift, soulignés, flèches, cascade Reveal) harmonisées. *Tout sous `prefers-reduced-motion`, durées courtes.*

---

## 6. Verdict global

Socle de **grande qualité** (Fondations 17/20, Actualités & Démarche 16/20 — tokens fidèles, a11y de base bien posée). Pour le « waaw » + la conformité de lundi, **3 chantiers** :

1. **Fiabiliser le Shell** (recherche header, skip-link, barre a11y A=/A+/A−, méga-menus clavier) — *impacte toutes les pages, socle de crédibilité RGAA/CCTP.*
2. **Élever & conformer la Home** (réordonner, accès rapides bento « Je suis… », CornerSeal, vraies images, supprimer hex/arbitraires).
3. **Compléter les gabarits** (Landing : intro/liens/contact ; Article : header riche/cover ; Contact : annuaire/FAQ ; Démarche : « En bref ») puis **Showcase /showcase** narratif avec cases CCTP cochées.

> Plan d'action séquencé : voir le message d'accompagnement. **Aucun code modifié avant GO.**
