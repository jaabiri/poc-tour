import { getPayload } from 'payload'
import config from '../payload.config'

const payload = await getPayload({ config })
const { docs } = await payload.find({
  collection: 'evenement',
  where: { slug: { equals: 'fete-du-velo-en-touraine' } },
  depth: 2,
  limit: 1,
})
const ev = docs[0]
for (const block of ev?.layout ?? []) {
  if (block.blockType === 'eventDocuments') {
    for (const f of block.files ?? []) {
      const m = typeof f.file === 'object' ? f.file : null
      console.log({ label: f.label, docType: f.docType, filename: m?.filename, filesize: m?.filesize })
    }
  }
}
process.exit(0)
