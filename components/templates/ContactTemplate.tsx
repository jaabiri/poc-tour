import Link from 'next/link'

import { Container, SectionLabel, Icon } from '@/components/ui'
import { RubriqueHero } from '@/components/shared/rubrique-hero'
import { Blocks } from '@/components/blocks/BlockRenderer'
import footerData from '@/data/footer.json'
import contactData from '@/data/contact.json'
import type { ContactContent, FooterContent } from '@/types/content'

import type { Rubrique } from '@/payload-types'

/**
 * ContactTemplate — gabarit T6 « Page contact » (« Nous contacter »).
 *
 * The dispatcher (`app/(frontend)/[...slug]`) detects the contact rubrique via
 * `isContactRubrique` and renders this instead of the generic
 * RubriqueListingTemplate. Returns ONLY the page's MAIN CONTENT — the filet,
 * breadcrumb and Topbar/SiteHeader/SiteFooter chrome come from the route +
 * layout, per the shared template contract.
 *
 * Data-driven, no CMS schema change:
 *   - coordonnées : réutilise `data/footer.json` (FooterContent.contact) ;
 *   - horaires / carte / intro : `data/contact.json` (ContactContent) ;
 *   - formulaire de contact + contenu complémentaire : les blocs `landing` de la
 *     rubrique (un bloc `ctaForm` pointe vers le formulaire `/formulaire/{id}`) ;
 *   - accessibilité & mentions : liens légaux de `data/footer.json`.
 *
 * Styling: semantic design tokens only (CLAUDE.md §1/§2). Helpers/visual
 * language mirror the other gabarits so the page reads as the same site.
 */

const footer = footerData as FooterContent
const contact = contactData as ContactContent

/**
 * Identify the « Nous contacter » rubrique (URL `/nous-contacter`). Matches on
 * the full breadcrumb path — like `isActualiteIndex` — so a rubrique merely
 * named "nous-contacter" deeper in the tree does not hijack the gabarit.
 */
export function isContactRubrique(rubrique: Rubrique): boolean {
  const segments = (rubrique.breadcrumbs ?? [])
    .map((c) => (c.url ?? '').replace(/^\/+|\/+$/g, ''))
    .filter(Boolean)
  const path = segments[segments.length - 1] ?? rubrique.slug ?? ''
  return path === 'nous-contacter' || path.endsWith('/nous-contacter')
}

/** Section heading shared by the contact blocks (h2 in the brand voice). */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-brand-primary-dark mb-6 mt-2.5 text-3xl font-bold leading-tight">
      {children}
    </h2>
  )
}

export function ContactTemplate({ rubrique }: { rubrique: Rubrique }) {
  const coords = footer.contact
  const telHref = `tel:${coords.phone.replace(/\s+/g, '')}`
  // Keep only the accessibility / legal-notice links (drop « Plan du site », « Contact »).
  const legalInfo = footer.legalLinks.filter((l) =>
    /accessibilit|mentions|donn[ée]es/i.test(l.label),
  )

  return (
    <>
      <RubriqueHero
        title={rubrique.title}
        intro={contact.intro}
        breadcrumbs={rubrique.breadcrumbs ?? []}
        currentTitle={rubrique.title}
      />

      <Container className="py-12">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Coordonnées + horaires */}
          <section aria-labelledby="contact-coordonnees">
            <SectionLabel>
              <span id="contact-coordonnees">Nous joindre</span>
            </SectionLabel>
            <SectionHeading>Coordonnées</SectionHeading>

            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3">
                <span className="text-brand-primary mt-0.5 shrink-0">
                  <Icon name="map-pin" size={20} />
                </span>
                <span className="text-text-primary">
                  <span className="sr-only">Adresse : </span>
                  {coords.address}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-brand-primary mt-0.5 shrink-0">
                  <Icon name="phone" size={20} />
                </span>
                <span className="text-text-primary">
                  <span className="sr-only">Téléphone : </span>
                  <a href={telHref} className="hover:text-action no-underline">
                    {coords.phone}
                  </a>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-brand-primary mt-0.5 shrink-0">
                  <Icon name="mail" size={20} />
                </span>
                <span className="break-all">
                  <span className="sr-only">Courriel : </span>
                  <a
                    href={`mailto:${coords.email}`}
                    className="text-action hover:text-action-hover no-underline"
                  >
                    {coords.email}
                  </a>
                </span>
              </li>
            </ul>

            <h3 className="text-brand-primary-dark mb-3 mt-8 flex items-center gap-2 text-lg font-bold">
              <span className="text-brand-primary">
                <Icon name="calendar" size={18} />
              </span>
              Horaires d&apos;ouverture
            </h3>
            <dl className="divide-border-main border-border-main divide-y rounded-lg border">
              {contact.hours.map((h) => (
                <div
                  key={h.days}
                  className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
                >
                  <dt className="text-text-primary font-medium">{h.days}</dt>
                  <dd className="text-text-muted">{h.time}</dd>
                </div>
              ))}
            </dl>

            {contact.transport ? (
              <p className="text-text-muted mt-4 text-sm leading-relaxed">
                {contact.transport}
              </p>
            ) : null}
          </section>

          {/* Carte */}
          <section aria-labelledby="contact-carte">
            <SectionLabel>
              <span id="contact-carte">Nous trouver</span>
            </SectionLabel>
            <SectionHeading>Plan d&apos;accès</SectionHeading>
            <iframe
              src={contact.map.embedUrl}
              title={`Carte de localisation — ${contact.map.label}`}
              loading="lazy"
              className="border-border-main h-96 w-full rounded-lg border"
            />
            <p className="text-text-muted mt-3 text-sm leading-relaxed">
              {contact.map.label} ·{' '}
              <a
                href={contact.map.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-action hover:text-action-hover no-underline"
              >
                Ouvrir dans OpenStreetMap
              </a>
            </p>
          </section>
        </div>
      </Container>

      {/* Formulaire de contact + contenu complémentaire — composés en blocs
          côté CMS (un bloc `ctaForm` mène au formulaire `/formulaire/{id}`). */}
      <Blocks blocks={rubrique.landing} rubrique={rubrique} />

      {/* Accessibilité & mentions légales */}
      {legalInfo.length > 0 ? (
        <Container className="pb-14">
          <div className="bg-surface-main border-border-main rounded-xl border p-6">
            <SectionLabel>Informations</SectionLabel>
            <h2 className="text-brand-primary-dark mt-2.5 flex items-center gap-2 text-xl font-bold">
              <span className="text-brand-primary">
                <Icon name="accessibility" size={20} />
              </span>
              Accessibilité &amp; mentions légales
            </h2>
            <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
              {legalInfo.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-action hover:text-action-hover text-sm font-semibold no-underline"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      ) : null}
    </>
  )
}

export default ContactTemplate
