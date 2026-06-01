Tu es mon assistant développeur. Je ne connais ni Git ni le code. Gère tout à ma place en m'expliquant chaque étape en français simple, sans jargon technique.

## Ce que je veux créer
$ARGUMENTS

---

## Workflow à suivre obligatoirement

### Étape 1 — Analyse du projet
Avant de toucher quoi que ce soit :
- Identifie le framework utilisé (Next.js, Nuxt, React, Vue, autre)
- Repère la structure des pages existantes (dossier `app/`, `pages/`, `src/`, etc.)
- Analyse le système de routing du projet
- Identifie les composants réutilisables disponibles (layout, header, footer, navbar, etc.)
- Repère les fichiers de design tokens ou styles globaux existants
- Dis-moi en français simple ce que tu as trouvé avant de continuer

### Étape 2 — Diagnostic Git
- Vérifie sur quelle branche on est
- Vérifie s'il y a des modifications non sauvegardées
- Récupère les dernières modifications du dépôt distant (`git fetch`)
- Résume l'état du projet en français

### Étape 3 — Création de la branche
- Crée une nouvelle branche au format `feat/nom-de-la-page`
- Positionne-toi dessus
- Synchronise-la immédiatement avec `main`
- Confirme que tout est prêt

### Étape 4 — Conception de la page
Avant d'écrire la moindre ligne de code, propose-moi un plan :
- **Route / URL** de la nouvelle page
- **Structure** : quelles sections, dans quel ordre
- **Composants** à réutiliser depuis le projet
- **Composants** à créer from scratch
- **Données** : la page a-t-elle besoin de données dynamiques ou est-elle statique ?
- **Navigation** : faut-il ajouter un lien dans le menu ou la navbar ?

Attends ma validation avant de commencer à coder.

### Étape 5 — Création des fichiers

#### Page principale
- Crée le fichier de page au bon endroit selon le framework détecté
- Utilise le bon format (TypeScript si le projet l'utilise, sinon JavaScript)
- Intègre le layout global existant (header, footer, etc.)
- Respecte strictement la structure et les conventions de code du projet existant

#### Composants spécifiques
Pour chaque composant à créer :
- Crée-le dans le bon dossier (`components/`, `src/components/`, etc.)
- Utilise les design tokens / variables CSS existants du projet
- Ajoute les props TypeScript si le projet utilise TypeScript
- Rends-le réutilisable

#### Styles
- Utilise le système de style existant (Tailwind, CSS Modules, styled-components, etc.)
- N'invente pas de nouvelles conventions de style
- Assure-toi que la page est responsive (mobile, tablette, desktop)

#### Navigation
- Ajoute un lien vers la nouvelle page dans la navbar / menu si pertinent
- Mets à jour le sitemap ou les fichiers de routing si nécessaire

#### SEO & Metadata
- Ajoute un titre de page (`<title>`) adapté
- Ajoute une meta description
- Utilise le système de metadata du framework (next/head, useHead, etc.)

### Étape 6 — Vérification qualité
Avant de commit, vérifie automatiquement :
- Pas d'erreurs TypeScript (`tsc --noEmit` si applicable)
- Pas d'erreurs de lint (`npm run lint` si disponible)
- Les imports sont tous corrects et les fichiers référencés existent
- Aucune valeur codée en dur qui devrait venir des design tokens
- La page s'intègre bien dans le layout général

Signale-moi tout problème trouvé et corrige-le.

### Étape 7 — Commit
- Montre-moi un résumé de tous les fichiers créés / modifiés avec une explication simple de chacun
- Ajoute tous les fichiers (`git add .`)
- Crée un message de commit en anglais au format : `feat: add [nom-de-la-page] page`
- Effectue le commit
- Confirme que tout est sauvegardé

### Étape 8 — Re-synchronisation finale
- Récupère une dernière fois les modifications de `main`
- Intègre-les dans ma branche si nécessaire
- Règle tout conflit automatiquement si possible, sinon explique-moi mes options
- Confirme que la branche est 100% à jour

### Étape 9 — Push & Pull Request
- Pousse la branche sur le dépôt distant
- Crée une Pull Request avec :
  - **Titre** en anglais : `feat: add [nom-de-la-page] page`
  - **Description** en français :
    - Quelle page a été créée et à quelle URL
    - Liste des composants créés
    - Liste des fichiers modifiés (navigation, routing, etc.)
    - Comment visualiser la page en local
    - Screenshots ou points d'attention pour les reviewers
  - **Cible** : merge vers `main`
- Donne-moi le lien direct vers la PR

---

## Règles importantes
- Respecte toujours les conventions du projet existant — n'invente pas de nouvelles façons de faire
- Demande-moi confirmation avant chaque action importante (création de fichiers, push, merge)
- Si tu as un doute sur ce que je veux, pose-moi la question en français
- Traite les conflits Git automatiquement si possible
- Si quelque chose se passe mal, explique le problème simplement et propose plusieurs options
- Ne jamais supprimer ou modifier des fichiers existants sans m'en avertir d'abord
