import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'

/**
 * Enable-preview endpoint for Payload Live Preview.
 *
 * Payload's admin LivePreview iframe (and the "preview" button) points its
 * documents at this route with:
 *   - `secret`: must match process.env.PREVIEW_SECRET
 *   - `path`:   the front-office path to render in draft mode
 *
 * On success it enables Next.js draft mode (sets the bypass cookie) and
 * redirects to the requested front-office path, which will then be rendered
 * with `draft: true` data.
 */
export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  const path = searchParams.get('path')

  if (!process.env.PREVIEW_SECRET || secret !== process.env.PREVIEW_SECRET) {
    return new Response('Invalid token', { status: 401 })
  }

  // Only allow same-origin, absolute-path redirects to avoid open-redirect.
  if (!path || !path.startsWith('/')) {
    return new Response('Invalid path', { status: 400 })
  }

  const draft = await draftMode()
  draft.enable()

  redirect(path)
}
