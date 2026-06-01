import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

/**
 * Exit-preview endpoint: disables Next.js draft mode and returns home.
 */
export async function GET(): Promise<Response> {
  const draft = await draftMode()
  draft.disable()

  redirect('/')
}
