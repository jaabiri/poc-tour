import { getPayload } from 'payload'
import config from '../payload.config'
const payload = await getPayload({ config })
const { docs } = await payload.find({ collection: 'evenement', where: { slug: { equals: 'fete-de-la-biodiversite' } }, depth: 1, limit: 1 })
const ev = docs[0]
const img = ev?.image
console.log('image:', typeof img === 'object' && img ? { filename: img.filename, url: img.url } : img)
process.exit(0)
