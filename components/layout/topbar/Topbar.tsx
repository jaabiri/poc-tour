import type { ReactNode } from "react";
import Link from "next/link";
import { Container } from "@/components/ui";
import { AccessibilityBar } from "@/components/layout/accessibility-bar";
import type { TopbarContent } from "@/types/content";
import { isInternalHref } from "@/lib/href";

function TopbarLinkItem({
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

/** Barre utilitaire au-dessus du header (bleu profond) + réglages d'accessibilité. */
export function Topbar({ data }: { data: TopbarContent }) {
  return (
    <>
      <div className="filet-rainbow" />
      <div className="bg-brand-primary-dark text-text-inverse text-sm">
        <Container>
          <div className="flex min-h-topbar flex-wrap items-center justify-between gap-x-5 py-1">
            <span className="hidden opacity-90 sm:inline">{data.intro}</span>
            <div className="flex items-center gap-x-4 gap-y-1">
              <nav aria-label="Liens utilitaires" className="hidden items-center gap-4 sm:flex">
                {data.links.map((link) => (
                  <TopbarLinkItem
                    key={link.label}
                    href={link.href}
                    className="inline-flex min-h-touch items-center text-text-inverse/90 no-underline transition-colors hover:text-text-inverse"
                  >
                    {link.label}
                  </TopbarLinkItem>
                ))}
              </nav>
              <AccessibilityBar />
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}
