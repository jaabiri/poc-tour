/**
 * Librairie de blocks ÉVÉNEMENT — l'ensemble dédié au gabarit « Détail événement »
 * (site-tree T7). Distincte de la librairie de rubrique (`blocks/index.ts`) pour
 * que le champ `layout` d'un événement ne propose QUE des blocks d'agenda (jamais
 * du contenu de rubrique générique). SCHEMA ONLY ; les composants React vivent
 * sous `components/blocks/EventBlockRenderer.tsx`.
 *
 * `eventBlockLibrary` se spread directement dans un champ `blocks` :
 *   { name: 'layout', type: 'blocks', blocks: eventBlockLibrary }
 */

import type { Block } from 'payload'

import { EventRichText } from './EventRichText'
import { EventProgramme } from './EventProgramme'
import { EventPraticalInfo } from './EventPraticalInfo'
import { EventMedia } from './EventMedia'
import { EventMap } from './EventMap'
import { EventDocuments } from './EventDocuments'
import { EventCta } from './EventCta'
import { EventRelated } from './EventRelated'

export {
  EventRichText,
  EventProgramme,
  EventPraticalInfo,
  EventMedia,
  EventMap,
  EventDocuments,
  EventCta,
  EventRelated,
}

/** Tous les blocks événement, prêts à spreader dans un champ `blocks`. */
export const eventBlockLibrary: Block[] = [
  EventRichText,
  EventProgramme,
  EventPraticalInfo,
  EventMedia,
  EventMap,
  EventDocuments,
  EventCta,
  EventRelated,
]
