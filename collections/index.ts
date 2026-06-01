import type { CollectionConfig } from 'payload'

import { Users } from './Users'
import { Groupes } from './Groupes'
import { Rubriques } from './Rubriques'
import { Article } from './Article'
import { Actualite } from './Actualite'
import { Evenement } from './Evenement'
import { Breve } from './Breve'
import { Page } from './Page'
import { Media } from './Media'

/**
 * The registered Payload collections, in a stable order.
 *
 * `Users` is the admin auth collection (`config.admin.user = 'users'`) and is
 * listed first so Payload picks it up as the authentication collection. The
 * remaining order groups the identity/permission collections (Groupes) and the
 * structural tree (Rubriques) ahead of the branch-scoped content collections,
 * then Media last.
 *
 * Forms (T10) are NOT declared here — the Form Builder plugin registers the
 * `formulaire` + `form-submissions` collections itself (see plugins.ts).
 */
export const collections: CollectionConfig[] = [
  Users,
  Groupes,
  Rubriques,
  Article,
  Actualite,
  Evenement,
  Breve,
  Page,
  Media,
]

export default collections
