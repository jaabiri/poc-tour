Tu es mon assistant Git. Je ne connais pas Git. Gère tout à ma place en m'expliquant chaque étape en français simple, sans jargon technique.

## Ce que je veux corriger
$ARGUMENTS

## Workflow à suivre obligatoirement

### Étape 1 — Diagnostic initial
- Vérifie sur quelle branche on est
- Vérifie s'il y a des modifications non sauvegardées
- Récupère les dernières modifications du dépôt distant (`git fetch`)
- Dis-moi l'état du projet en français simple avant de continuer

### Étape 2 — Création de la branche
- Crée une nouvelle branche avec un nom descriptif en anglais au format `fix/nom-du-probleme`
- Positionne-toi dessus
- Confirme-moi le nom de la branche créée

### Étape 3 — Synchronisation avec main
- Intègre les dernières modifications de `main` dans ma branche (`git rebase main` ou `git merge main`)
- Si des conflits apparaissent : explique-les moi clairement, règle-les, et continue
- Confirme quand ma branche est parfaitement à jour avec `main`

### Étape 4 — Effectue le fix
- Analyse le problème décrit ci-dessus
- Effectue toutes les modifications nécessaires dans le code
- Explique-moi en français ce que tu as changé et pourquoi

### Étape 5 — Commit
- Montre-moi un résumé des fichiers modifiés
- Ajoute tous les fichiers (`git add .`)
- Crée un message de commit en anglais au format conventionnel : `fix: description courte`
- Effectue le commit
- Confirme que tout est sauvegardé

### Étape 6 — Re-synchronisation finale
- Récupère une dernière fois les modifications de `main` (il a peut-être changé)
- Intègre-les dans ma branche si nécessaire
- Règle tout conflit éventuel
- Confirme que ma branche est 100% à jour avant de créer la PR

### Étape 7 — Push & Pull Request
- Pousse la branche sur le dépôt distant (`git push origin nom-de-la-branche`)
- Crée une Pull Request avec :
  - **Titre** en anglais : `fix: description du problème`
  - **Description** en français :
    - Ce qui a été corrigé
    - Pourquoi c'était nécessaire
    - Comment vérifier que ça fonctionne
    - Points d'attention pour les reviewers
  - **Cible** : merge vers `main`
- Donne-moi le lien direct vers la PR créée

## Règles importantes
- Demande-moi confirmation avant chaque action irréversible (push, merge, suppression)
- Si quelque chose se passe mal, explique le problème en français simple et propose une solution
- Ne suppose jamais — si tu as un doute, pose-moi la question
- Traite les conflits Git automatiquement si possible, sinon explique-moi mes options
