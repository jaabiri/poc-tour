# Showcase des gabarits — guide de démo

> **Page de démonstration : `/showcase`** (lien « Showcase gabarits » dans la barre utilitaire).
> Support de présentation client : chaque gabarit en grand, sa checklist de sections CCTP,
> un bouton **« Voir en plein écran »** et un **mode annotations** (exigences CCTP couvertes).

## 1. Accès rapide démo

| Élément | URL |
|---|---|
| **Showcase (support de présentation)** | `/showcase` |
| Page d'accueil (réordonnée CCTP) | `/` |
| Recherche globale (header, chaque page) | loupe du header → `/recherche` |
| Barre d'accessibilité A=/A+/A− + contraste | en haut à droite (Topbar) |

Pour peupler la base Payload (gabarits internes pilotés par le CMS), voir la section 3.

## 2. Ce qui a été livré pour la démo

- **Shell (toutes les pages)** : lien d'évitement « Aller au contenu », barre
  d'accessibilité **A= / A+ / A−** + contraste (persistés), **recherche dans le header**,
  méga-menus **accessibles au clavier** (aria-expanded, Échap), tiroir mobile en
  `dialog` avec piège de focus, `aria-current` sur la nav active, **Newsletter au pied**
  et **filet arc-en-ciel en haut** du footer.
- **Accueil** : ordre conforme au CCTP, section **« Je suis… »** (entrée par profil),
  **CornerSeal** sur le héros, **vraies illustrations** (SVG charte, jamais cassées),
  cartes harmonisées (tokens, `rounded-card`, `shadow-card`).
- **Fondations** : tokens d'espacement nommés, `Button` standardisé, `.sr-only`,
  contraste du texte secondaire relevé en AA.
- **Showcase** `/showcase` : 6 gabarits du catalogue, checklist CCTP cochée,
  mode annotations, liens plein écran.

## 3. Peupler la base (gabarits pilotés par le CMS)

```
DATABASE_URI=file:./touraine.db
PAYLOAD_SECRET=<chaîne-secrète>
```

```bash
pnpm db:seed   # purge + ré-insère l'arborescence et le contenu de démo
pnpm dev       # http://localhost:3000
```

### Comptes back-office (`/admin`)

| Email | Rôle | Mot de passe |
|-------|------|--------------|
| `admin@touraine.fr` | Administrateur | `ChangeMe-2026!` |
| `sport@touraine.fr` | Contributeur (publie) | `ChangeMe-2026!` |
| `enfance@touraine.fr` | Contributeur (validation) | `ChangeMe-2026!` |
| `valideur@touraine.fr` | Validateur | `ChangeMe-2026!` |

## 4. Accéder à chaque gabarit (front-office, après seed)

| # | Gabarit | URL |
|---|---------|-----|
| 1 | Accueil | `/` |
| 2 | Landing rubrique (tous blocs) | `/mes-services-au-quotidien` |
| 3 | Page actualités (listing) | `/actualites/toutes-les-actus` |
| 4 | Page article | `/le-departement/un-departement-en-action/vitrine-article-tous-blocs` |
| 5 | Fiche démarche (N3) | `/mes-services-au-quotidien/enfance-et-famille/je-veux-adopter-un-enfant/vitrine-fiche-demarche` |
| 6 | Page contact | `/nous-contacter` |
| 7 | Agenda (listing) | `/actualites/agenda-a-la-une` |
| 8 | Annuaire MDS | `/acces-direct/maisons-departementales-de-la-solidarite` |

> Le détail d'audit conformité par gabarit (4 axes + correctifs priorisés) est dans
> [`REVIEW.md`](../REVIEW.md) à la racine.
