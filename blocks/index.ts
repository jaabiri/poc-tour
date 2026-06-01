/**
 * Block library — the curated set of composable layout blocks (CONTEXT.md /
 * site-tree §2). One Payload Block config per file; SCHEMA ONLY (the matching
 * React components live under components/). Editors stack/reorder/configure
 * these on rubrique landings and rich articles. Adding a NEW block type is a
 * Lot 2 task.
 *
 * `blockLibrary` is a convenience array a `blocks` field can spread directly:
 *   { name: 'body', type: 'blocks', blocks: blockLibrary }
 */

import type { Block } from 'payload'

import { Hero } from './Hero'
import { RichText } from './RichText'
import { ImageText } from './ImageText'
import { CardGrid } from './CardGrid'
import { FAQ } from './FAQ'
import { CtaForm } from './CtaForm'
import { MapEmbed } from './MapEmbed'
import { NewsList } from './NewsList'
import { Agenda } from './Agenda'
import { Partners } from './Partners'
import { RelatedLinks } from './RelatedLinks'
import { DownloadList } from './DownloadList'
import { Breadcrumb } from './Breadcrumb'

export {
  Hero,
  RichText,
  ImageText,
  CardGrid,
  FAQ,
  CtaForm,
  MapEmbed,
  NewsList,
  Agenda,
  Partners,
  RelatedLinks,
  DownloadList,
  Breadcrumb,
}

/** Every block, ready to spread into a `blocks` field's `blocks` array. */
export const blockLibrary: Block[] = [
  Hero,
  RichText,
  ImageText,
  CardGrid,
  FAQ,
  CtaForm,
  MapEmbed,
  NewsList,
  Agenda,
  Partners,
  RelatedLinks,
  DownloadList,
  Breadcrumb,
]
