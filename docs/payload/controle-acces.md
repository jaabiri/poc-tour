# Contrôle d'accès éditorial — guide complet (avec exemples)

> Comment fonctionnent les **droits par branche de rubrique** (ABAC) du back-office Touraine.
> Implémentation de [ADR-0002](../adr/0002-branch-scoped-rbac.md). Code : [`lib/access/`](../../lib/access). Voir aussi la fiche technique [rbac.md](./rbac.md).

Ce document est volontairement **illustré** : chaque règle est suivie d'exemples concrets. Il s'adresse autant aux développeurs (qui maintiennent la règle) qu'aux personnes qui doivent **comprendre ce qu'un utilisateur peut faire**.

---

## 1. L'idée en une phrase

> Un rédacteur ne voit et ne modifie que les contenus **rattachés aux rubriques (et sous-rubriques) sur lesquelles un de ses groupes lui a donné des droits**.

Ce n'est **pas** « un rôle = accès à toute une collection ». Un contributeur « Sport » ne peut pas toucher un contenu « Solidarité », même si les deux sont des `article`. La portée est la **branche de l'arborescence**, pas la collection.

---

## 2. Les trois ingrédients

### a) L'arborescence des rubriques (`rubriques`)

Un arbre (plugin *Nested Docs*, profondeur illimitée). Chaque nœud a un `parent`. C'est la **structure** du site ; le contenu y est rattaché, il n'y vit pas.

```
Mes services au quotidien
├─ Sport
│  ├─ Je souhaite randonner
│  └─ Déposer une demande de subvention
└─ Enfance et famille
   ├─ J'attends un enfant
   └─ Modes de garde

Solidarités
└─ L'accompagnement social
   └─ Aînés
```

### b) Le groupe de rédacteurs (`groupes`)

Un **ensemble de droits réutilisable**. Il porte :

| Champ | Rôle |
|-------|------|
| `branches` | une ou plusieurs **rubriques racines** sur lesquelles le groupe ouvre des droits. *L'accès hérite vers le bas.* |
| `canPublish` | si coché, les **contributeurs** du groupe publient eux-mêmes sur ces branches. |

> Exemple : groupe **« Rédaction Sport »** → `branches: [Sport]`, `canPublish: true`.
> Donne accès à *Sport* **et** *Je souhaite randonner* **et** *Déposer une demande de subvention* (héritage descendant).

### c) L'utilisateur (`users`)

| Champ | Rôle |
|-------|------|
| `role` | `administrateur-principal` \| `contributeur` \| `validateur` |
| `groupes` | les groupes auxquels il appartient (donc ses branches) |

Un utilisateur peut appartenir à **plusieurs groupes** : ses branches autorisées sont l'**union** de toutes les branches de ses groupes.

---

## 3. Le cœur du mécanisme : « hériter vers le bas »

Fonction centrale : [`getAllowedBranchIds(user, req)`](../../lib/access/branches.ts).

1. On collecte les **racines** accordées (`user.groupes[].branches`).
2. On charge l'arbre une fois, on construit la table `parent → enfants`, puis on fait un **parcours en largeur (BFS)** depuis chaque racine pour récolter **tous les descendants**.
3. Le résultat (un `Set` d'ids de rubriques) est **mémorisé sur la requête** : un même appel d'API ne parcourt jamais l'arbre deux fois.

### Exemple

Utilisateur du groupe **Rédaction Sport** (`branches: [Sport]`) :

```
getAllowedBranchIds → { Sport, "Je souhaite randonner", "Déposer une demande de subvention" }
```

Utilisateur du groupe **Validation Solidarités** (`branches: [Solidarités]`) :

```
getAllowedBranchIds → { Solidarités, "L'accompagnement social", "Aînés" }
```

> ✅ Robustesse : le BFS marque les nœuds visités → un arbre cyclique ou de profondeur quelconque **termine toujours**. Couvert par le test *« terminates on a cyclic tree »*.

---

## 4. Comment la règle s'applique aux 4 opérations

Chaque collection de contenu branche ses accès sur les fabriques de [`lib/access/factories.ts`](../../lib/access/factories.ts) :

```ts
access: {
  read:   branchScopedRead(),
  create: branchScopedCreate(),
  update: branchScopedUpdate(),
  delete: branchScopedDelete(),
}
```

La **forme de la valeur renvoyée** par une fonction d'accès change le comportement de Payload :

| Opération | Renvoie | Effet |
|-----------|---------|-------|
| **read** | un `Where` | filtre la liste : on ne voit que les docs dont `rubriques` **intersecte** ses branches |
| **create** | un **booléen** | Payload n'a pas de doc à filtrer ; on autorise selon les branches + les rubriques saisies |
| **update** | un `Where` | restreint **quels** docs sont modifiables (+ contrôle de publication) |
| **delete** | un `Where` | restreint quels docs sont supprimables |

Pour tous : **Administrateur principal → `true`** (court-circuit, accès total).

### Le filtre d'intersection

Pour un utilisateur dont les branches autorisées sont `{1, 2, 3}` :

```ts
// read / update / delete renvoient :
{ rubriques: { in: ['1', '2', '3'] } }
```

`in` sur une relation `hasMany` = « la ligne correspond si **au moins une** de ses rubriques est dans la liste » → exactement la sémantique « intersection ».

> Cas particulier : un utilisateur **sans aucune branche** obtient un filtre **impossible** `{ rubriques: { in: ['__none__'] } }` → il ne voit **rien**. (Test *« yields an impossible filter »*.)

---

## 5. La protection à l'écriture : ne pas « déposer » un contenu hors de sa branche

Le filtre `update` dit *quels* documents on peut modifier — mais pas *ce qu'on y écrit*. Sans garde-fou, un contributeur Sport pourrait **ajouter** la rubrique « Solidarité » à son propre article.

C'est le rôle du hook [`enforceBranchScope()`](../../lib/access/hooks.ts) (en `beforeChange` de chaque collection) :

> À la **création comme à la mise à jour**, **chaque** rubrique présente dans la donnée entrante doit appartenir aux branches autorisées de l'utilisateur. Sinon → erreur *« Rattachement refusé… »*.

### Exemples

| Utilisateur | Donnée entrante `rubriques` | Résultat |
|-------------|------------------------------|----------|
| Sport | `[Je souhaite randonner]` | ✅ accepté (descendant de Sport) |
| Sport | `[Solidarités]` | ❌ *Rattachement refusé* |
| Sport | `[Je souhaite randonner, Solidarités]` | ❌ refusé (une seule rubrique hors branche suffit) |
| Sport | *(mise à jour qui ne touche pas `rubriques`)* | ✅ ignoré (la valeur stockée avait déjà été validée) |
| Administrateur principal | `[n'importe quoi]` | ✅ bypass |
| Opération serveur (seed, tâche système, `overrideAccess`) | — | ✅ bypass (pas d'utilisateur) |

> ⚠️ Important : les opérations **Local API sans utilisateur** (seed, cron) ne sont **pas** filtrées — c'est voulu, elles sont de confiance. Le filtrage ne s'applique qu'à un utilisateur authentifié non-admin.

---

## 6. Le cycle de publication & le rôle Validateur

Payload fournit nativement deux statuts via les *drafts* : `_status = draft | published`. Le CCTP demande une étape intermédiaire **« en attente de validation »**. Elle est portée par un champ dédié [`reviewStatus`](../../fields/review.ts) (`reviewField()`), sans dupliquer le statut de publication :

| `reviewStatus` | Sens |
|----------------|------|
| `brouillon` | travail en cours (défaut) |
| `en_attente_de_validation` | soumis à un Validateur de la branche |

> `reviewStatus` est un **signal de workflow**. La vraie autorisation — **qui peut passer `_status` à `published`** — est tenue par la **porte de publication**.

### Qui peut publier ? `canPublishOnBranch(user, branches, req)`

[`lib/access/roles.ts`](../../lib/access/roles.ts) — la règle dépend **du rôle ET du groupe** :

| Rôle | Peut publier… |
|------|---------------|
| **Administrateur principal** | partout, toujours |
| **Validateur** | sur **toute branche couverte par un de ses groupes** (le drapeau `canPublish` n'est pas requis — valider/publier *est* son métier) |
| **Contributeur** | seulement sur une branche couverte par un groupe qui accorde **aussi** `canPublish` (« contributeur autonome ») |

Cette porte est appliquée à **deux** endroits (défense en profondeur) :
1. dans la fonction d'accès `branchScopedUpdate` (refuse l'opération si la transition vers `published` n'est pas permise) ;
2. dans le hook `beforeChange` de chaque collection (`enforcePublishGate` ou la garde locale équivalente), qui voit la donnée entrante.

### Le parcours type

```
Contributeur NON autonome (canPublish:false)
   rédige  ──▶  reviewStatus = « en attente de validation »  (reste _status=draft)
                          │
                          ▼
Validateur de la branche  ──▶  _status = published        ✅ en ligne
```

```
Contributeur AUTONOME (canPublish:true)   ──▶  _status = published directement   ✅
```

---

## 7. Exemples pas-à-pas (personas)

On reprend l'arbre du §2. Quatre comptes :

| Compte | Rôle | Groupe | Branche | `canPublish` |
|--------|------|--------|---------|--------------|
| `admin@cd37.fr` | Administrateur principal | — | (tout) | — |
| `sport@cd37.fr` | Contributeur | Rédaction Sport | Sport | **true** |
| `enfance@cd37.fr` | Contributeur | Rédaction Enfance | Enfance et famille | **false** |
| `valid@cd37.fr` | Validateur | Validation Solidarités | Solidarités | false |

### Persona A — Contributeur autonome (Sport)

1. **Voit** uniquement les contenus rattachés à *Sport* / *Je souhaite randonner* / *Déposer une demande de subvention*. (read → `{ rubriques: { in: [Sport…] } }`)
2. **Crée** un `article` (démarche) rattaché à *Je souhaite randonner* → ✅ (`branchScopedCreate` : rubrique dans ses branches).
3. **Publie** (`_status: published`) → `canPublishOnBranch` : son groupe couvre la branche **et** `canPublish:true` → ✅ **publié immédiatement**. Le hook `afterChange` revalide le cache, la page est en ligne sans redéploiement.
4. **Tente** de rattacher l'article à *Solidarités* → ❌ *Rattachement refusé* (`enforceBranchScope`).

### Persona B — Contributeur NON autonome (Enfance)

1. **Édite** « J'attends un enfant » (sous *Enfance et famille*) → ✅.
2. **Soumet** : passe `reviewStatus` à *en attente de validation* (le doc reste un brouillon). ✅
3. **Tente** de publier lui-même → `canPublishOnBranch` : couvre la branche mais **pas** de `canPublish`, et il n'est pas Validateur → ❌ *Publication refusée*. Le contenu reste « en attente de validation ».

### Persona C — Validateur (Solidarités)

1. Ses branches : *Solidarités* + descendants. Il **voit/édite** ces contenus.
2. Il ouvre un contenu « en attente de validation » sur sa branche et le **publie** → `canPublishOnBranch` : Validateur + branche couverte → ✅ (même si son groupe a `canPublish:false`).
3. Il **ne peut pas** publier un contenu *Sport* → branche non couverte → ❌.

### Persona D — Administrateur principal

Court-circuit partout : lit, crée, modifie, supprime, publie **tout**, et **gère** `users` / `groupes` (seul à le pouvoir). Voir §8.

---

## 8. Les collections « spéciales »

| Collection | Lecture | Écriture |
|------------|---------|----------|
| `users` | `adminOrSelf()` (admin, ou sa propre fiche) | `adminOnly` |
| `groupes` | `adminOnly` | `adminOnly` |
| `rubriques` (l'arbre) | publique mais limitée aux rubriques `visible` ; back-office connecté voit tout | admin **ou** branche : on ne modifie qu'un nœud **dans** une branche accordée ; créer une rubrique **racine** = admin uniquement |
| `media` | publique (fichiers servis sans session) | branch-scoped via un pivot `rubriques` **optionnel** (média sans rubrique = global, géré par l'admin) |

> Seul l'**Administrateur principal** modifie `role` et `groupes` → **pas d'auto-escalade** de droits par un contributeur (`update: adminOnly` sur `users`).

---

## 9. Tableau récapitulatif des décisions

| Question | Où c'est décidé | Fichier |
|----------|-----------------|---------|
| Quelles rubriques me sont autorisées ? | `getAllowedBranchIds` (BFS descendant, mémorisé) | `lib/access/branches.ts` |
| Quels docs je vois / modifie / supprime ? | `branchScoped{Read,Update,Delete}` → `Where` d'intersection | `lib/access/factories.ts` |
| Puis-je créer, et avec quelles rubriques ? | `branchScopedCreate` (booléen + contrôle des rubriques saisies) | `lib/access/factories.ts` |
| Puis-je **déposer** un contenu hors de ma branche ? | `enforceBranchScope` (beforeChange) — **non** | `lib/access/hooks.ts` |
| Puis-je **publier** sur cette branche ? | `canPublishOnBranch` (rôle + `canPublish`) | `lib/access/roles.ts` |
| Étape « en attente de validation » | champ `reviewStatus` | `fields/review.ts` |
| Verrou exclusif / historisation | verrouillage de document natif + `versions.drafts` | config collections |

---

## 10. Tests

La règle est **testée unitairement** (sans base de données : un faux `req.payload` injecte un arbre et des groupes). Voir [`lib/access/__tests__/access.test.ts`](../../lib/access/__tests__/access.test.ts).

```bash
pnpm test          # lance la suite une fois
pnpm test:watch    # mode veille
```

Couverture : héritage descendant, mémorisation, arbre cyclique, résolution des groupes par id, intersection `read`, contrôle `create`, porte de publication (`update` + hook), rôle Validateur, refus de rattachement hors branche (`enforceBranchScope`), `adminOnly` / `adminOrSelf`, `relId`.

---

## 11. Limites connues / évolutions

- **Publication multi-branches** : si un contenu est rattaché à plusieurs rubriques, la porte autorise la publication dès qu'**une** branche est publiable par l'utilisateur. À durcir (exiger le droit sur *toutes* les branches) si le besoin métier l'impose.
- **`reviewStatus`** est un signal éditorial ; il n'y a pas (encore) de file « à valider » dédiée pour le Validateur — elle se construit par requête : `reviewStatus = en_attente_de_validation` **et** `_status = draft`.
- **Performance** : `getAllowedBranchIds` charge l'arbre entier à chaque contrôle d'accès d'un non-admin (mémorisé par requête). Acceptable à l'échelle départementale ; à surveiller si l'arbre devient très volumineux.
