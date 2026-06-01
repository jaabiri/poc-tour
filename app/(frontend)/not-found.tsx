import { Topbar, SiteHeader, SiteFooter } from '@/components/layout'
import { Container, SectionLabel, Icon, ArrowLink } from '@/components/ui'
import { getHeader, getFooter } from '@/lib/globals'

/**
 * 404 — front-office not-found page.
 *
 * Rendered whenever a route calls `notFound()` (e.g. the catch-all rubrique
 * resolver finds no visible match) or a path has no handler. Carries the full
 * site chrome plus a recovery path: a search form and a few useful links.
 */

const USEFUL_LINKS: { href: string; label: string }[] = [
  { href: '/', label: 'Accueil' },
  { href: '/plan-du-site', label: 'Plan du site' },
]

export default async function NotFound() {
  const [header, { footer, newsletter }] = await Promise.all([
    getHeader(),
    getFooter(),
  ])
  return (
    <>
      <Topbar data={header.topbar} />
      <SiteHeader nav={header.nav} search={header.search} privateSpace={header.topbar.privateSpace} />
      <main>
        <Container className="py-16">
          <SectionLabel>Erreur 404</SectionLabel>
          <h1 className="font-display text-brand-primary-dark mt-2.5 text-4xl font-bold leading-tight">
            Page introuvable
          </h1>
          <p className="text-text-muted mt-4 max-w-2xl leading-relaxed">
            La page que vous recherchez n’existe pas ou a été déplacée. Vous
            pouvez lancer une recherche ou rejoindre l’une des pages utiles
            ci-dessous.
          </p>

          <form method="get" action="/recherche" role="search" className="mt-8 flex max-w-2xl gap-3">
            <label htmlFor="q" className="sr-only">
              Rechercher sur le site
            </label>
            <input
              id="q"
              name="q"
              type="search"
              placeholder="Rechercher…"
              className="bg-surface-main border-border-main text-text-primary placeholder:text-text-muted focus:border-action min-w-0 flex-1 rounded-md border px-4 py-3 text-base outline-none transition-colors"
            />
            <button
              type="submit"
              className="bg-action text-text-inverse hover:bg-action-hover inline-flex items-center gap-2 rounded-md px-6 py-3 text-base font-semibold transition-colors"
            >
              <Icon name="search" size={18} />
              Rechercher
            </button>
          </form>

          <nav aria-label="Liens utiles" className="mt-10">
            <SectionLabel>Liens utiles</SectionLabel>
            <ul className="mt-5 flex flex-col gap-2">
              {USEFUL_LINKS.map((link) => (
                <li key={link.href}>
                  <span className="inline-block">
                    <ArrowLink href={link.href} iconSize={16} groupTriggered={false}>
                      {link.label}
                    </ArrowLink>
                  </span>
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      </main>
      <SiteFooter footer={footer} newsletter={newsletter} />
    </>
  )
}
