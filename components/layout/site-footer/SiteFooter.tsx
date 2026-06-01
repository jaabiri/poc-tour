import type { ReactNode } from "react";
import Link from "next/link";
import { Container, Icon } from "@/components/ui";
import { BrandLogo } from "@/components/shared/brand-logo";
import type { FooterContent, NewsletterContent } from "@/types/content";
import { isInternalHref } from "@/lib/href";

function FooterLink({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: ReactNode;
}) {
  if (isInternalHref(href)) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  const isExternal = href?.startsWith("http");
  return (
    <a
      href={href}
      className={className}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

export function SiteFooter({
  footer: data,
  newsletter: nl,
}: {
  footer: FooterContent;
  newsletter: NewsletterContent;
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-surface-main">
      {/* Filet de charte EN HAUT du footer (accent rainbow ≤6px) */}
      <div className="filet-rainbow" />

      {/* Bandeau Newsletter (présent sur chaque page — exigence CCTP) */}
      <section aria-labelledby="footer-nl" className="bg-surface-brand">
        <Container className="py-10">
          <div className="flex flex-col items-center justify-between gap-5 text-center md:flex-row md:text-left">
            <div className="max-w-xl">
              <h2
                id="footer-nl"
                className="font-display text-text-inverse text-xl font-bold"
              >
                {nl.title}
              </h2>
              <p className="text-text-on-brand mt-1 text-sm">{nl.description}</p>
            </div>
            <form className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
              <label htmlFor="footer-nl-email" className="sr-only">
                {nl.placeholder}
              </label>
              <input
                id="footer-nl-email"
                type="email"
                placeholder={nl.placeholder}
                className="bg-surface-main min-h-touch flex-1 rounded-pill px-5 text-sm outline-none"
              />
              <button
                type="submit"
                className="bg-action text-text-inverse hover:bg-action-hover min-h-touch rounded-pill px-6 font-semibold transition-colors"
              >
                {nl.button}
              </button>
            </form>
          </div>
        </Container>
      </section>

      <Container className="pt-12">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(11rem,1fr))] gap-9">
          {/* Brand + contact column */}
          <div>
            <div className="mb-4">
              <BrandLogo showTagline={false} height={64} />
            </div>
            <address className="text-text-muted text-sm not-italic leading-relaxed">
              <span className="flex gap-2">
                <Icon name="map-pin" size={15} /> {data.contact.address}
              </span>
              <a
                href={`tel:${data.contact.phone.replace(/\s/g, "")}`}
                className="hover:text-action mt-1.5 flex min-h-touch items-center gap-2 no-underline"
              >
                <Icon name="phone" size={15} /> {data.contact.phone}
              </a>
              <a
                href={`mailto:${data.contact.email}`}
                className="hover:text-action flex min-h-touch items-center gap-2 no-underline"
              >
                <Icon name="mail" size={15} /> {data.contact.email}
              </a>
            </address>
            <ul className="mt-4 flex gap-3">
              {data.socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-surface-page border-border-main text-brand-primary hover:text-action grid size-touch place-items-center rounded-md border transition-colors"
                  >
                    <Icon name={social.icon} size={18} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Link columns */}
          {data.columns.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <h2 className="text-brand-primary-dark mb-3 text-sm font-bold">
                {column.heading}
              </h2>
              <ul>
                {column.links.map((link) => (
                  <li key={link.label}>
                    <FooterLink
                      href={link.href}
                      className="text-text-muted hover:text-action flex min-h-9 items-center text-sm no-underline transition-colors"
                    >
                      {link.label}
                    </FooterLink>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Legal bar */}
        <div className="border-border-main text-text-muted mt-10 flex flex-wrap items-center justify-between gap-3 border-t py-5 text-sm">
          <nav aria-label="Liens légaux" className="flex flex-wrap gap-x-5">
            {data.legalLinks.map((link) => (
              <FooterLink
                key={link.label}
                href={link.href}
                className="text-text-muted hover:text-action inline-flex min-h-touch items-center no-underline transition-colors"
              >
                {link.label}
              </FooterLink>
            ))}
          </nav>
          <div>
            © {year} {data.copyright}
          </div>
        </div>
      </Container>
    </footer>
  );
}
