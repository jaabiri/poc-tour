import { RichText } from '@payloadcms/richtext-lexical/react'

import { Container, SectionLabel, Icon } from '@/components/ui'
import { RubriqueHero } from '@/components/shared/rubrique-hero'
import { Blocks } from '@/components/blocks/BlockRenderer'

import type { Article, Media, Rubrique } from '@/payload-types'

/**
 * DemarcheTemplate — gabarit « Fiche démarche / service » (T5/N3). Sert les
 * articles dont `type === 'demarche'` : une page orientée action (« Je veux… »)
 * structurée pour faire aboutir une démarche.
 *
 * Anatomie : hero service → en-tête (titre + chapô) → corps en blocs (intro,
 * « Pour qui ? », accès en ligne via le bloc `cta-form`, FAQ via `faq`, liens
 * connexes via `relatedLinks`) → les étapes (`steps`) → pièces & documents
 * (`downloads`) → contacts & lieux (`contacts`). Chaque section est
 * conditionnée par sa donnée.
 *
 * Server Component qui ne renvoie QUE le contenu `main` (le filet, le fil
 * d'Ariane et le chrome sont fournis par la route). Mêmes sous-vues / langage
 * visuel que `ArticleTemplate` (étapes, pièces, contacts) pour rester cohérent
 * avec la page de contenu (T4). Tokens sémantiques uniquement (CLAUDE.md §1/§2).
 */

/** Pull a usable URL + alt off a populated (or unpopulated) media relation. */
const mediaSrc = (
  m: (number | null) | Media | undefined,
): { url: string; alt: string; filename: string } | null => {
  if (!m || typeof m !== 'object') return null
  if (!m.url) return null
  return { url: m.url, alt: m.alt ?? '', filename: m.filename ?? '' }
}

/** Section heading shared by the démarche blocks (h2 in the brand voice). */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-brand-primary-dark mb-7 mt-2.5 text-3xl font-bold leading-tight">
      {children}
    </h2>
  )
}

function StepsView({ steps }: { steps: NonNullable<Article['steps']> }) {
  return (
    <Container className="py-10">
      <SectionLabel>Marche à suivre</SectionLabel>
      <SectionHeading>Les étapes de la démarche</SectionHeading>
      <ol className="flex flex-col gap-4">
        {steps.map((step, i) => (
          <li
            key={step.id ?? `${step.title}-${i}`}
            className="bg-surface-main border-border-main flex gap-4 rounded-xl border p-6"
          >
            <span
              aria-hidden="true"
              className="bg-surface-brand text-text-inverse flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold"
            >
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-brand-primary-dark mb-2 text-lg font-bold">
                <span className="sr-only">Étape {i + 1} : </span>
                {step.title}
              </h3>
              <div className="prose-touraine text-text-primary text-sm leading-relaxed">
                <RichText data={step.richText} />
              </div>
            </div>
          </li>
        ))}
      </ol>
    </Container>
  )
}

function DownloadsView({
  downloads,
}: {
  downloads: NonNullable<Article['downloads']>
}) {
  const files = downloads
    .map((d) => mediaSrc(d))
    .filter((f): f is NonNullable<ReturnType<typeof mediaSrc>> => f !== null)
  if (files.length === 0) return null
  return (
    <Container className="py-10">
      <SectionLabel>À préparer</SectionLabel>
      <SectionHeading>Pièces à fournir et documents</SectionHeading>
      <ul className="flex flex-col gap-2">
        {files.map((f, i) => (
          <li key={`${f.url}-${i}`}>
            <a
              href={f.url}
              download
              className="bg-surface-main border-border-main text-brand-primary-dark hover:shadow-card-sm flex items-center gap-3 rounded-lg border p-4 no-underline transition-shadow"
            >
              <Icon name="file-text" size={20} />
              <span className="text-sm font-semibold">
                {f.alt || f.filename || 'Fichier'}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </Container>
  )
}

function ContactsView({
  contacts,
}: {
  contacts: NonNullable<Article['contacts']>
}) {
  return (
    <Container className="py-10">
      <SectionLabel>Besoin d&apos;aide ?</SectionLabel>
      <SectionHeading>Contacts &amp; lieux</SectionHeading>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {contacts.map((c, i) => (
          <div
            key={c.id ?? `${c.name}-${i}`}
            className="bg-surface-main border-border-main rounded-xl border p-6"
          >
            <h3 className="text-brand-primary-dark text-lg font-bold">{c.name}</h3>
            {c.role ? (
              <p className="text-text-muted mt-1 text-sm font-semibold">{c.role}</p>
            ) : null}
            <dl className="mt-4 flex flex-col gap-2 text-sm">
              {c.address ? (
                <div className="flex items-start gap-2">
                  <dt className="text-icon-muted shrink-0">
                    <Icon name="map-pin" size={16} />
                    <span className="sr-only">Adresse</span>
                  </dt>
                  <dd className="text-text-primary whitespace-pre-line">
                    {c.address}
                  </dd>
                </div>
              ) : null}
              {c.phone ? (
                <div className="flex items-start gap-2">
                  <dt className="text-icon-muted shrink-0">
                    <Icon name="phone" size={16} />
                    <span className="sr-only">Téléphone</span>
                  </dt>
                  <dd>
                    <a
                      href={`tel:${c.phone.replace(/\s+/g, '')}`}
                      className="text-text-primary no-underline"
                    >
                      {c.phone}
                    </a>
                  </dd>
                </div>
              ) : null}
              {c.email ? (
                <div className="flex items-start gap-2">
                  <dt className="text-icon-muted shrink-0">
                    <Icon name="mail" size={16} />
                    <span className="sr-only">Courriel</span>
                  </dt>
                  <dd className="min-w-0">
                    <a
                      href={`mailto:${c.email}`}
                      className="text-action hover:text-action-hover break-all no-underline"
                    >
                      {c.email}
                    </a>
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>
        ))}
      </div>
    </Container>
  )
}

export function DemarcheTemplate({
  doc,
  rubrique,
}: {
  doc: Article
  rubrique: Rubrique
}) {
  const steps = doc.steps ?? []
  const downloads = doc.downloads ?? []
  const contacts = doc.contacts ?? []

  return (
    <article>
      {/* Hero service : bande de marque portant la rubrique de rattachement. */}
      <RubriqueHero title={rubrique.title} intro={rubrique.seo?.metaDescription} />

      <Container className="pt-10">
        <header className="max-w-3xl">
          <SectionLabel>Démarche</SectionLabel>
          <h1 className="font-display text-brand-primary-dark mt-2.5 text-4xl font-black leading-tight md:text-5xl">
            {doc.title}
          </h1>
          {doc.chapo ? (
            <p className="text-text-muted mt-5 text-lg leading-relaxed">
              {doc.chapo}
            </p>
          ) : null}
        </header>
      </Container>

      {/* Corps : intro / « Pour qui ? » / accès en ligne (cta-form) / FAQ /
          liens connexes — composés via la librairie de blocs. */}
      <Blocks blocks={doc.body} rubrique={rubrique} />

      {steps.length > 0 ? <StepsView steps={steps} /> : null}
      {downloads.length > 0 ? <DownloadsView downloads={downloads} /> : null}
      {contacts.length > 0 ? <ContactsView contacts={contacts} /> : null}
    </article>
  )
}

export default DemarcheTemplate
