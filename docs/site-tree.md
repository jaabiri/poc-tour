# Arborescence & spécification des pages — touraine.fr

> Site institutionnel du Conseil Départemental d'Indre-et-Loire (CD37).
> Source des exigences : [cahier des charges.md](cahier%20des%20charges.md) (CCTP). Décisions d'architecture : [CONTEXT.md](../CONTEXT.md), [ADR-0001](adr/0001-headless-payload-over-traditional-cms.md), [ADR-0002](adr/0002-branch-scoped-rbac.md), [ADR-0003](adr/0003-french-sovereign-hosting.md).

Ce document décrit **l'arborescence du site** et **le contenu de chaque page**. Il est écrit pour deux lecteurs :

- côté **vitrine / front-office** : ce que voit l'internaute, page par page ;
- côté **headless CMS / Payload** : par quel *gabarit* (template), quels *blocs* et quelle *collection de contenu* chaque page est produite.

---

## 1. Principe directeur : il n'y a pas « une page par fichier »

L'arborescence du CCTP n'est **pas figée** (CCTP « Un contenu maîtrisé ») : les rubriques se créent, se renomment, se déplacent et se masquent à l'exécution, **sans limite de profondeur** (CCTP : « autant de rubriques et sous-rubriques que nécessaire … à n'importe quel niveau »). **3 niveaux** restent *recommandés* pour limiter les clics, mais ce n'est pas bloqué. On ne code donc **jamais** une page = un fichier. Tout est produit par la combinaison :

```
Rubrique (nœud de l'arbre)  →  Gabarit (template)  →  Blocs empilés  →  Contenu (collection Payload)
```

- **Rubrique** : un nœud de l'arbre `rubriques` (Payload Nested Docs) qui porte *uniquement la structure* — `title`, `slug`, `visible`, `order`, `parent` (profondeur illimitée, ≤3 recommandé), un `template` optionnel (gabarit forcé), et une *landing* optionnelle composée de blocs.
- **Gabarit** : un des ~12 archétypes décrits en §2. Le rendu se fait par une route attrape-tout `app/[[...slug]]/page.tsx` qui résout le chemin contre l'arbre à la volée.
- **Bloc** : une unité de mise en page composable (Hero, RichText, CardGrid, NewsList, MapEmbed…). Un bloc = un composant React (tokens sémantiques) + un schéma Payload. L'éditeur empile / réordonne / configure les blocs. **Ajouter un *nouveau type* de bloc = prestation Lot 2.**
- **Contenu** : une collection Payload (`article`, `actualite`, `evenement`, `breve`, `page`, `formulaire`…) rattachée en **relation many-to-many** à une ou plusieurs rubriques (rattachement transversal).

> **URL** = fil d'Ariane de la rubrique (+ slug du contenu). Déplacer une branche = reparenter un nœud ; le contenu n'est pas touché. Règle des 3 clics visée par la profondeur *recommandée* ≤3 + accès directs en page d'accueil.

---

## 2. Catalogue des gabarits (templates de page)

Chaque page du site est une instance de l'un de ces gabarits. La colonne « Blocs par défaut » liste les briques attendues ; l'éditeur peut en ajouter/retirer.

| # | Gabarit | Usage | Alimenté par | Blocs / sections par défaut |
|---|---------|-------|--------------|------------------------------|
| T1 | **Page d'accueil** | Singleton `/` | Rubriques + tags « à la une » | Voir §4 (anatomie dédiée) |
| T2 | **Landing de rubrique** | Nœud de menu (N1/N2) | `rubrique.landing` (blocs) **ou** auto-listing des enfants | Hero rubrique, intro RichText, CardGrid des sous-rubriques, NewsList filtrée, Agenda filtré, RelatedLinks |
| T3 | **Page éditoriale riche** | Pages « Présentation et démarches », contenu institutionnel | `page` / `article` | Hero, RichText, ImageText, FAQ, fichiers téléchargeables, RelatedLinks, bloc « Imprimer / PDF » |
| T4 | **Page démarche « Je veux… »** | Niveau 3 orienté tâche (ex. « J'attends un enfant ») | `article` (type=démarche) | Hero court, étapes (RichText/accordéon), CTA Formulaire, pièces à fournir, contacts du service, RelatedLinks |
| T5 | **Détail actualité** | Une actu | `actualite` | En-tête (tag, date, visuel), chapô, RichText, galerie, partage social, articles liés |
| T6 | **Liste / archive actualités** | « Toutes les actus » | requête `actualite` | Filtres (date, thème, type), grille NewsList paginée, abonnement newsletter |
| T7 | **Détail événement** | Un événement | `evenement` | Date/lieu/horaires, carte MapEmbed locator, RichText, inscription/CTA, ICS export |
| T8 | **Agenda (liste événements)** | « Agenda à la une », agendas thématiques | requête `evenement` | Filtres date/catégorie/lieu, calendrier ou liste Agenda, mise en avant |
| T9 | **Brève** | Information courte | `breve` | Titre, date, RichText court, lien source |
| T10 | **Page formulaire** | Démarches en ligne, contact | `formulaire` (Form Builder) | Intro, formulaire (champs illimités), confirmation, routage e-mail vers le service |
| T11 | **Landing d'espace dédié / profil** | « Communes », « Entreprises », « Presse », entrées « Je suis… » | `rubrique` (landing) | Hero profil, CardGrid de services, accès directs, contacts, RelatedLinks |
| T12 | **Page cartographique** | Cartes & applis SIG ESRI | `page` + bloc MapEmbed | Intro, bouton « Ouvrir en plein écran » (recommandé CCTP), iframe pour locator simple |
| S | **Pages système** | Recherche, plan du site, mentions, 404… | gabarits dédiés (§6) | Voir §6 |

**Bibliothèque de blocs** (dérivée de la maquette Figma « BLOC XXX », voir CONTEXT.md) :
`Hero/Slider · RichText · ImageText · CardGrid · CaseStudy · FAQ · CTA/Form · MapEmbed · NewsList · Agenda · Partners · RelatedLinks · DownloadList · Breadcrumb`.

---

## 3. Arborescence générale (3 niveaux)

Légende du gabarit entre crochets `[T#]`. Les noms ne sont pas figés (modifiables en back-office).

```
/  Page d'accueil ........................................................ [T1]
│
├── ENTRÉES PRINCIPALES (méga-menu)
│
├── Actualités ........................................................... [T2]
│   ├── Toutes les actus ................................................. [T6]
│   ├── Inscription Newsletter .......................................... [T10]
│   ├── Touraine le Mag + kiosque ....................................... [T2/Kiosque]
│   ├── Agenda à la une .................................................. [T8]
│   └── Agenda de la Présidente ......................................... [T8]
│
├── Le Département ....................................................... [T2]
│   ├── Les missions du Département ...................................... [T3]
│   ├── Un Département en action ......................................... [T3]
│   ├── Les 19 cantons ................................................... [T12 carte + T3]
│   ├── Les élus du Département .......................................... [T3 annuaire]
│   ├── Les groupes politiques ........................................... [T3]
│   ├── Les actes administratifs ......................................... [T3/T6 listing]
│   └── L'Administration ................................................. [T3]
│
├── Mes services au quotidien (méga-menu large) ......................... [T2]
│   ├── Vos services de proximité ....................................... [T12 carte + T11]
│   ├── L'accompagnement social ......................................... [T2 → T3/T4]
│   ├── Habitat et logement ............................................. [T2 → T3/T4]
│   ├── Insertion et emploi ............................................. [T2 → T3/T4]
│   ├── Enfance et famille .............................................. [T2 → T3/T4]
│   │     ├── Présentation et démarches ................................. [T3]
│   │     ├── J'attends un enfant ....................................... [T4]
│   │     ├── Je veux adopter un enfant ................................. [T4]
│   │     ├── Je veux faire garder mon enfant ........................... [T4]
│   │     ├── Vie affective et santé sexuelle ........................... [T4]
│   │     ├── Devenir assistant(e) maternel(le) ......................... [T4]
│   │     ├── Devenir famille d'accueil ................................. [T4]
│   │     └── Colonies de vacances du Département ....................... [T4]
│   ├── Handicap ........................................................ [T2 → T3/T4]
│   ├── Personnes âgées ................................................. [T2 → T3/T4]
│   ├── Soutien aux aidants ............................................. [T2 → T3/T4]
│   ├── Collèges et Éducation ........................................... [T2 → T3/T4]
│   ├── Culture ......................................................... [T2 → T3/T4]
│   ├── Sport ........................................................... [T2 → T3/T4]
│   │     ├── Missions + démarches ...................................... [T3]
│   │     ├── Je souhaite randonner ..................................... [T4]
│   │     └── Déposer une demande de subvention ......................... [T4/T10]
│   ├── Tourisme et Patrimoine .......................................... [T2 → T3/T4]
│   ├── Routes et mobilité .............................................. [T2 + T12 carte]
│   ├── Environnement ................................................... [T2 → T3/T4]
│   └── Sécurité ........................................................ [T2 → T3/T4]
│
├── ENTRÉES SECONDAIRES
│
├── Accès direct (depuis l'accueil / topbar)
│   ├── Le Département recrute ........................................... [T3 + lien externe]
│   ├── Maisons départementales de la solidarité ........................ [T12 carte + T3]
│   ├── Devenir famille d'accueil ....................................... [T4]
│   ├── Marchés publics & appels à projets ............................... [T3 + lien plateforme]
│   ├── Enquêtes publiques .............................................. [T6 listing]
│   └── Plateforme OpenData ............................................. [T3 + lien externe]
│
├── Espace « Communes & collectivités » ................................. [T11]
│   ├── Demande de subventions .......................................... [T4/T10]
│   ├── Facturation électronique ........................................ [T3 + lien]
│   ├── Plateforme web Ingénierie ....................................... [T3 + lien]
│   ├── Portail SIG ..................................................... [T12]
│   └── Application ZPENS (cadastre, ArcGIS) ............................ [T12]
│
├── Espace « Entreprises & associations » ............................... [T11]
│   ├── Demande de subventions .......................................... [T4/T10]
│   ├── Facturation électronique ........................................ [T3 + lien]
│   ├── Subventions européennes ......................................... [T3]
│   └── Mécénat ......................................................... [T3]
│
├── Espace presse ....................................................... [T11]
├── Accès Charte graphique .............................................. [T3 + DownloadList]
├── Sites internet annexes au Département ............................... [T3 liens]
├── Accès réseaux sociaux ............................................... (liens, header/footer)
│
└── Nous contacter ...................................................... [T2]
    ├── Coordonnées ..................................................... [T3 + MapEmbed]
    ├── Infos pratiques / horaires ...................................... [T3]
    ├── Formulaire de contact (obligatoire) ............................. [T10]
    └── Accessibilité & mentions légales ................................ [S]
```

> Le **niveau 3 d'« Enfance et famille » et de « Sport »** est explicitement donné par le CCTP comme *modèle* à décliner pour chaque thématique de « Mes services au quotidien » : `Présentation et démarches` (T3) puis une série de pages-tâches `Je veux… / Je souhaite…` (T4).

---

## 4. Anatomie de la page d'accueil [T1]

La page d'accueil est **l'élément central** (CCTP) : séduction + accès rapide, tout à ≤2 clics, plusieurs entrées pour plusieurs profils. Les blocs sont **réordonnables en back-office** et alimentés par mots-clés « à la une ». Implémentation de référence existante : [app/page.tsx](../app/page.tsx) et [components/sections/](../components/sections/).

| Ordre | Bloc / section | Contenu | Données | Composant existant |
|------:|----------------|---------|---------|--------------------|
| 1 | **Topbar** | Accès rapides, espace privé | [topbar.json](../data/topbar.json) | [Topbar](../components/layout/topbar/Topbar.tsx) |
| 2 | **Header + méga-menu dynamique** | Rubriques N1/N2, logo, recherche | [navigation.json](../data/navigation.json) | [SiteHeader](../components/layout/site-header/SiteHeader.tsx) |
| 3 | **Hero / Slider** | Grand visuel, accroche, **moteur de recherche**, accès rapides | [hero.json](../data/hero.json), [quick-access.json](../data/quick-access.json) | [Hero](../components/sections/hero/Hero.tsx) |
| 4 | **Services au quotidien** | Grille des thématiques (CardGrid) | [services.json](../data/services.json) | [Services](../components/sections/services/Services.tsx) |
| 5 | **À la une (Featured)** | Mise en avant d'un projet/réalisation | [featured.json](../data/featured.json) | [Featured](../components/sections/featured/Featured.tsx) |
| 6 | **Actualités** | Dernières actus (NewsList) | [news.json](../data/news.json) | [News](../components/sections/news/News.tsx) |
| 7 | **Agenda** | Événements programmables | [agenda.json](../data/agenda.json) | [Agenda](../components/sections/agenda/Agenda.tsx) |
| 8 | **Espaces dédiés** | Entrées profil (communes / entreprises) | [dedicated-spaces.json](../data/dedicated-spaces.json) | [DedicatedSpaces](../components/sections/dedicated-spaces/DedicatedSpaces.tsx) |
| 9 | **Newsletter** | Inscription (double opt-in RGPD) | [newsletter.json](../data/newsletter.json) | [Newsletter](../components/sections/newsletter/Newsletter.tsx) |
| 10 | **Pied de page dynamique** | Coordonnées, logos, **plan du site**, mentions légales, réseaux sociaux, carte de situation | [footer.json](../data/footer.json) | [SiteFooter](../components/layout/site-footer/SiteFooter.tsx) |

**Minimum imposé par le CCTP** (présent ci-dessus) : menu horizontal dynamique · agenda/événements programmable · inscription newsletter · moteur de recherche · pied de page dynamique · accès à un espace privé potentiel.

> En production, ces 12 fichiers `data/*.json` deviennent des **lectures Payload** (rubriques + contenus « à la une »), mis en cache par tag et invalidés à la publication (hook `afterChange` → `revalidateTag`) — publication *immédiate* sans redéploiement.

---

## 5. Contenu détaillé par gabarit

### T2 — Landing de rubrique
Porte d'entrée d'une section de menu. Deux modes au choix de l'éditeur :
- **mode composé** : la rubrique a une *landing* faite de blocs (Hero + intro + CardGrid des sous-rubriques + NewsList/Agenda filtrés sur la branche) ;
- **mode auto-listing** : génération automatique de la liste des sous-rubriques/contenus rattachés.
Sections : fil d'Ariane · titre + chapô · sous-rubriques (cartes) · actualités de la branche · agenda de la branche · liens utiles · CTA contact/formulaire.

### T3 — Page éditoriale riche (« Présentation et démarches », contenu institutionnel)
Fil d'Ariane · titre · chapô · corps RichText (titres, listes, liens internes/externes, médias) · blocs ImageText · encarts FAQ · **DownloadList** (PDF, podcasts, vidéos avec player) · **bouton Imprimer / PDF A4** · contacts du service · RelatedLinks. Méta SEO auto-dérivées + override.

### T4 — Page démarche « Je veux… » (orientée tâche, niveau 3)
Le cœur de l'approche « efficacité » du CCTP (inspiration eurelien.fr). Anatomie :
1. Hero court (titre = l'intention de l'usager) ;
2. « En bref » / éligibilité ;
3. **Étapes de la démarche** (accordéon / liste numérotée) ;
4. **Pièces à fournir** (DownloadList) ;
5. **CTA Formulaire** en ligne (T10) ou lien téléservice ;
6. Contacts du service concerné (+ carte si pertinent) ;
7. Démarches liées (RelatedLinks).

### T5 / T6 — Actualités (détail & liste)
- **Détail [T5]** : tag · date · visuel · chapô · RichText · galerie/médias · partage réseaux sociaux · actus liées · impression PDF.
- **Liste [T6]** : moteur de recherche plein texte + **filtres date / thème / type** · grille paginée · encart abonnement newsletter · flux. Alimente aussi le bloc NewsList de l'accueil et des landings.

### T7 / T8 — Événements & Agenda
- **Détail [T7]** : date(s), horaires, lieu + **MapEmbed locator**, RichText, inscription/CTA, export ICS, événements liés.
- **Agenda [T8]** : vue liste/calendrier, filtres date/catégorie/lieu. Décline « Agenda à la une » et « Agenda de la Présidente » (deux requêtes filtrées sur la même collection `evenement`).

### T9 — Brève
Information courte : titre · date · RichText bref · lien source. Agrégée dans les listings et l'accueil.

### T10 — Page formulaire
Construite avec le **Form Builder** Payload (champs illimités : texte, cases, sélecteurs, fichiers). Intro · formulaire · message de confirmation · **routage e-mail automatique vers le service concerné** (le « plus » du CCTP). Le **formulaire de contact est obligatoire** (non optionnel). RGPD : mentions de collecte, consentement.

### T11 — Espace dédié / entrée par profil
Pour « Communes & collectivités », « Entreprises & associations », « Presse », et les entrées « Je suis… » (benchmark eurelien.fr). Hero profil · CardGrid des services du profil · accès directs (téléservices, plateformes externes) · contacts dédiés · actualités du profil. Contenu de référence : [dedicated-spaces.json](../data/dedicated-spaces.json).

### T12 — Page cartographique (SIG ESRI / ArcGIS)
Bloc **MapEmbed** stockant l'URL d'un item ArcGIS + mode d'affichage. Par défaut : **bouton « Ouvrir la carte en plein écran (nouvelle fenêtre) »** (recommandation CCTP vu les restrictions navigateurs) ; iframe inline réservée aux cartes de localisation simples. Usages : 19 cantons, Maisons départementales de la solidarité, services de proximité, routes/mobilité, Portail SIG, ZPENS (cadastre).

---

## 6. Pages système & transverses [S]

| Page | Gabarit | Contenu | Exigence CCTP |
|------|---------|---------|---------------|
| **Résultats de recherche** | S | Recherche plein texte, accessible **sur chaque page** ; facettes date/type/événement | Moteur recherche global |
| **Plan du site** (HTML) | S | Arbre complet des rubriques visibles, en pied de page | Plan détaillé en pied de page |
| **`sitemap.xml`** | généré | Auto-généré depuis l'arbre `rubriques` visible | Sitemap XML pour robots |
| **Coordonnées / Contact** | T3 + MapEmbed | Adresse, plan d'accès, horaires | Nous contacter |
| **Formulaire de contact** | T10 | Obligatoire, routage service | Formulaire de contact |
| **Mentions légales** | S | Éditeur, directeur de publication, hébergeur (Lot 2) | Obligations légales |
| **Accessibilité (RGAA)** | S | Déclaration de conformité, schéma pluriannuel | Conformité RGAA |
| **Politique de confidentialité / RGPD** | S | Traitements, droits, DPO, CNIL | RGPD / Informatique & Libertés |
| **Gestion des cookies** | S | Bandeau + préférences, **conditionne Matomo** | Cookies / Matomo |
| **Newsletter — inscription** | T10 | Double opt-in | Inscription newsletter |
| **Touraine le Mag / Kiosque** | T2 | Bibliothèque de PDF (collection média) | Kiosque magazine |
| **Erreurs 404 / 500** | S | Page d'erreur avec recherche + liens utiles | UX |
| **Espace privé / connexion** | S | Accès à un éventuel espace privé | Accès espace privé potentiel |

**Fonctions transverses présentes sur toutes les pages** : fil d'Ariane · moteur de recherche · réglage taille des caractères (A= / A+ / A-) · impression PDF A4 · responsive (mobile/tablette) · liens réseaux sociaux · pied de page dynamique.

---

## 7. Correspondance pages → collections Payload

| Collection Payload | Gabarits qui la consomment | Notes |
|--------------------|----------------------------|-------|
| `rubriques` (Nested Docs, profondeur illimitée — ≤3 recommandé) | T1, T2, T11 | Structure seule : `title`, `slug`, `visible`, `order`, `parent`, `template`, `landing[blocks]` |
| `article` | T3, T4 | Pages éditoriales & démarches ; `type` distingue présentation / démarche |
| `actualite` | T5, T6, accueil | Tag, date, visuel |
| `evenement` | T7, T8, accueil | Dates, lieu, géoloc |
| `breve` | T9, listings | Information courte |
| `page` | T3, T12 | Pages institutionnelles / cartographiques |
| `formulaire` | T10 | Form Builder ; routage e-mail |
| `media` | tous | Images, PDF (kiosque), audio, vidéo ; stockage objet S3 souverain |
| `search` (index) | Recherche | Plugin de recherche Postgres full-text |
| `users` / `groupes` | back-office | RBAC branch-scoped — voir [ADR-0002](adr/0002-branch-scoped-rbac.md) |

Chaque contenu porte une relation **many-to-many `rubriques`** : un même article peut apparaître sous plusieurs branches (rattachement transversal du CCTP). L'URL est calculée depuis la rubrique de rattachement principale.

---

## 8. Règles de cohérence (rappel pour les contributeurs)

- **Profondeur recommandée ≤ 3 niveaux** — *non bloquant* : la structure peut être créée à n'importe quel niveau (CCTP « autant de rubriques et sous-rubriques que nécessaire »). 3 niveaux reste la cible pour limiter le nombre de clics.
- **≤ 2 clics** depuis l'accueil vers la majorité des pages — assuré par les accès directs + le méga-menu + la recherche.
- **Cycle de vie** du contenu : `brouillon → en attente de validation → publié → archivé → supprimé`, avec publication/dépublication programmable.
- **Autonomie éditoriale** : créer/déplacer/masquer une rubrique, écrire du contenu, réordonner les blocs de l'accueil = **100 % self-service**. Créer un *nouveau type de bloc* ou de gabarit, restyler = **Lot 2 (maintenance évolutive)**. Voir la frontière d'autonomie dans [CONTEXT.md](../CONTEXT.md).
- **SEO** : méta auto-dérivées + override par page · slugs propres issus de l'arbre · fil d'Ariane issu de la branche.
- **Conserver sans afficher** : une rubrique/branche peut être masquée (`visible=false`) sans suppression.
</content>
</invoke>
