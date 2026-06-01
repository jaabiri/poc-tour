/**
 * add-demo-actus — throwaway, REVERSIBLE demo data for the T3 actualités listing.
 *
 * Adds ~8 published actualités attached to « Actualités › Toutes les actus » so
 * the pagination (PAGE_SIZE = 9) renders a real page 1 + page 2. Every doc gets
 * a `zz-demo-` slug prefix so nothing collides with real content and the set is
 * trivially removable.
 *
 *   pnpm payload run ./scripts/add-demo-actus.ts          # insert
 *   pnpm payload run ./scripts/add-demo-actus.ts --clean  # remove them again
 *
 * NON-DESTRUCTIVE: never truncates, only creates/deletes its own `zz-demo-*`
 * docs. seed.ts is untouched.
 */
import { getPayload } from 'payload'
import config from '../payload.config'

const SLUG_PREFIX = 'zz-demo-'

/** Minimal valid Lexical body (same shape as seed.ts `richText`). */
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
        { type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text, version: 1 },
      ],
    })),
  },
})

// Varied thématiques (extend the filter-chip set) + descending demo dates.
const DEMO = [
  { tag: 'Environnement', title: 'Un plan vélo pour relier les bourgs de Touraine' },
  { tag: 'Solidarités', title: 'Les Maisons de la solidarité élargissent leurs horaires' },
  { tag: 'Mobilité', title: 'Le réseau de cars Rémi dessert dix nouvelles communes' },
  { tag: 'Sport', title: 'Le Département équipe les collèges de nouveaux gymnases' },
  { tag: 'Tourisme', title: 'La Loire à Vélo bat son record de fréquentation' },
  { tag: 'Institution', title: 'Le budget 2026 voté en faveur de la proximité' },
  { tag: 'Logement', title: 'Une aide renforcée à la rénovation énergétique' },
  { tag: 'Insertion et emploi', title: 'Forum de l’emploi : 1 200 offres à pourvoir' },
]

const run = async () => {
  const payload = await getPayload({ config })
  const clean = process.argv.includes('--clean')

  // Publish-rights hooks (enforcePublishRights / canPublishOnBranch) read
  // `req.user`; `overrideAccess` bypasses ACCESS fns but NOT beforeChange HOOKS
  // (see seed.ts). So we run AS the seeded Administrateur principal.
  const { docs: users } = await payload.find({
    collection: 'users',
    where: { email: { equals: 'admin@touraine.fr' } },
    limit: 1,
    overrideAccess: true,
  })
  if (!users[0]) {
    throw new Error('Utilisateur admin@touraine.fr introuvable — lancer le seed d’abord.')
  }
  const adminUser = { ...users[0], collection: 'users' as const }

  // Resolve the « Toutes les actus » rubrique (primary rubrique → front-office URL).
  const { docs: rubriques } = await payload.find({
    collection: 'rubriques',
    where: { slug: { equals: 'toutes-les-actus' } },
    limit: 1,
    overrideAccess: true,
  })
  const rubriqueId = rubriques[0]?.id
  if (!rubriqueId) {
    throw new Error('Rubrique « toutes-les-actus » introuvable — lancer le seed d’abord.')
  }

  if (clean) {
    const res = await payload.delete({
      collection: 'actualite',
      where: { slug: { like: SLUG_PREFIX } },
      overrideAccess: true,
      user: adminUser,
    })
    console.log(`🧹 Supprimé ${res.docs.length} actualité(s) de démo (${SLUG_PREFIX}*)`)
    return
  }

  let created = 0
  for (let i = 0; i < DEMO.length; i++) {
    const item = DEMO[i]
    // Dates strictly descending so the order in the listing is deterministic.
    const day = String(28 - i).padStart(2, '0')
    const slug = `${SLUG_PREFIX}${i + 1}`
    await payload.create({
      collection: 'actualite',
      overrideAccess: true,
      user: adminUser,
      data: {
        title: item.title,
        slug,
        tag: item.tag,
        date: `2026-04-${day}T09:00:00.000Z`,
        chapo: `Démo pagination — actualité ${i + 1} (${item.tag}). À supprimer avec --clean.`,
        body: richText(item.title, 'Contenu de démonstration généré pour valider le gabarit T3.'),
        rubriques: [rubriqueId],
        featured: false,
        _status: 'published',
      },
    })
    created++
  }
  console.log(`✅ Créé ${created} actualité(s) de démo (slugs ${SLUG_PREFIX}1…${SLUG_PREFIX}${created})`)
  console.log(`   Total publié visé : 4 (seed) + ${created} = ${4 + created} → 2 pages.`)
  console.log(`   Nettoyage : pnpm payload run ./scripts/add-demo-actus.ts --clean`)
}

// `payload run` awaits the module's top-level promise (see seed.ts) — a floating
// `run().catch()` lets the runner exit before the writes land (exit 0, no rows).
try {
  await run()
} catch (err) {
  console.error('Demo data failed:', err)
  process.exit(1)
}
