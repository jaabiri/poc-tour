import { notFound } from 'next/navigation'

import { getPayloadClient } from '@/lib/payload'
import { getHeader, getFooter } from '@/lib/globals'
import { FormulaireTemplate } from '@/components/templates'
import { Topbar, SiteHeader, SiteFooter } from '@/components/layout'
import type { Formulaire } from '@/payload-types'

type PageProps = {
  params: Promise<{ id: string }>
}

async function loadFormulaire(id: string): Promise<Formulaire | null> {
  const payload = await getPayloadClient()
  try {
    const doc = await payload.findByID({
      collection: 'formulaire',
      id,
      depth: 2,
    })
    return (doc as Formulaire) ?? null
  } catch {
    return null
  }
}

export default async function FormulairePage({ params }: PageProps) {
  const { id } = await params
  const form = await loadFormulaire(id)

  if (!form) {
    notFound()
  }

  const [header, { footer, newsletter }] = await Promise.all([
    getHeader(),
    getFooter(),
  ])

  return (
    <>
      <Topbar data={header.topbar} />
      <SiteHeader nav={header.nav} search={header.search} privateSpace={header.topbar.privateSpace} />
      <main className="bg-surface-page">
        <FormulaireTemplate form={form} />
      </main>
      <SiteFooter footer={footer} newsletter={newsletter} />
    </>
  )
}
