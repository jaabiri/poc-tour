/**
 * update-event-images.ts — give every événement a distinct, real-looking photo.
 *
 * Run with:  pnpm payload run ./scripts/update-event-images.ts
 *
 * For each event we download a deterministic real photograph from Lorem Picsum
 * (seeded by the event slug → stable across re-runs, unique per event), upload it
 * to the `media` collection, and point `evenement.image` at it. A category-tinted
 * generated banner is used as a fallback if the network is unavailable, so the
 * script never leaves an event without a visual. Idempotent: re-running just
 * re-points images (old media rows are harmless).
 *
 * This is a demo convenience over the main seed (which now also fetches real
 * photos); it lets us refresh visuals WITHOUT wiping the whole database.
 */

import { getPayload } from 'payload'
import sharp from 'sharp'

import config from '../payload.config'
import type { Evenement } from '../payload-types'

/* --- on-brand fallback banner (only used if a photo download fails) --------- */
type RGB = [number, number, number]
const hexToRgb = (hex: string): RGB => {
  const n = parseInt(hex.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
const BLUE900 = hexToRgb('#003D5C')
const mix = (a: RGB, b: RGB, t: number): RGB => [
  Math.round(a[0] + (b[0] - a[0]) * t),
  Math.round(a[1] + (b[1] - a[1]) * t),
  Math.round(a[2] + (b[2] - a[2]) * t),
]
const fallbackBanner = async (accentHex: string): Promise<Buffer> => {
  const W = 1200,
    H = 675
  const accent = hexToRgb(accentHex)
  const buf = Buffer.alloc(W * H * 3)
  for (let y = 0; y < H; y += 1) {
    const base = mix(BLUE900, accent, (y / H) ** 1.35)
    for (let x = 0; x < W; x += 1) {
      const i = (y * W + x) * 3
      buf[i] = base[0]
      buf[i + 1] = base[1]
      buf[i + 2] = base[2]
    }
  }
  return sharp(buf, { raw: { width: W, height: H, channels: 3 } }).jpeg({ quality: 82 }).toBuffer()
}

const CATEGORY_FALLBACK: Record<string, string> = {
  culture: '#D9533B',
  sport: '#0AA6B8',
  famille: '#E8A23A',
  environnement: '#8FB02E',
  institutionnel: '#006090',
  conference: '#0A77A8',
  atelier: '#E8853A',
  autre: '#005380',
}

/** Download a deterministic real photo for an event; null on any failure. */
const fetchPhoto = async (slug: string): Promise<Buffer | null> => {
  try {
    const res = await fetch(`https://picsum.photos/seed/touraine-${slug}/1200/675`, {
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) return null
    const buf = Buffer.from(await res.arrayBuffer())
    return buf.length > 1000 ? buf : null
  } catch {
    return null
  }
}

const run = async (): Promise<void> => {
  const payload = await getPayload({ config })

  // The Evenement publish hook (beforeChange) requires a user with publish rights
  // on the event's branches — and overrideAccess bypasses ACCESS, not HOOKS. So we
  // act AS the seeded Administrateur principal, exactly like seed.ts does.
  const { docs: admins } = await payload.find({
    collection: 'users',
    where: { email: { equals: 'admin@touraine.fr' } },
    limit: 1,
    overrideAccess: true,
  })
  const admin = admins[0]
  if (!admin) {
    throw new Error("Aucun « admin@touraine.fr » — lancez d'abord `pnpm db:seed`.")
  }
  const adminUser = { ...admin, collection: 'users' as const }

  const { docs } = await payload.find({
    collection: 'evenement',
    depth: 0,
    limit: 0,
    pagination: false,
    overrideAccess: true,
  })
  const events = docs as Evenement[]
  console.log(`\n${events.length} événements à illustrer…\n`)

  let real = 0
  let fallback = 0

  for (const ev of events) {
    const slug = ev.slug ?? String(ev.id)
    const cat = ev.category ?? 'autre'
    let data = await fetchPhoto(slug)
    let source = 'photo réelle'
    if (!data) {
      data = await fallbackBanner(CATEGORY_FALLBACK[cat] ?? CATEGORY_FALLBACK.autre)
      source = 'dégradé (repli hors-ligne)'
      fallback += 1
    } else {
      real += 1
    }

    const media = await payload.create({
      collection: 'media',
      overrideAccess: true,
      user: adminUser,
      data: { alt: `Visuel de l’événement « ${ev.title} »` },
      file: { data, mimetype: 'image/jpeg', name: `evenement-${slug}.jpg`, size: 0 },
    })

    await payload.update({
      collection: 'evenement',
      id: ev.id,
      overrideAccess: true,
      user: adminUser,
      data: { image: media.id },
    })

    console.log(`  ✓ ${ev.title} — ${source}`)
  }

  console.log(`\n=== Terminé : ${real} photos réelles, ${fallback} replis dégradé ===\n`)
}

try {
  await run()
} catch (err) {
  console.error('update-event-images failed:', err)
  process.exit(1)
}
