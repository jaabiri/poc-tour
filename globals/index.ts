import type { GlobalConfig } from 'payload'

import { Header } from './Header'
import { Footer } from './Footer'

/**
 * Registered Payload globals (site-wide singletons). Wired into
 * payload.config.ts. Both are public-read / admin-edit and revalidate their own
 * cache tag on save (see each file).
 */
export const globals: GlobalConfig[] = [Header, Footer]

export default globals
