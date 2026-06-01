import Image from 'next/image'

import { Container } from '@/components/ui'
import { Breadcrumb } from '@/components/shared/breadcrumb'
import type { Rubrique } from '@/payload-types'

/**
 * RubriqueHero — the section masthead shared by every rubrique gabarit.
 *
 * Pattern (inspired by maine-et-loire.fr): a wide visual band (the rubrique
 * image, or the deep-brand "aplat de charte" as a fallback) with a LIGHT CARD
 * overlapping its lower edge. The card carries the fil d'Ariane (dark tone), the
 * Fraunces title and the short intro — so the heading text always sits on a white
 * surface (AA contrast guaranteed regardless of the image), the rainbow filet
 * tops the card as the brand accent, and the visual stays vivid behind it.
 *
 * The breadcrumb is rendered from data here (not passed as a node) so the hero
 * owns its tone. Presentation-only and data-driven.
 */

type Crumb = NonNullable<Rubrique['breadcrumbs']>[number]

interface RubriqueHeroProps {
  title: string
  intro?: string | null
  image?: { url: string; alt: string } | null
  /** Fil d'Ariane data; rendered (dark tone) inside the light card when present. */
  breadcrumbs?: Crumb[]
  /** Fallback label for the last crumb / the page title. */
  currentTitle?: string
  /** Optional actions (e.g. hero-block CTAs) rendered under the intro. */
  children?: React.ReactNode
}

export function RubriqueHero({
  title,
  intro,
  image,
  breadcrumbs,
  currentTitle,
  children,
}: RubriqueHeroProps) {
  const hasCrumbs = (breadcrumbs?.length ?? 0) > 0
  return (
    <section className="relative">
      {/* Bande visuelle : image de la rubrique, sinon aplat de marque. */}
      <div className="relative h-48 w-full overflow-hidden sm:h-60 md:h-72 lg:h-80">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <span aria-hidden="true" className="bg-surface-brand absolute inset-0" />
        )}
        {/* Voile dégradé léger en bas pour la profondeur sous la carte. */}
        <span
          aria-hidden="true"
          className="from-brand-primary-dark/35 absolute inset-0 bg-gradient-to-t to-transparent"
        />
      </div>

      {/* Carte claire chevauchant le bas du visuel. */}
      <Container>
        <div className="relative z-10 mx-auto -mt-14 max-w-4xl sm:-mt-16 md:-mt-24">
          <div className="bg-surface-main border-border-main overflow-hidden rounded-2xl border shadow-card">
            {/* Filet rainbow — accent de charte en tête de carte. */}
            <span aria-hidden="true" className="filet-rainbow block" />
            <div className="px-6 py-7 md:px-10 md:py-9">
              {hasCrumbs ? (
                <div className="mb-5">
                  <Breadcrumb
                    crumbs={breadcrumbs!}
                    currentTitle={currentTitle ?? title}
                    tone="default"
                  />
                </div>
              ) : null}
              <h1 className="font-display text-brand-primary-dark text-center text-3xl font-black leading-tight md:text-4xl lg:text-5xl">
                {title}
              </h1>
              {intro ? (
                <p className="text-text-muted mx-auto mt-4 max-w-2xl text-center text-base leading-relaxed md:text-lg">
                  {intro}
                </p>
              ) : null}
              {children ? (
                <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>
              ) : null}
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}

export default RubriqueHero
