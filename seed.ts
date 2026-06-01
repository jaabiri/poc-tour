/**
 * seed.ts — idempotent database seed for the touraine.fr POC.
 *
 * Run with:  pnpm db:seed   (= `payload run ./seed.ts`)
 *
 * What it does (re-runnable / wipe-or-upsert):
 *   1. RUBRIQUE TREE — the full arborescence of docs/site-tree.md §3, built
 *      top-down so nested-docs `parent` links resolve (3 levels here by design,
 *      though the collection allows any depth).
 *   2. RBAC — groupes de rédacteurs + users that prove the branch-scoped ABAC
 *      of ADR-0002 (a publish-granting groupe vs a validation-required one).
 *   3. SAMPLE CONTENT — actualités / événements / articles (démarche) / pages /
 *      a contact formulaire, derived from the existing data/*.json, attached to
 *      their rubriques, with a mix of published + draft to show the lifecycle.
 *
 * Everything runs with `overrideAccess: true` so the seed itself is not subject
 * to the branch-scoped access rules (it is the Administrateur principal acting).
 */

import { getPayload } from 'payload'
import type { Payload, Where } from 'payload'
import path from 'node:path'
import sharp from 'sharp'

import config from './payload.config'
import type { Rubrique } from './payload-types'

import { slugify } from './fields/slug'

import navigationJson from './data/navigation.json'
import topbarJson from './data/topbar.json'
import footerJson from './data/footer.json'
import newsletterJson from './data/newsletter.json'

import { RUBRIQUE_CONTENT } from './data/rubriques-content'
import type { RubriqueContent, RelatedLink as CatRelatedLink } from './data/rubriques-content'

/* -------------------------------------------------------------------------- */
/*  Small helpers                                                             */
/* -------------------------------------------------------------------------- */

/** A dev password shared by every seeded account (printed at the end). */
const DEV_PASSWORD = 'ChangeMe-2026!'

/**
 * Build a minimal Lexical richText value from one or more paragraphs. Matches
 * the editor format the generated `richText` fields expect (root → paragraph →
 * text nodes).
 */
const richText = (...paragraphs: string[]) => ({
  root: {
    type: 'root',
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
    children: paragraphs.map((text) => ({
      type: 'paragraph',
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
      textFormat: 0,
      children: [
        {
          type: 'text',
          detail: 0,
          format: 0,
          mode: 'normal',
          style: '',
          text,
          version: 1,
        },
      ],
    })),
  },
})

/* -------------------------------------------------------------------------- */
/*  Rich Lexical builder — exercises EVERY node the default editor supports.   */
/* -------------------------------------------------------------------------- */
//
// `richText()` above only emits plain paragraphs. To prove the
// @payloadcms/richtext-lexical editor + the front-office <RichText> renderer
// work end-to-end (and that Live Preview reflects them), we also build a body
// that uses the full default feature set: headings, the inline marks
// (bold/italic/underline/inline-code), links, bullet + numbered lists,
// blockquote and a horizontal rule. The node shapes below match Lexical's
// serialized format exactly so Payload stores them verbatim and the editor
// re-hydrates them for inline editing.

/** A Lexical node (loose shape — we only ever build, never read, these). */
type LexNode = Record<string, unknown>

/** Inline text format bitmask (combine with |). */
const FMT = { bold: 1, italic: 2, strikethrough: 4, underline: 8, code: 16 } as const

/** A single text run with an optional format bitmask. */
const txt = (text: string, format = 0): LexNode => ({
  type: 'text',
  detail: 0,
  format,
  mode: 'normal',
  style: '',
  text,
  version: 1,
})

/** An inline link (custom URL) wrapping a single text run. */
const link = (text: string, url: string, newTab = true): LexNode => ({
  type: 'link',
  version: 3,
  direction: 'ltr',
  format: '',
  indent: 0,
  fields: { linkType: 'custom', url, newTab },
  children: [txt(text)],
})

const para = (...children: LexNode[]): LexNode => ({
  type: 'paragraph',
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
  textFormat: 0,
  textStyle: '',
  children,
})

const heading = (tag: 'h2' | 'h3' | 'h4', text: string): LexNode => ({
  type: 'heading',
  tag,
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
  children: [txt(text)],
})

/** A bullet ('ul') or numbered ('ol') list of plain-text items. */
const list = (listType: 'bullet' | 'number', items: string[]): LexNode => ({
  type: 'list',
  listType,
  start: 1,
  tag: listType === 'bullet' ? 'ul' : 'ol',
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
  children: items.map((t, i) => ({
    type: 'listitem',
    value: i + 1,
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
    children: [txt(t)],
  })),
})

const quote = (...children: LexNode[]): LexNode => ({
  type: 'quote',
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
  children,
})

const hr = (): LexNode => ({ type: 'horizontalrule', version: 1 })

/** Wrap top-level blocks into a complete Lexical editor value (root). */
const richDoc = (...children: LexNode[]) => ({
  root: {
    type: 'root',
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
    children,
  },
})

/* -------------------------------------------------------------------------- */
/*  Generated on-brand event banners (sharp, raw RGB — no fonts/SVG/network)    */
/* -------------------------------------------------------------------------- */
type RGB = [number, number, number]
const hexToRgb = (hex: string): RGB => {
  const n = parseInt(hex.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
const BLUE900: RGB = hexToRgb('#003D5C')
const RAINBOW_STOPS: RGB[] = ['#0AA6B8', '#0A77A8', '#8FB02E', '#E8A23A', '#D9533B'].map(hexToRgb)
const mix = (a: RGB, b: RGB, t: number): RGB => [
  Math.round(a[0] + (b[0] - a[0]) * t),
  Math.round(a[1] + (b[1] - a[1]) * t),
  Math.round(a[2] + (b[2] - a[2]) * t),
]
const rainbowAt = (x: number): RGB => {
  const seg = Math.min(Math.floor(x * 4), 3)
  return mix(RAINBOW_STOPS[seg], RAINBOW_STOPS[seg + 1], x * 4 - seg)
}
/** 1200×675 duotone JPEG (blue-900 → accent) + bottom rainbow filet. */
const makeBanner = async (accentHex: string): Promise<Buffer> => {
  const W = 1200, H = 675, FILET = 10
  const accent = hexToRgb(accentHex)
  const buf = Buffer.alloc(W * H * 3)
  for (let y = 0; y < H; y += 1) {
    const base = mix(BLUE900, accent, (y / H) ** 1.35)
    for (let x = 0; x < W; x += 1) {
      const i = (y * W + x) * 3
      const c = y >= H - FILET ? rainbowAt(x / W) : base
      buf[i] = c[0]; buf[i + 1] = c[1]; buf[i + 2] = c[2]
    }
  }
  return sharp(buf, { raw: { width: W, height: H, channels: 3 } }).jpeg({ quality: 82 }).toBuffer()
}

/**
 * Génère un PDF mono-page VALIDE (xref calculée) portant un titre, gonflé à
 * ~`padKb` Ko via un commentaire de remplissage — pour que les blocks
 * `eventDocuments` affichent un format (PDF) et un poids réalistes au seed.
 */
const makePdf = (title: string, padKb = 40): Buffer => {
  const header = '%PDF-1.4\n'
  const objs: Record<number, string> = {
    1: '<</Type/Catalog/Pages 2 0 R>>',
    2: '<</Type/Pages/Kids[3 0 R]/Count 1>>',
    3: '<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>',
    5: '<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>',
  }
  const stream = `BT /F1 20 Tf 72 760 Td (${title.replace(/[()\\]/g, ' ')}) Tj ET`
  objs[4] = `<</Length ${stream.length}>>\nstream\n${stream}\nendstream`
  let body = header
  const offsets: Record<number, number> = {}
  for (let i = 1; i <= 5; i += 1) {
    offsets[i] = Buffer.byteLength(body, 'latin1')
    body += `${i} 0 obj\n${objs[i]}\nendobj\n`
  }
  if (padKb > 0) body += `% ${'x'.repeat(padKb * 1024)}\n`
  const xrefOffset = Buffer.byteLength(body, 'latin1')
  let xref = 'xref\n0 6\n0000000000 65535 f \n'
  for (let i = 1; i <= 5; i += 1) xref += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`
  const trailer = `trailer\n<</Size 6/Root 1 0 R>>\nstartxref\n${xrefOffset}\n%%EOF`
  return Buffer.from(body + xref + trailer, 'latin1')
}

/* -------------------------------------------------------------------------- */
/*  1. RUBRIQUE TREE (docs/site-tree.md §3)                                    */
/* -------------------------------------------------------------------------- */

/**
 * Declarative description of the arborescence. Each node lists its `title` and
 * optional `children`; depth is implied by nesting (3 levels here by design — the
 * collection itself allows any depth). `order` is assigned incrementally per sibling group.
 *
 * Titles are taken verbatim from site-tree §3 (incl. the level-3 detail under
 * « Enfance et famille » and « Sport »).
 */
interface RubriqueNode {
  title: string
  /** Optional charte icon (an `IconName`) shown on the rubrique's CardGrid card. */
  icon?: string
  children?: RubriqueNode[]
}

const RUBRIQUE_TREE: RubriqueNode[] = [
  {
    title: 'Actualités',
    children: [
      { title: 'Toutes les actus' },
      { title: 'Inscription Newsletter' },
      { title: 'Touraine le Mag et kiosque' },
      { title: 'Agenda à la une' },
      { title: 'Agenda de la Présidente' },
    ],
  },
  {
    title: 'Le Département',
    children: [
      { title: 'Les missions du Département' },
      { title: 'Un Département en action' },
      { title: 'Les 19 cantons' },
      { title: 'Les élus du Département' },
      { title: 'Les groupes politiques' },
      { title: 'Les actes administratifs' },
      { title: "L'Administration" },
    ],
  },
  {
    title: 'Mes services au quotidien',
    children: [
      { title: 'Vos services de proximité', icon: 'map-pin' },
      { title: "L'accompagnement social", icon: 'heart-handshake' },
      { title: 'Habitat et logement', icon: 'building' },
      { title: 'Insertion et emploi', icon: 'briefcase' },
      {
        title: 'Enfance et famille',
        icon: 'baby',
        children: [
          { title: 'Présentation et démarches' },
          { title: "J'attends un enfant" },
          { title: 'Je veux adopter un enfant' },
          { title: 'Je veux faire garder mon enfant' },
          { title: 'Vie affective et santé sexuelle' },
          { title: 'Devenir assistant(e) maternel(le)' },
          { title: "Devenir famille d'accueil" },
          { title: 'Colonies de vacances du Département' },
        ],
      },
      { title: 'Handicap', icon: 'accessibility' },
      { title: 'Personnes âgées', icon: 'building-2' },
      { title: 'Soutien aux aidants', icon: 'hand-heart' },
      { title: 'Collèges et Éducation', icon: 'graduation-cap' },
      { title: 'Culture', icon: 'theater' },
      {
        // Left without an icon on purpose — proves the CardGrid renders a card
        // with no icon box (the icon is conditional).
        title: 'Sport',
        children: [
          { title: 'Missions et démarches' },
          { title: 'Je souhaite randonner' },
          { title: 'Déposer une demande de subvention' },
        ],
      },
      { title: 'Tourisme et Patrimoine', icon: 'landmark' },
      { title: 'Routes et mobilité', icon: 'map-pin' },
      { title: 'Environnement' },
      { title: 'Sécurité' },
    ],
  },
  {
    title: 'Accès direct',
    children: [
      { title: 'Le Département recrute' },
      { title: 'Maisons départementales de la solidarité' },
      { title: "Devenir famille d'accueil" },
      { title: 'Marchés publics et appels à projets' },
      { title: 'Enquêtes publiques' },
      { title: 'Plateforme OpenData' },
    ],
  },
  {
    title: 'Communes et collectivités',
    children: [
      { title: 'Demande de subventions' },
      { title: 'Facturation électronique' },
      { title: 'Plateforme web Ingénierie' },
      { title: 'Portail SIG' },
      { title: 'Application ZPENS' },
    ],
  },
  {
    title: 'Entreprises et associations',
    children: [
      { title: 'Demande de subventions' },
      { title: 'Facturation électronique' },
      { title: 'Subventions européennes' },
      { title: 'Mécénat' },
    ],
  },
  { title: 'Espace presse' },
  { title: 'Accès Charte graphique' },
  { title: 'Sites internet annexes au Département' },
  {
    title: 'Nous contacter',
    children: [
      { title: 'Coordonnées' },
      { title: 'Infos pratiques et horaires' },
      { title: 'Formulaire de contact' },
      { title: 'Accessibilité et mentions légales' },
    ],
  },
]

/**
 * Map from a "/"-joined slug PATH (e.g. "mes-services-au-quotidien/sport") to
 * the created rubrique id, so content can attach to a precise node. Slugs are
 * not globally unique (e.g. "Demande de subventions" appears under two spaces),
 * so we key by full path rather than by leaf slug.
 */
const rubriqueIdByPath = new Map<string, number>()

/**
 * Create the tree depth-first, top-down. Returns the number of rubriques made.
 * Slug uniqueness is enforced by the schema (`slugField` unique:true); since the
 * same leaf title can recur under different parents we de-duplicate the *slug*
 * by suffixing with the parent slug when a collision would occur.
 */
const seedRubriques = async (payload: Payload): Promise<number> => {
  let created = 0
  const usedSlugs = new Set<string>()

  const make = async (
    node: RubriqueNode,
    parentId: number | null,
    parentPath: string,
    order: number,
  ): Promise<void> => {
    let slug = slugify(node.title)
    // Disambiguate duplicate slugs (unique constraint) using the parent path.
    if (usedSlugs.has(slug)) {
      const parentSlug = parentPath.split('/').pop() ?? 'rubrique'
      slug = `${slug}-${parentSlug}`
    }
    usedSlugs.add(slug)

    const doc = await payload.create({
      collection: 'rubriques',
      overrideAccess: true,
      data: {
        title: node.title,
        slug,
        visible: true,
        order,
        ...(node.icon ? { icon: node.icon as Rubrique['icon'] } : {}),
        ...(parentId ? { parent: parentId } : {}),
        _status: 'published',
      },
    })
    created += 1

    const path = parentPath ? `${parentPath}/${slug}` : slug
    rubriqueIdByPath.set(path, doc.id)

    let childOrder = 0
    for (const child of node.children ?? []) {
      await make(child, doc.id, path, childOrder)
      childOrder += 1
    }
  }

  let rootOrder = 0
  for (const root of RUBRIQUE_TREE) {
    await make(root, null, '', rootOrder)
    rootOrder += 1
  }

  return created
}

/** Resolve a rubrique id by its slug path; throws if missing (seed bug guard). */
const rid = (path: string): number => {
  const id = rubriqueIdByPath.get(path)
  if (id == null) {
    throw new Error(`Seed error: no rubrique found for path "${path}"`)
  }
  return id
}

/* -------------------------------------------------------------------------- */
/*  Catalog → composed-landing builders (data/rubriques-content.ts)            */
/* -------------------------------------------------------------------------- */
//
// Every rubrique's page is produced from the editorial catalog: the helpers below
// translate one `RubriqueContent` entry into the rubrique `landing` block stack
// (hero + rich content + optional CardGrid/démarche/map/FAQ/downloads/liens +
// CTA), plus the per-page SEO. This replaces the old generic placeholder landing
// so EVERY rubrique URL lands on real, production-ready content.

/** Resolve catalog `related` links to relatedLinks block entries (internal/external). */
const resolveRelatedLinks = (links: CatRelatedLink[] = []) =>
  links
    .map((l) => {
      if (l.url) return { type: 'external' as const, url: l.url, label: l.label }
      if (l.path && rubriqueIdByPath.has(l.path)) {
        return { type: 'internal' as const, rubrique: rubriqueIdByPath.get(l.path)!, label: l.label }
      }
      // Unknown internal path → drop it rather than emit a dangling link.
      return null
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)

/** Lexical nodes for the intro paragraphs + sections (headings/paragraphs/bullets). */
const introNodes = (entry: RubriqueContent): LexNode[] => {
  const nodes: LexNode[] = []
  for (const p of entry.intro ?? []) nodes.push(para(txt(p)))
  for (const s of entry.sections ?? []) {
    nodes.push(heading('h2', s.heading))
    for (const p of s.paragraphs ?? []) nodes.push(para(txt(p)))
    if (s.bullets && s.bullets.length > 0) nodes.push(list('bullet', s.bullets))
  }
  return nodes
}

interface LandingOpts {
  title: string
  /** Has children → add a CardGrid of the sub-rubriques. */
  isParent: boolean
  /** Root-level section → also surface NewsList + Agenda (T2/T11). */
  topLevelSection: boolean
  /** Ordered child rubrique ids (for the CardGrid). */
  childrenIds: number[]
  heroImageId: number
  mediaLogoId: number
  contactFormId: number
}

/** Translate one catalog entry into a composed `landing` block stack. */
const buildLandingBlocks = (
  entry: RubriqueContent,
  opts: LandingOpts,
): Record<string, unknown>[] => {
  const blocks: Record<string, unknown>[] = []

  blocks.push({
    blockType: 'hero',
    title: opts.title,
    subtitle: entry.heroSubtitle,
    image: opts.heroImageId,
  })
  blocks.push({ blockType: 'richText', content: richDoc(...introNodes(entry)) })

  if (opts.isParent && opts.childrenIds.length > 0) {
    blocks.push({
      blockType: 'cardGrid',
      title: 'Explorer cette rubrique',
      source: 'rubriques',
      rubriques: opts.childrenIds,
    })
  }

  // Démarche (T4) → numbered steps + service contacts rendered as rich text.
  if (entry.demarche) {
    const stepNodes: LexNode[] = [heading('h2', 'Les étapes de votre démarche')]
    entry.demarche.steps.forEach((s, i) => {
      stepNodes.push(heading('h3', `${i + 1}. ${s.title}`))
      stepNodes.push(para(txt(s.text)))
    })
    if (entry.demarche.contacts && entry.demarche.contacts.length > 0) {
      stepNodes.push(heading('h2', 'Contacts utiles'))
      for (const c of entry.demarche.contacts) {
        const lines = [c.name, c.role, c.email, c.phone, c.address].filter(Boolean) as string[]
        stepNodes.push(para(txt(lines.join(' — '))))
      }
    }
    blocks.push({ blockType: 'richText', content: richDoc(...stepNodes) })
  }

  if (entry.map) {
    blocks.push({
      blockType: 'mapEmbed',
      title: entry.map.title,
      arcgisItemUrl: entry.map.arcgisItemUrl,
      displayMode: 'fullscreen-button',
    })
  }

  if (entry.faq && entry.faq.length > 0) {
    blocks.push({
      blockType: 'faq',
      title: 'Questions fréquentes',
      items: entry.faq.map((f) => ({ question: f.q, answer: richText(f.a) })),
    })
  }

  if (entry.downloads && entry.downloads.length > 0) {
    blocks.push({
      blockType: 'downloadList',
      title: 'Documents à télécharger',
      files: entry.downloads.map((label) => ({ file: opts.mediaLogoId, label })),
    })
  }

  const related = resolveRelatedLinks(entry.related)
  if (related.length > 0) {
    blocks.push({ blockType: 'relatedLinks', title: 'Liens utiles', links: related })
  }

  if (opts.topLevelSection) {
    blocks.push({ blockType: 'newsList', title: 'Actualités de la rubrique', mode: 'auto', limit: 3 })
    blocks.push({ blockType: 'agenda', title: 'Prochains rendez-vous', mode: 'auto', limit: 3 })
  }

  if (entry.contactCta !== false) {
    blocks.push({
      blockType: 'ctaForm',
      title: 'Une question ? Besoin d’aide pour une démarche ?',
      description: 'Contactez le service concerné via notre formulaire en ligne.',
      formulaire: opts.contactFormId,
      displayMode: 'button',
    })
  }

  return blocks
}

/* -------------------------------------------------------------------------- */
/*  Wipe (idempotency)                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Delete everything we seed so the script is fully re-runnable. Order matters:
 * content first (it relationships rubriques), then the tree, then RBAC. We use
 * `overrideAccess` and an always-true Where to clear each collection.
 */
const wipe = async (payload: Payload): Promise<void> => {
  const truncate = async (
    collection: Parameters<Payload['delete']>[0]['collection'],
    where: Where = { id: { exists: true } },
  ): Promise<void> => {
    await payload.delete({ collection, where, overrideAccess: true })
  }

  await truncate('actualite')
  await truncate('evenement')
  await truncate('breve')
  await truncate('article')
  await truncate('page')
  await truncate('form-submissions')
  await truncate('formulaire')
  await truncate('media')
  await truncate('rubriques')
  // Users: keep nothing seeded — remove all the touraine.fr dev accounts.
  await truncate('users', { email: { like: '@touraine.fr' } })
  await truncate('groupes')
}

/* -------------------------------------------------------------------------- */
/*  Main                                                                       */
/* -------------------------------------------------------------------------- */

const run = async (): Promise<void> => {
  const payload = await getPayload({ config })

  // --- idempotency: clear previously seeded rows -----------------------------
  await wipe(payload)

  // --- 1. Rubrique tree ------------------------------------------------------
  const rubriqueCount = await seedRubriques(payload)

  // Convenience handles to branch roots / nodes used below.
  const R = {
    actualites: rid('actualites'),
    toutesLesActus: rid('actualites/toutes-les-actus'),
    agendaUne: rid('actualites/agenda-a-la-une'),
    services: rid('mes-services-au-quotidien'),
    enfance: rid('mes-services-au-quotidien/enfance-et-famille'),
    enfanceAttends: rid("mes-services-au-quotidien/enfance-et-famille/j-attends-un-enfant"),
    enfanceGarde: rid('mes-services-au-quotidien/enfance-et-famille/je-veux-faire-garder-mon-enfant'),
    sport: rid('mes-services-au-quotidien/sport'),
    sportRando: rid('mes-services-au-quotidien/sport/je-souhaite-randonner'),
    sportSub: rid('mes-services-au-quotidien/sport/deposer-une-demande-de-subvention'),
    culture: rid('mes-services-au-quotidien/culture'),
    colleges: rid('mes-services-au-quotidien/colleges-et-education'),
    environnement: rid('mes-services-au-quotidien/environnement'),
    departement: rid('le-departement'),
    cantons: rid('le-departement/les-19-cantons'),
    communes: rid('communes-et-collectivites'),
    entreprises: rid('entreprises-et-associations'),
    contact: rid('nous-contacter'),
    contactForm: rid('nous-contacter/formulaire-de-contact'),
  }

  // --- 2. RBAC: groupes + users ----------------------------------------------
  await payload.create({
    collection: 'groupes',
    overrideAccess: true,
    data: {
      name: 'Rédaction Actualités',
      description: "Rédige et publie les actualités, agendas et newsletters du Département.",
      branches: [R.actualites],
      canPublish: true,
    },
  })

  const groupeSport = await payload.create({
    collection: 'groupes',
    overrideAccess: true,
    data: {
      name: 'Rédaction Sport',
      description: 'Contributeur autonome sur la branche Sport (publication autorisée).',
      branches: [R.sport],
      canPublish: true,
    },
  })

  const groupeEnfance = await payload.create({
    collection: 'groupes',
    overrideAccess: true,
    data: {
      name: 'Rédaction Enfance & famille',
      description:
        "Rédige sur la branche Enfance et famille mais ne publie pas : soumet « en attente de validation ».",
      branches: [R.enfance],
      canPublish: false,
    },
  })

  const groupeAdmin = await payload.create({
    collection: 'groupes',
    overrideAccess: true,
    data: {
      name: 'Administration',
      description: "Groupe racine : droits sur l'ensemble de l'arborescence.",
      branches: RUBRIQUE_TREE.map((r) => rid(slugify(r.title))),
      canPublish: true,
    },
  })

  // A validateur for the Enfance branch needs the publish right there, so it
  // belongs to a publish-granting groupe scoped to that branch.
  const groupeEnfanceValidation = await payload.create({
    collection: 'groupes',
    overrideAccess: true,
    data: {
      name: 'Validation Enfance & famille',
      description: "Permet de publier les contenus « en attente de validation » de la branche Enfance et famille.",
      branches: [R.enfance],
      canPublish: true,
    },
  })

  const admin = await payload.create({
    collection: 'users',
    overrideAccess: true,
    data: {
      name: 'Administrateur principal',
      email: 'admin@touraine.fr',
      password: DEV_PASSWORD,
      role: 'administrateur-principal',
      groupes: [groupeAdmin.id],
    },
  })

  // The seeded Administrateur principal, shaped as the `req.user` Payload hands
  // to hooks. Content creates run AS this user so the publish-right hooks
  // (`enforcePublishRights` / `canPublishOnBranch`) see an admin and allow
  // `_status: 'published'`. `overrideAccess` only bypasses ACCESS functions, not
  // beforeChange HOOKS, so we must supply a privileged `user` here.
  const adminUser = { ...admin, collection: 'users' as const }

  /** Create a content doc AS the Administrateur principal (passes the hooks). */
  const createAsAdmin = <T extends Parameters<typeof payload.create>[0]>(
    args: T,
  ): ReturnType<typeof payload.create> =>
    payload.create({ ...args, overrideAccess: true, user: adminUser })

  const sportUser = await payload.create({
    collection: 'users',
    overrideAccess: true,
    data: {
      name: 'Contributeur Sport',
      email: 'sport@touraine.fr',
      password: DEV_PASSWORD,
      role: 'contributeur',
      groupes: [groupeSport.id],
    },
  })

  const enfanceUser = await payload.create({
    collection: 'users',
    overrideAccess: true,
    data: {
      name: 'Contributeur Enfance & famille',
      email: 'enfance@touraine.fr',
      password: DEV_PASSWORD,
      role: 'contributeur',
      groupes: [groupeEnfance.id],
    },
  })

  const valideurUser = await payload.create({
    collection: 'users',
    overrideAccess: true,
    data: {
      name: 'Validateur Enfance & famille',
      email: 'valideur@touraine.fr',
      password: DEV_PASSWORD,
      role: 'validateur',
      groupes: [groupeEnfanceValidation.id],
    },
  })

  // --- 3. Sample content -----------------------------------------------------

  // 3a-0bis. MEDIA — upload real files from /public so the image-bearing blocks
  // (hero, imageText, partners, downloadList, cardGrid) and the actualité/SEO
  // visuals resolve to actual URLs instead of empty relations.
  const uploadMedia = (relPath: string, alt: string) =>
    createAsAdmin({
      collection: 'media',
      data: { alt },
      filePath: path.resolve(process.cwd(), relPath),
    })

  const mediaHero = await uploadMedia(
    'public/images/hero-touraine.jpg',
    'Les bords de Loire en Touraine',
  )
  const mediaLogo = await uploadMedia(
    'public/logo.png',
    'Logo du Département de Touraine',
  )

  // Per-category event banners (generated duotone visuals) → real `media` docs.
  const CATEGORY_ACCENT: Record<string, { hex: string; alt: string }> = {
    culture: { hex: '#D9533B', alt: 'Visuel — événement Culture en Touraine' },
    sport: { hex: '#0AA6B8', alt: 'Visuel — événement Sport en Touraine' },
    famille: { hex: '#E8A23A', alt: 'Visuel — événement Famille en Touraine' },
    environnement: { hex: '#8FB02E', alt: 'Visuel — événement Environnement en Touraine' },
    institutionnel: { hex: '#006090', alt: 'Visuel — événement Institutionnel du Département' },
    conference: { hex: '#0A77A8', alt: 'Visuel — conférence / réunion du Département' },
    atelier: { hex: '#E8853A', alt: 'Visuel — atelier proposé par le Département' },
    autre: { hex: '#005380', alt: 'Visuel — événement du Département de Touraine' },
  }
  const categoryMedia: Record<string, number> = {}
  for (const [category, { hex, alt }] of Object.entries(CATEGORY_ACCENT)) {
    const banner = await createAsAdmin({
      collection: 'media',
      data: { alt },
      file: { data: await makeBanner(hex), mimetype: 'image/jpeg', name: `agenda-${category}.jpg`, size: 0 },
    })
    categoryMedia[category] = banner.id as number
  }

  // 3a. Actualités (from data/news.json + featured.json) ----------------------
  // First two derived from news.json; third (featured/Collèges) is the homepage
  // « à la une ». A fourth is left as a draft to show the lifecycle.

  // 3a-0. SHOWCASE actualité — exercises EVERY RichText node so we can verify
  // the @payloadcms/richtext-lexical editor + front-office renderer + Live
  // Preview all work. Featured + most recent published date → it surfaces as the
  // « à la une » of the listing (T3), making the demo easy to find.
  await createAsAdmin({
    collection: 'actualite',
    overrideAccess: true,
    data: {
      title: 'Festival « Touraine en partage » : trois jours de culture pour tous',
      slug: 'festival-touraine-en-partage',
      tag: 'Culture',
      date: '2026-05-29T09:00:00.000Z',
      chapo:
        'Du 12 au 14 juin, le Département invite les Tourangelles et les Tourangeaux à célébrer la culture sous toutes ses formes : musique, théâtre, arts visuels et patrimoine, gratuitement et près de chez vous.',
      body: richDoc(
        para(
          txt('Pour sa dixième édition, le festival '),
          txt('Touraine en partage', FMT.bold),
          txt(
            ' investit une quinzaine de communes du département. Une programmation pensée pour ',
          ),
          txt('toutes les générations', FMT.italic),
          txt(', avec un fil conducteur : rendre la culture accessible à chacun.'),
        ),
        heading('h2', 'Une programmation foisonnante'),
        para(
          txt(
            'Concerts en plein air, spectacles de rue, expositions et ateliers se succéderont pendant trois jours. Les temps forts à ne pas manquer :',
          ),
        ),
        list('bullet', [
          'Le grand concert d’ouverture sur les bords de Loire, vendredi 12 juin à 20 h.',
          'Le village des arts visuels installé dans la cour de la Maison du Département.',
          'Les balades patrimoniales guidées au cœur des villages tourangeaux.',
          'Un espace dédié au jeune public : contes, marionnettes et ateliers créatifs.',
        ]),
        heading('h3', 'Comment participer ?'),
        para(
          txt(
            'L’entrée est libre et gratuite pour l’ensemble des animations. Pour les ateliers à places limitées, l’inscription se fait en quelques étapes :',
          ),
        ),
        list('number', [
          'Consultez le programme complet sur le site du Département.',
          'Choisissez les ateliers qui vous intéressent.',
          'Réservez votre créneau en ligne ou auprès de votre mairie.',
        ]),
        para(
          txt('Le programme détaillé et la billetterie des ateliers sont disponibles sur '),
          link('touraine.fr/festival', 'https://www.touraine.fr'),
          txt('. Pensez à réserver tôt : certains ateliers affichent vite '),
          txt('complet', FMT.code),
          txt('.'),
        ),
        quote(
          para(
            txt(
              '« La culture n’est pas un luxe, c’est un lien. Avec ce festival, nous voulons qu’elle aille à la rencontre de tous les habitants, dans chaque territoire. »',
              FMT.italic,
            ),
          ),
        ),
        hr(),
        heading('h4', 'Infos pratiques'),
        para(
          txt('Accès facilité', FMT.underline),
          txt(
            ' : navettes gratuites au départ des principales gares, parkings vélos sécurisés et sites accessibles aux personnes à mobilité réduite. ',
          ),
          txt('Renseignements au 02 47 00 00 00.'),
        ),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ) as any,
      rubriques: [R.toutesLesActus, R.culture],
      featured: true,
      _status: 'published',
    },
  })

  await createAsAdmin({
    collection: 'actualite',
    overrideAccess: true,
    data: {
      title: 'Une fresque participative illumine la Maison du Département',
      slug: 'fresque-participative-maison-departement',
      tag: 'Culture',
      date: '2026-05-20T09:00:00.000Z',
      chapo:
        'Habitants et artistes tourangeaux ont réalisé ensemble une fresque monumentale sur la façade de la Maison du Département.',
      body: richText(
        "Pendant trois semaines, plus de 200 habitants se sont relayés aux côtés d'artistes locaux pour donner vie à une fresque participative.",
        "Cette réalisation s'inscrit dans la politique culturelle du Département en faveur de la création partagée.",
      ),
      rubriques: [R.toutesLesActus, R.culture],
      featured: true,
      _status: 'published',
    },
  })

  await createAsAdmin({
    collection: 'actualite',
    overrideAccess: true,
    data: {
      title: 'Rencontre avec les artisans du patrimoine tourangeau',
      slug: 'artisans-patrimoine-tourangeau',
      tag: 'Portrait',
      date: '2026-05-12T09:00:00.000Z',
      chapo:
        'Tailleurs de pierre, couvreurs, restaurateurs : portraits de celles et ceux qui font vivre le patrimoine de Touraine.',
      body: richText(
        "Le Département soutient les métiers d'art et le savoir-faire patrimonial à travers ses dispositifs de restauration.",
      ),
      rubriques: [R.toutesLesActus, R.culture],
      featured: true,
      _status: 'published',
    },
  })

  await createAsAdmin({
    collection: 'actualite',
    overrideAccess: true,
    data: {
      title: 'Les collèges de Touraine face au défi des fortes chaleurs',
      slug: 'colleges-touraine-fortes-chaleurs',
      tag: 'Collèges',
      date: '2026-05-28T09:00:00.000Z',
      chapo:
        'Le Département investit pour adapter les bâtiments scolaires : ombrières, végétalisation des cours et rénovation thermique des collèges les plus exposés.',
      body: richText(
        "Face au réchauffement climatique, le Département engage un plan d'adaptation des collèges les plus exposés aux fortes chaleurs.",
        'Ombrières, végétalisation des cours et rénovation thermique sont au programme des prochaines années.',
      ),
      rubriques: [R.toutesLesActus, R.colleges],
      featured: true,
      _status: 'published',
    },
  })

  await createAsAdmin({
    collection: 'actualite',
    overrideAccess: true,
    data: {
      title: "Bilan de la saison de randonnée : un brouillon à relire",
      slug: 'bilan-saison-randonnee-brouillon',
      tag: 'Sport',
      date: '2026-05-30T09:00:00.000Z',
      chapo: "Brouillon de l'équipe Sport — en attente de relecture avant publication.",
      body: richText('Contenu provisoire, ne pas publier en l’état.'),
      rubriques: [R.sport],
      featured: false,
      _status: 'draft',
    },
  })

  // 3b. Événements — jeu réaliste étalé (mai→déc 2026 + passés) qui alimente le
  // listing agenda redesigné : groupes par mois, pagination, bascule
  // liste/calendrier, filtres catégorie + période. Visuel + heure + accroche.
  type EvCat = 'culture' | 'sport' | 'famille' | 'environnement' | 'institutionnel' | 'conference' | 'atelier' | 'autre'
  interface SeedEvent { t: string; s: string; start: string; end?: string; loc: string; cat: EvCat; ex: string; featured?: boolean; rub?: number; address?: string; geo?: [number, number]; status?: 'a-venir' | 'complet' | 'passe'; allDay?: boolean }

  const EVENEMENTS: SeedEvent[] = [
    // Passés (avant 31/05/2026) → onglet « Passés »
    { t: 'Vœux du Président aux Tourangeaux', s: 'voeux-president-2026', start: '2026-01-15T18:30:00.000Z', end: '2026-01-15T20:00:00.000Z', loc: 'Hôtel du Département, Tours', cat: 'institutionnel', ex: 'La cérémonie des vœux du Département : bilan de l’année et perspectives pour la Touraine.', rub: R.departement },
    { t: 'Nuit de la lecture en Touraine', s: 'nuit-de-la-lecture-2026', start: '2026-01-24T17:00:00.000Z', end: '2026-01-24T23:00:00.000Z', loc: 'Bibliothèque départementale, Tours', cat: 'culture', ex: 'Lectures, rencontres et animations gratuites dans les bibliothèques du réseau départemental.', rub: R.culture },
    { t: 'Salon de l’orientation des collégiens', s: 'salon-orientation-collegiens-2026', start: '2026-02-12T09:00:00.000Z', end: '2026-02-12T17:00:00.000Z', loc: 'Parc des expositions, Tours', cat: 'famille', ex: 'Métiers, filières et témoignages pour aider les collégiens à construire leur parcours.', rub: R.colleges },
    { t: 'Trail des coteaux de Loire', s: 'trail-coteaux-de-loire-2026', start: '2026-03-08T08:30:00.000Z', loc: 'Vouvray', cat: 'sport', ex: 'Trois parcours nature à travers les vignobles et les coteaux, du familial au sportif.', rub: R.sport },
    { t: 'Atelier compostage et jardin au naturel', s: 'atelier-compostage-2026', start: '2026-04-05T14:00:00.000Z', end: '2026-04-05T16:30:00.000Z', loc: 'Maison de l’environnement, Tours', cat: 'atelier', ex: 'Apprenez à composter et à jardiner sans pesticides avec les animateurs du Département.', rub: R.environnement },
    { t: 'Conférence : l’eau, ressource de demain', s: 'conference-eau-2026', start: '2026-05-14T18:00:00.000Z', end: '2026-05-14T20:00:00.000Z', loc: 'Amphithéâtre du Département, Tours', cat: 'conference', ex: 'Spécialistes et élus débattent de la gestion de l’eau face au changement climatique.', rub: R.environnement },
    // Juin 2026
    { t: 'Fête de la biodiversité', s: 'fete-de-la-biodiversite', start: '2026-06-06T10:00:00.000Z', end: '2026-06-06T18:00:00.000Z', loc: 'Bléré', cat: 'environnement', ex: 'Une journée festive pour découvrir la faune et la flore de Touraine : balades, ateliers, expositions.', rub: R.environnement },
    { t: 'Festival Terres du Son', s: 'festival-terres-du-son-2026', start: '2026-06-12T16:00:00.000Z', end: '2026-06-14T23:59:00.000Z', loc: 'Domaine de Candé, Monts', cat: 'culture', ex: 'Trois jours de musiques actuelles éco-responsables soutenus par le Département.' },
    { t: 'Rencontres petite enfance', s: 'rencontres-petite-enfance-2026', start: '2026-06-16T09:30:00.000Z', end: '2026-06-16T12:30:00.000Z', loc: 'Maison départementale de la solidarité, Tours', cat: 'famille', ex: 'Échanges entre parents et professionnels de la PMI autour de l’éveil du tout-petit.', rub: R.enfance },
    { t: 'Journée portes ouvertes des collèges', s: 'portes-ouvertes-colleges-2026', start: '2026-06-18T13:30:00.000Z', end: '2026-06-18T17:00:00.000Z', loc: 'Collège Anatole-France', address: '2 rue du Collège, 37000 Tours', geo: [0.6848, 47.3925], cat: 'famille', ex: 'Les familles découvrent les collèges rénovés et leurs projets pédagogiques.', rub: R.colleges, allDay: true },
    { t: 'Fête du Vélo en Touraine', s: 'fete-du-velo-en-touraine', start: '2026-06-21T09:00:00.000Z', end: '2026-06-21T18:00:00.000Z', loc: 'Place Anatole-France', address: 'Place Anatole-France, 37000 Tours', geo: [0.6889, 47.3939], cat: 'sport', ex: 'Boucles cyclables, animations et stands sécurité : enfourchez votre vélo pour la grande fête départementale.', featured: true, rub: R.sport },
    { t: 'Conseil départemental — séance publique', s: 'conseil-departemental-seance', start: '2026-06-29T14:00:00.000Z', end: '2026-06-29T18:00:00.000Z', loc: 'Hôtel du Département', address: 'Place de la Préfecture, 37927 Tours Cedex 9', geo: [0.6929, 47.3915], cat: 'institutionnel', ex: 'Séance publique de l’assemblée départementale. Ordre du jour consultable en ligne.', rub: R.departement, status: 'complet' },
    // Juillet 2026
    { t: 'Concerts d’été dans les jardins', s: 'concerts-ete-jardins-2026', start: '2026-07-04T19:00:00.000Z', end: '2026-07-04T22:00:00.000Z', loc: 'Jardins du Département, Tours', cat: 'culture', ex: 'Soirées musicales gratuites en plein air tout l’été dans les jardins départementaux.', rub: R.culture },
    { t: 'Stage multisports ados', s: 'stage-multisports-ados-2026', start: '2026-07-09T09:00:00.000Z', end: '2026-07-11T17:00:00.000Z', loc: 'Base de loisirs, Savigné-sur-Lathan', cat: 'sport', ex: 'Trois jours d’activités encadrées pour les 12-16 ans : escalade, canoë, VTT.', rub: R.sport },
    { t: 'Guinguettes de Loire', s: 'guinguettes-de-loire-2026', start: '2026-07-19T17:00:00.000Z', end: '2026-07-19T23:00:00.000Z', loc: 'Bords de Loire, Tours', cat: 'famille', ex: 'Bal, restauration locale et animations au bord du fleuve royal.' },
    // Août 2026
    { t: 'Observation des étoiles', s: 'observation-etoiles-2026', start: '2026-08-08T21:30:00.000Z', end: '2026-08-08T23:59:00.000Z', loc: 'Espace naturel sensible, Chinon', cat: 'environnement', ex: 'Nuit des étoiles : observation guidée du ciel d’été sur un espace naturel préservé.', rub: R.environnement },
    { t: 'Marché des producteurs de pays', s: 'marche-producteurs-2026', start: '2026-08-22T17:00:00.000Z', end: '2026-08-22T22:00:00.000Z', loc: 'Amboise', cat: 'autre', ex: 'Producteurs locaux, dégustations et repas champêtre soutenus par le Département.' },
    // Septembre 2026
    { t: 'Forum des associations', s: 'forum-associations-rentree-2026', start: '2026-09-05T10:00:00.000Z', end: '2026-09-05T18:00:00.000Z', loc: 'Tours', cat: 'famille', ex: 'La rentrée des bénévoles : sport, culture, solidarité — trouvez votre association.' },
    { t: 'Journées européennes du patrimoine', s: 'journees-patrimoine-2026', start: '2026-09-19T10:00:00.000Z', end: '2026-09-20T18:00:00.000Z', loc: 'Sites patrimoniaux de Touraine', cat: 'culture', ex: 'Visites exceptionnelles des monuments et archives départementales, gratuites tout le week-end.', featured: true, rub: R.culture },
    { t: 'Semaine bleue des aînés', s: 'semaine-bleue-aines-2026', start: '2026-09-28T09:30:00.000Z', end: '2026-09-28T17:00:00.000Z', loc: 'Maison départementale, Tours', cat: 'conference', ex: 'Ateliers bien-vieillir, prévention et lien social pour les personnes âgées.' },
    // Octobre 2026
    { t: 'Salon du livre jeunesse', s: 'salon-livre-jeunesse-2026', start: '2026-10-10T10:00:00.000Z', end: '2026-10-11T18:00:00.000Z', loc: 'Bibliothèque départementale, Tours', cat: 'culture', ex: 'Auteurs, illustrateurs et ateliers pour donner le goût de lire aux plus jeunes.', rub: R.culture },
    { t: 'Atelier numérique pour les aidants', s: 'atelier-numerique-aidants-2026', start: '2026-10-15T14:00:00.000Z', end: '2026-10-15T16:30:00.000Z', loc: 'Maison de la solidarité, Loches', cat: 'atelier', ex: 'Prise en main des démarches en ligne pour accompagner un proche au quotidien.' },
    { t: 'Conseil départemental — budget', s: 'conseil-departemental-budget-2026', start: '2026-10-23T14:00:00.000Z', end: '2026-10-23T18:00:00.000Z', loc: 'Hôtel du Département, Tours', cat: 'institutionnel', ex: 'Séance consacrée aux orientations budgétaires du Département pour 2027.', rub: R.departement },
    // Novembre 2026
    { t: 'Mois de l’économie sociale et solidaire', s: 'mois-ess-2026', start: '2026-11-07T09:00:00.000Z', end: '2026-11-07T17:00:00.000Z', loc: 'Tours', cat: 'conference', ex: 'Rencontres et tables rondes autour de l’emploi solidaire et de l’insertion.' },
    { t: 'Festival du film documentaire', s: 'festival-documentaire-2026', start: '2026-11-20T18:00:00.000Z', end: '2026-11-22T22:00:00.000Z', loc: 'Cinéma Les Studio, Tours', cat: 'culture', ex: 'Projections et débats sur les grands enjeux de société, en partenariat avec le Département.', rub: R.culture },
    // Décembre 2026
    { t: 'Téléthon en Touraine', s: 'telethon-touraine-2026', start: '2026-12-05T10:00:00.000Z', end: '2026-12-05T20:00:00.000Z', loc: 'Tout le département', cat: 'famille', ex: 'Défis sportifs et animations solidaires dans toutes les communes partenaires.' },
    { t: 'Marché de Noël solidaire', s: 'marche-noel-solidaire-2026', start: '2026-12-13T10:00:00.000Z', end: '2026-12-13T19:00:00.000Z', loc: 'Place Jean-Jaurès, Tours', cat: 'autre', ex: 'Artisanat local et stands d’associations caritatives au cœur de Tours.' },
  ]

  // 3b-bis. Documents PDF réalistes (programme, plan, ordre du jour…) → vrais
  // `media` pour que les blocks `eventDocuments` affichent format + poids.
  const uploadPdf = (title: string, name: string, padKb: number) => {
    const data = makePdf(title, padKb)
    return createAsAdmin({
      collection: 'media',
      data: { alt: title },
      // `size` = poids réel du buffer pour que `media.filesize` soit renseigné
      // (le bloc eventDocuments affiche format + poids).
      file: { data, mimetype: 'application/pdf', name, size: data.length },
    })
  }

  const pdfVeloProgramme = await uploadPdf('Programme de la Fête du Vélo', 'programme-fete-du-velo.pdf', 180)
  const pdfVeloPlan = await uploadPdf('Plan des boucles cyclables', 'plan-boucles-cyclables.pdf', 90)
  const pdfPortesProgramme = await uploadPdf('Programme des portes ouvertes', 'programme-portes-ouvertes.pdf', 120)
  const pdfConseilOrdre = await uploadPdf('Ordre du jour de la séance', 'ordre-du-jour-conseil.pdf', 60)
  const pdfConseilDelib = await uploadPdf('Projets de délibérations', 'projets-deliberations.pdf', 320)

  // Layouts ÉVÉNEMENT (T7) — de vrais blocks d'agenda (jamais du contenu de
  // rubrique générique). Clés = slug de l'événement.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const EVENT_LAYOUTS: Record<string, any[]> = {
    'fete-du-velo-en-touraine': [
      {
        blockType: 'eventRichText',
        title: 'Une journée pour pédaler en Touraine',
        content: richText(
          'La Fête du Vélo revient en Touraine pour une grande journée festive et gratuite, ouverte à toutes et à tous. Familles, sportifs, cyclistes du dimanche : chacun trouve sa boucle, du parcours découverte de 10 km aux circuits sportifs de 60 km le long de la Loire à Vélo.',
          'Au programme : randonnées encadrées, ateliers de réparation, stands de sécurité routière, marquage Bicycode et village des associations. Un événement éco-responsable soutenu par le Département dans le cadre de sa politique mobilités douces.',
        ),
      },
      {
        blockType: 'eventProgramme',
        title: 'Le déroulé de la journée',
        items: [
          { time: '9h00', label: 'Accueil et retrait des dossards', place: 'Village départ — Place Anatole-France' },
          { time: '9h30', label: 'Départ de la boucle famille (10 km)', speaker: 'Encadrée par les clubs cyclos' },
          { time: '10h30', label: 'Départ des parcours sportifs (40 & 60 km)' },
          { time: '12h30', label: 'Pique-nique tiré du sac et concert', place: 'Bords de Loire' },
          { time: '14h00', label: 'Ateliers réparation & marquage Bicycode', speaker: 'La Recyclerie cyclable' },
          { time: '17h30', label: 'Tirage de la tombola et clôture' },
        ],
      },
      {
        blockType: 'eventMedia',
        title: 'En images',
        layout: 'gallery',
        images: [
          { image: categoryMedia.sport, caption: 'Édition précédente — départ de la boucle famille' },
          { image: mediaHero, caption: 'La Loire à Vélo, fil rouge de la journée' },
          { image: categoryMedia.environnement, caption: 'Village des associations' },
        ],
      },
      {
        blockType: 'eventDocuments',
        title: 'À télécharger avant de venir',
        files: [
          { file: pdfVeloProgramme.id, label: 'Programme complet de la journée', docType: 'programme' },
          { file: pdfVeloPlan.id, label: 'Plan des boucles et points de ravitaillement', docType: 'plan' },
        ],
      },
      {
        blockType: 'eventPraticalInfo',
        title: 'Bon à savoir',
        items: [
          { icon: 'briefcase', label: 'Tarif', value: 'Gratuit, sans inscription pour la boucle famille' },
          { icon: 'hand-heart', label: 'Public', value: 'Tout public — enfants accompagnés' },
          { icon: 'accessibility', label: 'Accessibilité', value: 'Village et boucle famille accessibles PMR' },
          { icon: 'map-pinned', label: 'Accès', value: 'Tram ligne A arrêt « Place Choiseul ». Parkings vélos surveillés.' },
        ],
      },
      { blockType: 'eventMap', source: 'fromEvent', zoom: 15 },
      {
        blockType: 'eventCta',
        title: "Vous courez les parcours sportifs ?",
        text: "L'inscription en ligne est obligatoire pour les boucles 40 et 60 km (gratuite, dans la limite des places disponibles).",
        mode: 'inscription',
        buttonLabel: "S'inscrire aux parcours sportifs",
      },
      { blockType: 'eventRelated', mode: 'auto', limit: 3 },
    ],
    'portes-ouvertes-colleges-2026': [
      {
        blockType: 'eventRichText',
        title: 'Découvrez les collèges de Touraine',
        content: richText(
          'Le temps d’un après-midi, les collèges du Département ouvrent leurs portes aux familles et aux futurs élèves de 6e. L’occasion de visiter les établissements rénovés, de rencontrer les équipes éducatives et de découvrir les projets pédagogiques, sportifs et culturels.',
          'Le Département investit chaque année pour la rénovation énergétique, la restauration scolaire de qualité et l’équipement numérique des 53 collèges publics de Touraine.',
        ),
      },
      {
        blockType: 'eventProgramme',
        title: 'Au programme de l’après-midi',
        items: [
          { time: '13h30', label: 'Accueil des familles et visite libre' },
          { time: '14h00', label: 'Présentation des projets pédagogiques', speaker: 'Équipes enseignantes' },
          { time: '15h00', label: 'Démonstration des équipements numériques', place: 'Salle multimédia' },
          { time: '16h00', label: 'Visite de la restauration scolaire et échanges' },
        ],
      },
      {
        blockType: 'eventDocuments',
        title: 'Documents utiles',
        files: [
          { file: pdfPortesProgramme.id, label: 'Programme et liste des collèges participants', docType: 'programme' },
        ],
      },
      {
        blockType: 'eventPraticalInfo',
        title: 'Infos pratiques',
        items: [
          { icon: 'briefcase', label: 'Tarif', value: 'Entrée libre et gratuite' },
          { icon: 'hand-heart', label: 'Public', value: 'Élèves de CM2, futurs 6e et leurs familles' },
          { icon: 'accessibility', label: 'Accessibilité', value: 'Établissements accessibles aux personnes à mobilité réduite' },
        ],
      },
      { blockType: 'eventMap', source: 'fromEvent', zoom: 15 },
      { blockType: 'eventRelated', mode: 'auto', limit: 3 },
    ],
    'conseil-departemental-seance': [
      {
        blockType: 'eventRichText',
        title: 'Séance publique de l’assemblée départementale',
        content: richText(
          'Le Conseil départemental d’Indre-et-Loire se réunit en séance publique à l’Hôtel du Département. Les conseillers départementaux examinent et votent les délibérations qui engagent les politiques publiques du territoire : solidarités, collèges, routes, environnement, culture.',
          'Les séances sont ouvertes au public dans la limite des places disponibles et retransmises en direct sur le site du Département.',
        ),
      },
      {
        blockType: 'eventProgramme',
        title: 'Ordre du jour',
        items: [
          { time: '14h00', label: 'Ouverture de la séance et appel', speaker: 'Madame la Présidente' },
          { time: '14h15', label: 'Adoption du procès-verbal de la séance précédente' },
          { time: '14h30', label: 'Rapports — solidarités et autonomie' },
          { time: '16h00', label: 'Rapports — collèges, mobilités et environnement' },
          { time: '17h30', label: 'Questions diverses et clôture' },
        ],
      },
      {
        blockType: 'eventDocuments',
        title: 'Documents de séance',
        files: [
          { file: pdfConseilOrdre.id, label: 'Ordre du jour détaillé', docType: 'programme' },
          { file: pdfConseilDelib.id, label: 'Projets de délibérations', docType: 'reglement' },
        ],
      },
      {
        blockType: 'eventPraticalInfo',
        title: 'Assister à la séance',
        items: [
          { icon: 'hand-heart', label: 'Public', value: 'Séance publique, accès libre dans la limite des places' },
          { icon: 'accessibility', label: 'Accessibilité', value: 'Hémicycle accessible PMR — boucle magnétique disponible' },
          { icon: 'map-pinned', label: 'Accès', value: 'Tram ligne A arrêt « Préfecture ». Stationnement payant à proximité.' },
        ],
      },
      { blockType: 'eventMap', source: 'fromEvent', zoom: 16 },
      {
        blockType: 'eventCta',
        title: 'Suivre la séance à distance',
        text: 'La séance est retransmise en direct et disponible en replay sur le portail du Département.',
        mode: 'contact',
        url: 'https://www.touraine.fr',
        buttonLabel: 'Voir la retransmission',
      },
      { blockType: 'eventRelated', mode: 'auto', limit: 3 },
    ],
  }

  for (const ev of EVENEMENTS) {
    await createAsAdmin({
      collection: 'evenement',
      data: {
        title: ev.t,
        slug: ev.s,
        startDate: ev.start,
        ...(ev.end ? { endDate: ev.end } : {}),
        location: ev.loc,
        ...(ev.address ? { locationAddress: ev.address } : {}),
        ...(ev.geo ? { geo: ev.geo } : {}),
        ...(ev.status ? { status: ev.status } : {}),
        ...(ev.allDay ? { allDay: ev.allDay } : {}),
        category: ev.cat,
        excerpt: ev.ex,
        image: categoryMedia[ev.cat],
        rubriques: ev.rub ? [R.agendaUne, ev.rub] : [R.agendaUne],
        featured: ev.featured ?? false,
        ...(EVENT_LAYOUTS[ev.s] ? { layout: EVENT_LAYOUTS[ev.s] } : {}),
        _status: 'published',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    })
  }

  // 3c. Articles « démarche » (T4) under Enfance / Sport "Je veux…" nodes ------
  await createAsAdmin({
    collection: 'article',
    overrideAccess: true,
    data: {
      title: "J'attends un enfant",
      slug: 'j-attends-un-enfant-demarche',
      type: 'demarche',
      chapo:
        'Toutes les démarches et accompagnements proposés par le Département pendant la grossesse.',
      rubriques: [R.enfanceAttends],
      steps: [
        {
          title: 'Déclarer votre grossesse',
          richText: richText(
            'Déclarez votre grossesse à votre caisse d’assurance maladie dans les 14 premières semaines.',
          ),
        },
        {
          title: 'Prendre rendez-vous en PMI',
          richText: richText(
            'Les centres de Protection Maternelle et Infantile (PMI) du Département vous accompagnent gratuitement.',
          ),
        },
      ],
      contacts: [
        {
          name: 'Service PMI du Département',
          email: 'pmi@touraine.fr',
          phone: '02 47 00 00 00',
        },
      ],
      _status: 'published',
    },
  })

  await createAsAdmin({
    collection: 'article',
    overrideAccess: true,
    data: {
      title: 'Je veux faire garder mon enfant',
      slug: 'je-veux-faire-garder-mon-enfant-demarche',
      type: 'demarche',
      chapo:
        "Trouver un mode d'accueil adapté : assistantes maternelles, crèches, accueil collectif.",
      rubriques: [R.enfanceGarde],
      steps: [
        {
          title: 'Identifier les modes de garde',
          richText: richText(
            'Le Département recense les assistantes maternelles agréées et les structures d’accueil près de chez vous.',
          ),
        },
      ],
      // Left as draft to demonstrate the validation lifecycle on a non-publish branch.
      _status: 'draft',
    },
  })

  await createAsAdmin({
    collection: 'article',
    overrideAccess: true,
    data: {
      title: 'Je souhaite randonner',
      slug: 'je-souhaite-randonner-demarche',
      type: 'demarche',
      chapo:
        'Plus de 3 000 km de sentiers balisés : préparez votre randonnée en Touraine.',
      rubriques: [R.sportRando],
      steps: [
        {
          title: 'Choisir votre itinéraire',
          richText: richText(
            'Consultez le Plan Départemental des Itinéraires de Promenade et de Randonnée (PDIPR).',
          ),
        },
        {
          title: 'Préparer votre sortie',
          richText: richText('Vérifiez la météo, prévoyez de l’eau et signalez votre parcours.'),
        },
      ],
      _status: 'published',
    },
  })

  // A T3 presentation article under Sport "Missions et démarches".
  await createAsAdmin({
    collection: 'article',
    overrideAccess: true,
    data: {
      title: 'Le sport en Touraine : missions et démarches',
      slug: 'sport-missions-demarches',
      type: 'presentation',
      chapo: 'Le Département soutient le sport pour tous et accompagne les clubs et comités.',
      rubriques: [rid('mes-services-au-quotidien/sport/missions-et-demarches')],
      body: richText(
        'Le Département finance les équipements sportifs, soutient les clubs et développe les pratiques de pleine nature.',
      ),
      _status: 'published',
    },
  })

  // 3d. NB — Les pages éditoriales/cartographiques (T3/T12) des rubriques
  // « Les 19 cantons », « Communes et collectivités » et « Entreprises et
  // associations » ne sont plus créées comme documents `page` distincts : leur
  // contenu est désormais produit par la landing de rubrique pilotée par le
  // catalogue éditorial (data/rubriques-content.ts, appliqué en section 4).

  // 3e. Brève -----------------------------------------------------------------
  await createAsAdmin({
    collection: 'breve',
    overrideAccess: true,
    data: {
      title: 'Nouvelle aire de covoiturage à Bléré',
      slug: 'aire-covoiturage-blere',
      date: '2026-05-25T09:00:00.000Z',
      body: richText('Une nouvelle aire de covoiturage de 30 places ouvre à Bléré.'),
      sourceUrl: 'https://touraine.fr/mobilite',
      rubriques: [R.environnement],
      _status: 'published',
    },
  })

  // 3f. Contact formulaire (Form Builder) + CTA-ready ---------------------------
  const contactForm = await createAsAdmin({
    collection: 'formulaire',
    overrideAccess: true,
    data: {
      title: 'Formulaire de contact',
      submitButtonLabel: 'Envoyer ma demande',
      confirmationType: 'message',
      confirmationMessage: richText(
        'Merci, votre message a bien été envoyé. Le service concerné vous répondra dans les meilleurs délais.',
      ),
      fields: [
        {
          blockType: 'text',
          name: 'nom',
          label: 'Nom et prénom',
          required: true,
          width: 100,
        },
        {
          blockType: 'email',
          name: 'email',
          label: 'Adresse e-mail',
          required: true,
          width: 100,
        },
        {
          blockType: 'select',
          name: 'service',
          label: 'Service concerné',
          required: true,
          width: 100,
          options: [
            { label: 'Enfance et famille', value: 'enfance' },
            { label: 'Sport', value: 'sport' },
            { label: 'Culture', value: 'culture' },
            { label: 'Autre', value: 'autre' },
          ],
        },
        {
          blockType: 'textarea',
          name: 'message',
          label: 'Votre message',
          required: true,
          width: 100,
        },
        {
          blockType: 'checkbox',
          name: 'consentement',
          label: "J'accepte que mes données soient traitées pour répondre à ma demande (RGPD).",
          required: true,
        },
      ],
      emails: [
        {
          emailTo: 'contact@touraine.fr',
          emailFrom: 'no-reply@touraine.fr',
          subject: 'Nouvelle demande de contact — touraine.fr',
        },
      ],
    },
  })

  // 3g. NB — La landing composée de « Mes services au quotidien » (CardGrid des
  // thématiques, NewsList/Agenda filtrés, FAQ, partenaires…) — comme celle de
  // toutes les autres rubriques — est désormais générée à partir du catalogue
  // éditorial en section 4 (buildLandingBlocks). Plus de landing codée en dur ici.

  /* ------------------------------------------------------------------------ */
  /*  3h. SHOWCASE content — one rich example per gabarit (exercises blocks)    */
  /* ------------------------------------------------------------------------ */
  //
  // The Article (T4), Démarche (T5) and Événement (T7) bodies all run through the
  // same `Blocks` engine, so a single block stack proves every renderer works in
  // each of those gabarits.
  const showcaseBody = () => [
    {
      blockType: 'richText',
      content: richDoc(
        heading('h2', 'Un accompagnement de proximité'),
        para(
          txt('Le Département agit '),
          txt('au plus près', FMT.bold),
          txt(' des habitants, dans tous les territoires.'),
        ),
        list('bullet', ['Information et orientation', 'Démarches en ligne', 'Contacts de proximité']),
      ),
    },
    {
      blockType: 'imageText',
      image: mediaHero.id,
      imagePosition: 'right',
      content: richText(
        'Nos équipes vous reçoivent dans les Maisons départementales de la solidarité réparties sur tout le territoire.',
      ),
    },
    {
      blockType: 'faq',
      title: 'Questions fréquentes',
      items: [
        {
          question: 'Qui peut bénéficier de cet accompagnement ?',
          answer: richText('Tous les Tourangeaux, sans condition de ressources pour l’information et l’orientation.'),
        },
      ],
    },
    {
      blockType: 'downloadList',
      title: 'Documents utiles',
      files: [{ file: mediaLogo.id, label: 'Dépliant d’information (PDF)' }],
    },
    {
      blockType: 'relatedLinks',
      title: 'Liens utiles',
      links: [
        { type: 'internal', rubrique: R.enfanceAttends, label: "J'attends un enfant" },
        { type: 'external', url: 'https://www.service-public.fr', label: 'Service-public.fr' },
      ],
    },
    {
      blockType: 'ctaForm',
      title: 'Une question ?',
      description: 'Écrivez-nous, le service vous répondra.',
      formulaire: contactForm.id,
      displayMode: 'inline',
    },
    {
      blockType: 'mapEmbed',
      title: 'Nous situer',
      arcgisItemUrl: 'https://www.arcgis.com/home/item.html?id=showcase',
      displayMode: 'inline-iframe',
    },
  ]

  // (a) Actualité vitrine — featured + date la plus récente ⇒ devient la « à la
  // une » du listing actus, AVEC un visuel de couverture et un corps enrichi.
  await createAsAdmin({
    collection: 'actualite',
    data: {
      title: 'Vitrine : le Département en images',
      slug: 'vitrine-departement-en-images',
      tag: 'Institution',
      date: '2026-05-30T12:00:00.000Z',
      chapo:
        'Une actualité de démonstration avec visuel de couverture, chapô et corps enrichi pour illustrer la page actualité (détail).',
      image: mediaHero.id,
      body: richDoc(
        para(
          txt('Cette actualité de démonstration porte un '),
          txt('visuel de couverture', FMT.bold),
          txt(' et un corps de texte riche (titres, listes, liens).'),
        ),
        heading('h3', 'Au programme'),
        list('number', ['Image de couverture', 'Chapô', 'Corps enrichi', 'Partage social']),
      ),
      seo: { ogImage: mediaHero.id },
      rubriques: [R.toutesLesActus, R.departement],
      featured: true,
      _status: 'published',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
  })

  // (b) Article (présentation, T4) — corps empilant TOUS les blocs disponibles.
  await createAsAdmin({
    collection: 'article',
    data: {
      title: 'Vitrine : article tous blocs',
      slug: 'vitrine-article-tous-blocs',
      type: 'presentation',
      chapo:
        'Article de démonstration : son corps empile RichText, ImageText, FAQ, DownloadList, RelatedLinks, CtaForm et MapEmbed.',
      rubriques: [rid('le-departement/un-departement-en-action')],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: showcaseBody() as any,
      _status: 'published',
    },
  })

  // (c) Fiche démarche (T5) — étapes + pièces (downloads) + contacts + corps blocs.
  await createAsAdmin({
    collection: 'article',
    data: {
      title: 'Vitrine : fiche démarche complète',
      slug: 'vitrine-fiche-demarche',
      type: 'demarche',
      chapo:
        'Fiche démarche de démonstration : étapes numérotées, pièces à fournir, contacts, et corps en blocs (FAQ, CTA).',
      rubriques: [rid('mes-services-au-quotidien/enfance-et-famille/je-veux-adopter-un-enfant')],
      steps: [
        {
          title: 'Vérifier votre éligibilité',
          richText: richText('Prenez connaissance des conditions et constituez votre dossier.'),
        },
        {
          title: 'Déposer votre demande',
          richText: richText('Adressez votre demande au service concerné, en ligne ou par courrier.'),
        },
        {
          title: 'Suivre l’instruction',
          richText: richText('Un agent référent vous accompagne tout au long de l’instruction.'),
        },
      ],
      downloads: [mediaLogo.id],
      contacts: [
        {
          name: 'Service Adoption',
          role: 'Direction Enfance & Famille',
          email: 'adoption@touraine.fr',
          phone: '02 47 00 12 34',
          address: 'Hôtel du Département, 37000 Tours',
        },
      ],
      body: [
        { blockType: 'richText', content: richText('Pour aller plus loin, consultez les ressources ci-dessous.') },
        {
          blockType: 'faq',
          title: 'Questions fréquentes',
          items: [
            {
              question: 'Combien de temps dure la procédure ?',
              answer: richText('La durée varie selon les situations ; votre référent vous informe à chaque étape.'),
            },
          ],
        },
        {
          blockType: 'ctaForm',
          title: 'Besoin d’un renseignement ?',
          description: 'Contactez le service Adoption.',
          formulaire: contactForm.id,
          displayMode: 'button',
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ] as any,
      _status: 'published',
    },
  })

  // (d) Événement (T7) — corps en blocs + lien d'inscription + plage de dates.
  await createAsAdmin({
    collection: 'evenement',
    data: {
      title: 'Vitrine : journée portes ouvertes',
      slug: 'vitrine-portes-ouvertes',
      startDate: '2026-06-18T10:00:00.000Z',
      endDate: '2026-06-18T17:00:00.000Z',
      location: 'Hôtel du Département, Tours',
      category: 'institutionnel',
      registrationUrl: 'https://www.touraine.fr/inscription',
      locationAddress: 'Place de la Préfecture, 37927 Tours Cedex 9',
      geo: [0.6929, 47.3915],
      // Layout événement minimal (la librairie « vitrine » de rubrique n'est plus
      // compatible avec les blocks d'agenda) : description + infos pratiques + carte.
      layout: [
        {
          blockType: 'eventRichText',
          title: 'Une journée pour découvrir le Département',
          content: richText(
            'L’Hôtel du Département ouvre ses portes au public : visites des services, rencontres avec les agents et présentation des grandes politiques départementales.',
          ),
        },
        {
          blockType: 'eventPraticalInfo',
          title: 'Infos pratiques',
          items: [
            { icon: 'briefcase', label: 'Tarif', value: 'Gratuit' },
            { icon: 'map-pinned', label: 'Accès', value: 'Tram ligne A arrêt « Préfecture »' },
          ],
        },
        { blockType: 'eventMap', source: 'fromEvent', zoom: 16 },
        { blockType: 'eventRelated', mode: 'auto', limit: 3 },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ] as any,
      rubriques: [R.agendaUne, R.departement],
      featured: false,
      _status: 'published',
    },
  })

  // (e) Événement PASSÉ — alimente l'onglet « Passés » du listing agenda (T7).
  await createAsAdmin({
    collection: 'evenement',
    data: {
      title: 'Forum des associations 2026',
      slug: 'forum-associations-2026',
      startDate: '2026-03-15T09:00:00.000Z',
      endDate: '2026-03-15T18:00:00.000Z',
      location: 'Tours',
      category: 'famille',
      rubriques: [R.agendaUne],
      featured: false,
      _status: 'published',
    },
  })

  // (f) Page contact (T6) — on dote « Nous contacter » d'un landing portant le
  // formulaire : ContactTemplate rend les blocs `landing` comme zone formulaire.
  await payload.update({
    collection: 'rubriques',
    id: R.contact,
    overrideAccess: true,
    user: adminUser,
    data: {
      _status: 'published',
      landing: [
        {
          blockType: 'ctaForm',
          title: 'Formulaire de contact',
          description:
            'Une question ? Écrivez-nous : le service concerné vous répondra dans les meilleurs délais.',
          formulaire: contactForm.id,
          displayMode: 'inline',
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ] as any,
    },
  })

  /* ------------------------------------------------------------------------ */
  /*  4. CATALOG-DRIVEN landings + SEO for EVERY rubrique                       */
  /* ------------------------------------------------------------------------ */
  //
  // Every rubrique gets a production-ready composed landing (hero + rich content
  // + optional CardGrid of its children + démarche steps + map + FAQ + downloads
  // + liens utiles + CTA) and per-page SEO, authored in data/rubriques-content.ts.
  // Section parents additionally get a CardGrid of their children, and the
  // top-level sections a NewsList + Agenda. The handful of rubriques served by a
  // dedicated, data-driven gabarit (actualités listing, agenda, annuaire MDS,
  // page contact) KEEP that gabarit — they receive SEO only, never a landing.

  // All rubriques (structure only).
  const all = (
    await payload.find({
      collection: 'rubriques',
      depth: 0,
      limit: 0,
      pagination: false,
      overrideAccess: true,
    })
  ).docs

  // Extract a parent id from the nested-docs `parent` edge (id or populated doc).
  const parentIdOf = (r: unknown): number | string | null => {
    const p = (r as { parent?: unknown }).parent
    if (p == null) return null
    if (typeof p === 'object') return (p as { id?: number | string }).id ?? null
    return p as number | string
  }

  // id → slug-path (reverse of rubriqueIdByPath) and parent → ordered children.
  const pathById = new Map<number | string, string>()
  for (const [path, id] of rubriqueIdByPath.entries()) pathById.set(id, path)

  const childrenByParent = new Map<number | string, typeof all>()
  const nonLeafIds = new Set<number | string>()
  for (const r of all) {
    const pid = parentIdOf(r)
    if (pid != null) {
      nonLeafIds.add(pid)
      const arr = childrenByParent.get(pid) ?? []
      arr.push(r)
      childrenByParent.set(pid, arr)
    }
  }
  const orderedChildIds = (id: number | string): number[] =>
    (childrenByParent.get(id) ?? [])
      .slice()
      .sort(
        (a, b) =>
          ((a as { order?: number }).order ?? 0) - ((b as { order?: number }).order ?? 0),
      )
      .map((c) => c.id as number)

  // Rubriques served by a dedicated gabarit (no landing — SEO only).
  const DEDICATED_SEO: Record<string, { metaTitle: string; metaDescription: string }> = {
    'actualites/toutes-les-actus': {
      metaTitle: 'Toutes les actualités du Département de Touraine',
      metaDescription:
        "Retrouvez l'ensemble des actualités du Conseil Départemental d'Indre-et-Loire : solidarités, collèges, routes, culture, environnement et vie du territoire.",
    },
    'actualites/agenda-a-la-une': {
      metaTitle: 'Agenda à la une — Événements en Touraine',
      metaDescription:
        "L'agenda des événements du Département de Touraine : sorties, réunions publiques, manifestations culturelles et sportives à venir en Indre-et-Loire.",
    },
    'acces-direct/maisons-departementales-de-la-solidarite': {
      metaTitle: 'Maisons départementales de la solidarité (MDS) | Touraine',
      metaDescription:
        "Trouvez la Maison départementale de la solidarité la plus proche : accueil, accompagnement social, RSA, enfance et autonomie en Indre-et-Loire.",
    },
  }

  // Rubriques served by a NEW dedicated directory/register gabarit. Their page
  // content comes from static data/*.json (data/elus.json, data/magazine.json,
  // data/actes.json) rendered by the matching template; in Payload we only FORCE
  // the `template` select + layer the catalog SEO — no `landing` blocks are built
  // (they would be bypassed at request time by the dispatcher).
  const DEDICATED_TEMPLATE: Record<string, 'elus' | 'kiosque' | 'actes'> = {
    'le-departement/les-elus-du-departement': 'elus',
    'actualites/touraine-le-mag-et-kiosque': 'kiosque',
    'le-departement/les-actes-administratifs': 'actes',
  }

  // « Nous contacter » keeps its dedicated contact landing (form, set above) — we
  // only layer the catalog SEO on top, never overwrite its landing.
  const KEEP_LANDING = new Set<string>(['nous-contacter'])

  let landingsCreated = 0
  let seoOnly = 0
  const uncovered: string[] = []

  for (const r of all) {
    const id = r.id as number
    const path = pathById.get(id)
    const title = (r as { title?: string }).title ?? ''
    const entry = path ? RUBRIQUE_CONTENT[path] : undefined

    try {
      // Dedicated listing/agenda/annuaire gabarits → SEO only.
      if (path && DEDICATED_SEO[path]) {
        await payload.update({
          collection: 'rubriques',
          id,
          overrideAccess: true,
          user: adminUser,
          data: { _status: 'published', seo: { ...DEDICATED_SEO[path], ogImage: mediaHero.id } },
        })
        seoOnly += 1
        continue
      }

      // NEW dedicated directory/register gabarits (élus, kiosque, actes): force
      // the `template` select + catalog SEO, skip landing-block generation. The
      // rubrique already carries editorial `sections` in the catalog, so this
      // MUST run before the `if (entry)` landing branch below.
      const forcedTemplate = path ? DEDICATED_TEMPLATE[path] : undefined
      if (forcedTemplate) {
        const seo = entry
          ? {
              metaTitle: entry.seo.title,
              metaDescription: entry.seo.description,
              ogImage: mediaHero.id,
            }
          : { ogImage: mediaHero.id }
        await payload.update({
          collection: 'rubriques',
          id,
          overrideAccess: true,
          user: adminUser,
          data: { _status: 'published', template: forcedTemplate, seo },
        })
        seoOnly += 1
        continue
      }

      if (entry) {
        const seo = {
          metaTitle: entry.seo.title,
          metaDescription: entry.seo.description,
          ogImage: mediaHero.id,
        }

        // Contact section keeps its dedicated form landing → SEO only.
        if (path && KEEP_LANDING.has(path)) {
          await payload.update({
            collection: 'rubriques',
            id,
            overrideAccess: true,
            user: adminUser,
            data: { _status: 'published', seo },
          })
          seoOnly += 1
          continue
        }

        const isParent = nonLeafIds.has(id)
        const landing = buildLandingBlocks(entry, {
          title,
          isParent,
          topLevelSection: isParent && parentIdOf(r) == null,
          childrenIds: orderedChildIds(id),
          heroImageId: mediaHero.id,
          mediaLogoId: mediaLogo.id,
          contactFormId: contactForm.id,
        })

        await payload.update({
          collection: 'rubriques',
          id,
          overrideAccess: true,
          user: adminUser,
          data: {
            // Publish the version the front-office reads (resolve uses draft:false).
            _status: 'published',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            landing: landing as any,
            seo,
          },
        })
        landingsCreated += 1
        continue
      }

      // No catalog entry and not dedicated → record it (should not happen: the
      // catalog covers every editorial rubrique of the tree).
      if (path) uncovered.push(path)
    } catch (err) {
      // A single failure must not abort the seed — log and keep going.
      console.error(`Landing/SEO failed for rubrique "${title}" (id ${id}):`, err)
    }
  }

  console.log(
    `\n=== Landings de rubrique générées : ${landingsCreated} | SEO seule (gabarits dédiés) : ${seoOnly} ===`,
  )
  if (uncovered.length > 0) {
    console.warn(`! Rubriques sans contenu catalogue : ${uncovered.join(', ')}`)
  }

  /* ------------------------------------------------------------------------ */
  /*  GLOBALS — header & footer (CMS-configurable chrome)                      */
  /* ------------------------------------------------------------------------ */

  // Seed the `header`/`footer` globals from the existing data/*.json so the
  // admin starts populated and editable. Links are seeded as `custom` URLs
  // (the same hrefs the JSON fallback used); editors can switch any of them to
  // a rubrique relationship afterwards. The wide "Mes services" menu is seeded
  // as a méga-menu (two columns) to exercise that mode end-to-end.
  type JsonLink = { label: string; href: string }
  const customLink = (l: JsonLink) => ({ type: 'custom' as const, label: l.label, url: l.href })
  const splitColumns = (links: JsonLink[], parts: number) => {
    const size = Math.ceil(links.length / parts)
    return Array.from({ length: parts }, (_, i) => ({
      links: links.slice(i * size, (i + 1) * size).map(customLink),
    })).filter((c) => c.links.length > 0)
  }

  await payload.updateGlobal({
    slug: 'header',
    overrideAccess: true,
    data: {
      topbar: {
        intro: topbarJson.intro,
        links: topbarJson.links.map(customLink),
        privateSpace: customLink(topbarJson.privateSpace),
      },
      primaryNav: navigationJson.map((item) => {
        const sub = item.sub ?? []
        const menuType: 'direct' | 'dropdown' | 'mega' = item.wide
          ? 'mega'
          : sub.length > 0
            ? 'dropdown'
            : 'direct'
        return {
          menuType,
          type: 'custom' as const,
          label: item.label,
          url: item.href,
          sublinks: menuType === 'dropdown' ? sub.map(customLink) : [],
          columns: menuType === 'mega' ? splitColumns(sub, 2) : [],
        }
      }),
      search: { enabled: true, placeholder: 'Rechercher…', action: '/recherche' },
    },
  })

  await payload.updateGlobal({
    slug: 'footer',
    overrideAccess: true,
    data: {
      newsletter: newsletterJson,
      contact: footerJson.contact,
      socials: footerJson.socials.map((s) => ({
        network: s.icon as 'facebook' | 'instagram' | 'linkedin' | 'youtube',
        url: s.href,
      })),
      columns: footerJson.columns.map((c) => ({
        heading: c.heading,
        links: c.links.map(customLink),
      })),
      legalLinks: footerJson.legalLinks.map(customLink),
      copyright: footerJson.copyright,
    },
  })

  console.log('\n=== Globals « header » et « footer » initialisés ===')

  /* ------------------------------------------------------------------------ */
  /*  Report                                                                   */
  /* ------------------------------------------------------------------------ */

  const counts: Record<string, number> = {}
  for (const collection of [
    'rubriques',
    'groupes',
    'users',
    'actualite',
    'evenement',
    'article',
    'page',
    'breve',
    'formulaire',
  ] as const) {
    const res = await payload.count({ collection, overrideAccess: true })
    counts[collection] = res.totalDocs
  }

  // Cross-check the rubrique tree count.
  counts.rubriques = Math.max(counts.rubriques, rubriqueCount)

  console.log('\n=== Seed terminé — décompte par collection ===')
  console.table(counts)

  console.log('\n=== Comptes de démonstration (mot de passe dev partagé) ===')
  console.table([
    {
      email: admin.email,
      role: 'administrateur-principal',
      groupe: 'Administration (racine)',
      password: DEV_PASSWORD,
    },
    {
      email: sportUser.email,
      role: 'contributeur',
      groupe: 'Rédaction Sport (canPublish=true → autonome)',
      password: DEV_PASSWORD,
    },
    {
      email: enfanceUser.email,
      role: 'contributeur',
      groupe: 'Rédaction Enfance & famille (canPublish=false → validation)',
      password: DEV_PASSWORD,
    },
    {
      email: valideurUser.email,
      role: 'validateur',
      groupe: 'Validation Enfance & famille (publie la branche Enfance)',
      password: DEV_PASSWORD,
    },
  ])
}

// `payload run` awaits the module's top-level promise, so we MUST await here.
// A floating `run().catch(...)` would let the runner exit before the async work
// finishes (observed: process exits 0 with no rows written). Top-level await
// keeps the runner alive until the seed completes.
try {
  await run()
} catch (err) {
  console.error('Seed failed:', err)
  process.exit(1)
}
