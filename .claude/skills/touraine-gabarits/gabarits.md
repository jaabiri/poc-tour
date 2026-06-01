# Catalogue des gabarits + arborescence Touraine

Find the requested gabarit here and follow its anatomy. If a gabarit isn't listed, infer by analogy from the closest one and **add it to this file** so the catalogue grows.

## Gabarit catalogue (spec table)

| # | Gabarit | Source de contenu | Sections |
|---|---------|-------------------|----------|
| 1 | **Page d'accueil** | blocs home | Hero (image + bloc recherche/accès directs superposé), Services phares (CardGrid), Espaces dédiés (Communes / Entreprises), À la une, Actualités, Agenda, Newsletter, Footer |
| 2 | **Landing de rubrique** | nœud de menu (N1/N2) — `rubrique.landing` (blocs) ou auto-listing des enfants | Hero rubrique (titre, intro, breadcrumb, max ~360px), Intro RichText, CardGrid des sous-rubriques, NewsList filtrée par thématique, Agenda filtré, RelatedLinks (démarches/docs/contacts). Sections conditionnelles. |
| 3 | **Page actualités (listing)** | listing actus | En-tête + breadcrumb, À la une, bandeau Magazine/kiosque, "Toutes nos actualités" (recherche + filtres thématiques + compteur "X à Y sur Z"), grille, pagination, Agenda, Newsletter |
| 4 | **Page article** | nœud article | Breadcrumb, en-tête (badge cat, titre Fraunces, date, partage), image de couverture, corps RichText, encadré "L'essentiel", documents liés, "À lire aussi" (NewsList), retour à la rubrique |
| 5 | **Fiche démarche / service (N3)** | nœud service niveau 3 | Breadcrumb, hero service (titre + intro), "Concerné ? / Pour qui", étapes de la démarche, pièces à fournir, accès en ligne (CTA coral), contacts & lieux (Maisons de la solidarité), FAQ, liens connexes |
| 6 | **Page contact** | page contact | Coordonnées, horaires, formulaire de contact, carte de situation, accessibilité & mentions |
| 7 | **Agenda (listing événements)** | rubrique « Agenda » + collection `evenement` | En-tête + breadcrumb, À la une (prochain événement `featured`), bascule À venir / Passés, recherche + filtres par catégorie + compteur « X à Y sur Z », grille AgendaCard, pagination, Newsletter. Jumeau symétrique du listing actualités (#3). |
| 8 | **Annuaire MDS** | rubrique « Maisons de la solidarité » + `data/mds.json` | En-tête + breadcrumb, recherche + filtres par territoire + compteur, grille de cartes MDS (adresse, horaires, téléphone, courriel, lien carte OSM), Newsletter. Annuaire de proximité ; renvoie aux « contacts & lieux » de la fiche démarche (#5). |
| 9 | **Annuaire des élus (trombinoscope)** | rubrique « Les élus du Département » + `data/elus.json` | En-tête + breadcrumb, exécutif mis en avant (vue par défaut), recherche + filtres par groupe politique + compteur, grille de cartes élu (médaillon initiales/photo, canton, rôle+délégation, groupe, courriel), Newsletter. Jumeau de l'annuaire MDS (#8) pour des personnes. |
| 10 | **Kiosque « Touraine le Mag »** | rubrique « Touraine le Mag + kiosque » + `data/magazine.json` | En-tête + breadcrumb, dernier numéro « à la une », recherche + filtres par année + compteur, grille de numéros (couverture réelle ou aplat de charte, période, résumé, Feuilleter + Télécharger PDF), Newsletter. Concrétise le « bandeau Magazine/kiosque » évoqué en #3. |
| 11 | **Registre des actes administratifs** | rubrique « Les actes administratifs » + `data/actes.json` | En-tête + breadcrumb, recherche + filtres par nature (délibération/arrêté/RAA/budget) + par année + compteur « X à Y sur Z », liste de lignes (tag nature, référence, objet, date `<time>`, session, Télécharger PDF), pagination, Newsletter. Obligation de publicité des actes. |

(Add new rows as new gabarits are designed.)

## Implémentations (Next.js + Payload) — état du repo

Gabarits déjà câblés dans le projet. **Réutiliser ces fichiers et conventions** pour rester cohérent.

| # | Gabarit | Composant | Câblage |
|---|---------|-----------|---------|
| 2 | Landing rubrique (auto-listing) | `components/templates/RubriqueListingTemplate.tsx` | dispatcher `app/(frontend)/[...slug]` quand la rubrique n'a pas de `landing` |
| 2bis | **Page de rubrique éditoriale** (page longue, 2 colonnes) | `components/templates/RubriqueServiceTemplate.tsx` | dispatcher → `isServiceRubrique(rubrique)` (toute rubrique éditoriale ayant des `sections` dans `RUBRIQUE_CONTENT`, ex. `le-departement/un-departement-en-action`), **prioritaire sur `composed`**. Layout 8/12 + aside 4/12 (pleine largeur si aside vide). **Colonne principale** : intro chapô (~65ch) → sections **rythmées par `layout`** (`stats` = rangée de chiffres-clés Fraunces + tick rainbow ; `media` = visuel/aplat de charte latéral alterné G/D ; `cards` = feature-cards à icône thématique), numérotées 01/02… + eyebrow rainbow, fonds alternés blanc/canvas, encadré highlight → sous-rubriques (`RubriqueCard` si enfants) → **FAQ accordéon** (`components/ui/accordion`) → documents (cartes type+format) → liens utiles (`ArrowLink`) → **CTA « Besoin d'aide » en bandeau CLAIR** (séparé de la newsletter sombre du footer). **Aside collante** (`lg:sticky`, sous le contenu en mobile) : **Sommaire sticky + scroll-spy** (`components/ui/sticky-sommaire`, `<nav>`+`<ol>`, `aria-current`, IntersectionObserver, `prefers-reduced-motion`, repli mobile `aria-expanded`) + **Chiffres-clés** (`keyFigures`) + **En 1 clic** (`quickLinks`) + **Contacts utiles** (`contacts`). Deux îlots client : accordéon FAQ + sommaire scroll-spy. Ancres `id` + `scroll-mt-28`, breadcrumb intégré au hero. Tout data-driven depuis `data/rubriques-content.*` (interface étendue : `ContentSection.layout/stats/media/features`, `keyFigures`, `quickLinks`). |
| 3 | **Page actualités (listing)** | `components/templates/ActualiteListingTemplate.tsx` | dispatcher → `isActualiteIndex(rubrique)` (rubrique `actualites/toutes-les-actus`). Filtres/recherche/pagination via `searchParams` `?theme=&q=&page=` (RSC, aucun JS client). |
| 4 | Page article | `components/templates/ArticleTemplate.tsx` | dispatcher kind `article` (type `presentation`) |
| 5 | **Fiche démarche / service (N3)** | `components/templates/DemarcheTemplate.tsx` | dispatcher kind `article` → `doc.type === 'demarche'` (sinon ArticleTemplate). Étapes, pièces (`downloads`) et contacts depuis les champs Article ; accès en ligne (CTA corail) & FAQ via les blocs `body` (`cta-form`, `faq`). Aside contacts collante, 2 colonnes si contacts. |
| 6 | **Page contact** | `components/templates/ContactTemplate.tsx` | dispatcher → `isContactRubrique(rubrique)` (rubrique `nous-contacter`), prioritaire sur le landing. Coordonnées réutilisées de `data/footer.json`, horaires/carte/intro dans `data/contact.json` ; formulaire & contenu via les blocs `landing` (`ctaForm`) ; carte OSM en iframe ; accessibilité/mentions depuis `footer.legalLinks`. Aucun changement de schéma. |
| 7 | **Agenda (listing événements)** | `components/templates/AgendaListingTemplate.tsx` | dispatcher → `isAgendaIndex(rubrique)` (rubrique `agenda`), après `isActualiteIndex`. Filtres période (À venir/Passés) + catégorie + recherche + pagination via `searchParams` `?cat=&q=&when=&page=` (RSC, aucun JS client). Réutilise `AgendaCard` + `Newsletter`. |
| 8 | **Annuaire MDS** | `components/templates/AnnuaireMDSTemplate.tsx` | dispatcher → `isAnnuaireMDSRubrique(rubrique)`. Annuaire filtrable (territoire + recherche) via `searchParams` `?zone=&q=` (RSC, aucun JS client), données statiques `data/mds.json` (type `MdsContent`), cartes avec `CornerSeal`/`Tag` + lien carte OSM, `Newsletter`. Aucun changement de schéma. |
| 9 | **Annuaire des élus** | `components/templates/ElusTemplate.tsx` | dispatcher → `isElusRubrique(rubrique)` (rubrique `le-departement/les-elus-du-departement`), **avant `isServiceRubrique`** (la rubrique porte aussi des `sections` éditoriales). Exécutif (membres avec `role`) en tête en vue par défaut ; filtres groupe + recherche via `searchParams` `?group=&q=` (RSC, aucun JS client). Données statiques `data/elus.json` (`ElusContent`). |
| 10 | **Kiosque « Touraine le Mag »** | `components/templates/KiosqueTemplate.tsx` | dispatcher → `isKiosqueRubrique(rubrique)` (rubrique `actualites/touraine-le-mag-et-kiosque`), avant `isServiceRubrique`. Dernier numéro « à la une » ; filtres année + recherche via `?year=&q=`. Aplat de charte (`book-open` + n°) en repli sans couverture. `data/magazine.json` (`MagazineContent`). |
| 11 | **Registre des actes administratifs** | `components/templates/ActesTemplate.tsx` | dispatcher → `isActesRubrique(rubrique)` (rubrique `le-departement/les-actes-administratifs`), avant `isServiceRubrique`. Filtres nature + année + recherche + pagination via `?type=&year=&q=&page=`, compteur « X à Y sur Z » (mêmes Toolbar/Pagination que l'agenda #7). `data/actes.json` (`ActesContent`). |
| — | Actualité (détail) | `components/templates/ActualiteDetailTemplate.tsx` | dispatcher kind `actualite` |

**Conventions de gabarit (template contract) :** chaque template est un Server Component qui ne renvoie QUE le contenu `main` (pas de Topbar/SiteHeader/SiteFooter ni `<main>` ni filet ni fil d'Ariane — fournis par `app/(frontend)/layout.tsx` + le dispatcher). Tokens sémantiques uniquement, helpers `mediaSrc` / `rubriqueHref` repris à l'identique. Listes filtrables : préférer les `searchParams` (liens + form GET) au state client.

## Nav principale (3 entrées — du CCTP)
1. **Actualités** — Toutes les actus, Inscription Newsletter, Touraine le Mag + kiosque, Agenda à la une, Agenda de la Présidente
2. **Le Département** — Les missions, Un Département en action, Les 19 cantons, Les élus, Les groupes politiques, Les actes administratifs, L'Administration
3. **Mes services au quotidien** — Vos services de proximité, Accompagnement social, Habitat et logement, Insertion et emploi, Enfance et famille, Handicap, Personnes âgées, Soutien aux aidants, Collèges et Éducation, Culture, Sport, Tourisme et Patrimoine, Routes et mobilité, Environnement, Sécurité

## Accès directs (entrées secondaires)
Le Département recrute · Maisons départementales de la solidarité · Devenir famille d'accueil · Marchés publics et appels à projets · Enquêtes publiques · Plateforme OpenData

## Espaces dédiés
- **Communes & collectivités** — Demande de subventions, Facturation électronique, Plateforme Ingénierie, Portail SIG, Application ZPENS
- **Entreprises & associations** — Demande de subventions, Facturation électronique, Subventions européennes, Mécénat

## Exemple de déclinaison niveau 3 (pour les fiches démarche)
- Mes services au quotidien › **Enfance et famille** › Présentation et démarches : "J'attends un enfant", "Je veux adopter", "Je veux faire garder mon enfant", "Vie affective et santé sexuelle", "Devenir assistante maternelle", "Devenir famille d'accueil", "Colonie de vacances du Département"…
- Mes services au quotidien › **Sport** › Missions + démarches : "Je souhaite randonner", "Je souhaite déposer une demande de subvention"…

## Thématiques (pour filtres actus/agenda)
Solidarités · Culture · Environnement · Mobilité · Collèges · Sport · Institution · Portrait · Tourisme · Insertion et emploi · Logement

## Pied de page (arborescence)
- Mes services au quotidien : Accompagnement social, Enfance et famille, Personnes âgées, Handicap, Collèges, Culture & Sport
- Le Département : Les missions, Les 19 cantons, Les élus, Actes administratifs, L'Administration
- Accès directs : Le Département recrute, Familles d'accueil, Marchés publics, Enquêtes publiques, OpenData
- Légal : Mentions légales, Données personnelles, Accessibilité, Plan du site, Contact

## Page d'accueil — exigences CCTP (rappel)
Menu horizontal dynamique · agenda/événements programmable · inscription Newsletter · moteur de recherche · pied de page dynamique (coordonnées, logos, arborescence, mentions légales, plan du site, carte de situation) · accès espace privé · plusieurs entrées par typologies d'internautes, le moins de clics possible.
