/**
 * build-rubrique-content.mjs — merge the per-section editorial fragments into a
 * single `data/rubriques-content.json`, consumed by the seed (wrapped with types
 * by data/rubriques-content.ts).
 *
 * Sources: every `scripts/content-raw/*.json` (one object per section, keyed by
 * rubrique slug-path). Edit a fragment then re-run this script to regenerate.
 *
 * Run:  node scripts/build-rubrique-content.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

const root = path.resolve(process.cwd())
const rawDir = path.join(root, 'scripts/content-raw')

const files = readdirSync(rawDir)
  .filter((f) => f.endsWith('.json'))
  .sort()

const merged = {}
let collisions = 0
for (const f of files) {
  const obj = JSON.parse(readFileSync(path.join(rawDir, f), 'utf8'))
  for (const [k, v] of Object.entries(obj)) {
    if (k in merged) {
      collisions += 1
      console.warn(`! duplicate path key (kept first): ${k}`)
      continue
    }
    merged[k] = v
  }
  console.log(`✓ ${f} → ${Object.keys(obj).length} rubriques`)
}

// Sort keys for a stable, diff-friendly output.
const out = {}
for (const k of Object.keys(merged).sort()) out[k] = merged[k]

// Light validation: every internal related[].path must point to a known key.
// (Dangling refs to dedicated-gabarit rubriques — toutes-les-actus, agenda,
// MDS — are expected: they exist in the tree but not in this catalog.)
const KNOWN_OUTSIDE = new Set([
  'actualites/toutes-les-actus',
  'actualites/agenda-a-la-une',
  'acces-direct/maisons-departementales-de-la-solidarite',
])
let danglers = 0
for (const [k, v] of Object.entries(out)) {
  for (const r of v.related ?? []) {
    if (r.path && !(r.path in out) && !KNOWN_OUTSIDE.has(r.path)) {
      danglers += 1
      console.warn(`! ${k}: unknown related path → ${r.path}`)
    }
  }
}

const dest = path.join(root, 'data/rubriques-content.json')
writeFileSync(dest, JSON.stringify(out, null, 2) + '\n', 'utf8')
console.log(`\n=== Merged ${Object.keys(out).length} rubriques → ${dest}`)
console.log(`    collisions: ${collisions} | unexpected dangling refs: ${danglers}`)
