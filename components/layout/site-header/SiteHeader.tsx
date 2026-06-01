"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container, Icon } from "@/components/ui";
import { BrandLogo } from "@/components/shared/brand-logo";
import type { HeaderSearchConfig, NavItem, NavLink as NavLinkData } from "@/types/content";
import { isInternalHref } from "@/lib/href";

function NavLink({
  href,
  className,
  children,
  current,
  ...rest
}: {
  href: string;
  className: string;
  children: ReactNode;
  current?: boolean;
}) {
  const ariaCurrent = current ? ("page" as const) : undefined;
  if (isInternalHref(href)) {
    return (
      <Link href={href} className={className} aria-current={ariaCurrent} {...rest}>
        {children}
      </Link>
    );
  }
  const isExternal = href?.startsWith("http");
  return (
    <a
      href={href}
      className={className}
      aria-current={ariaCurrent}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...rest}
    >
      {children}
    </a>
  );
}

/** Champ de recherche global (présent sur chaque page — exigence CCTP). */
function HeaderSearch({
  id,
  action,
  placeholder,
}: {
  id: string;
  action: string;
  placeholder: string;
}) {
  return (
    <form action={action} role="search" className="relative hidden xl:block">
      <label htmlFor={id} className="sr-only">
        Rechercher sur le site du Département
      </label>
      <Icon
        name="search"
        size={18}
        className="text-icon-muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
      />
      <input
        id={id}
        name="q"
        type="search"
        placeholder={placeholder}
        className="border-border-main bg-surface-page focus-visible:border-brand-primary min-h-touch w-56 rounded-pill border pl-9 pr-4 text-sm outline-none transition-colors"
      />
    </form>
  );
}

export function SiteHeader({
  nav,
  search,
  privateSpace,
}: {
  nav: NavItem[];
  search: HeaderSearchConfig;
  privateSpace: NavLinkData;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSub, setMobileSub] = useState<number | null>(null);

  const menuId = useId();
  const searchId = useId();
  const navRef = useRef<HTMLElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  const isActive = (href: string) =>
    href !== "/" && (pathname === href || pathname.startsWith(href + "/"));

  // External system (window scroll) → legitimately an Effect.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close desktop dropdowns on Escape / click outside.
  useEffect(() => {
    if (openMenu === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenu(null);
    };
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [openMenu]);

  // Mobile drawer: Escape closes + return focus; focus first item on open; trap focus.
  useEffect(() => {
    if (!mobileOpen) return;
    const drawer = drawerRef.current;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        return;
      }
      if (e.key === "Tab" && drawer) {
        const focusable = drawer.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    const trigger = hamburgerRef.current;
    document.addEventListener("keydown", onKey);
    drawer?.querySelector<HTMLElement>("a, button")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={`bg-surface-main border-border-main sticky top-0 z-50 border-b transition-shadow duration-300 ${
          scrolled ? "shadow-header" : ""
        }`}
      >
        <Container>
          <div className="flex min-h-header items-center gap-6">
            <BrandLogo height={56} />

            {/* Desktop navigation */}
            <nav
              ref={navRef}
              aria-label="Navigation principale"
              className="ml-1 hidden gap-0.5 lg:flex"
            >
              {nav.map((item, i) => {
                const active = isActive(item.href);

                // Direct link — no dropdown panel, just a top-level link.
                if (item.menuType === "direct") {
                  return (
                    <NavLink
                      key={item.label}
                      href={item.href}
                      current={active}
                      className="text-text-primary hover:text-brand-primary aria-[current=page]:text-brand-primary flex min-h-touch items-center rounded-md px-3.5 text-sm font-medium no-underline transition-colors"
                    >
                      {item.label}
                    </NavLink>
                  );
                }

                const expanded = openMenu === i;
                return (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => setOpenMenu(i)}
                    onMouseLeave={() => setOpenMenu(null)}
                  >
                    <button
                      type="button"
                      aria-haspopup="true"
                      aria-expanded={expanded}
                      aria-controls={`${menuId}-${i}`}
                      onClick={() => setOpenMenu(expanded ? null : i)}
                      className={`flex min-h-touch items-center gap-1.5 rounded-md px-3.5 text-sm font-medium transition-colors ${
                        expanded || active
                          ? "text-brand-primary"
                          : "text-text-primary"
                      }`}
                    >
                      {item.label}
                      <Icon
                        name="chevron-down"
                        size={14}
                        className={`transition-transform duration-200 ${
                          expanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {item.menuType === "mega" ? (
                      <div
                        id={`${menuId}-${i}`}
                        hidden={!expanded}
                        className="bg-surface-main border-border-main shadow-dropdown absolute left-0 top-full z-[60] mt-1 grid w-menu-wide gap-x-6 gap-y-1 rounded-lg border p-4"
                        style={{
                          gridTemplateColumns: `repeat(${Math.min(item.columns.length || 1, 4)}, minmax(0, 1fr))`,
                        }}
                      >
                        {item.columns.map((col) => (
                          <div key={col.heading ?? col.links[0]?.label}>
                            {col.heading ? (
                              <p className="text-brand-primary-dark mb-1 px-3 text-xs font-bold uppercase tracking-wide">
                                {col.heading}
                              </p>
                            ) : null}
                            {col.links.map((sub) => (
                              <NavLink
                                key={sub.label}
                                href={sub.href}
                                current={isActive(sub.href)}
                                className="text-text-primary hover:bg-surface-page aria-[current=page]:text-brand-primary flex min-h-touch items-center rounded-md px-3 text-sm no-underline transition-colors"
                              >
                                {sub.label}
                              </NavLink>
                            ))}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div
                        id={`${menuId}-${i}`}
                        hidden={!expanded}
                        className={`bg-surface-main border-border-main shadow-dropdown absolute left-0 top-full z-[60] mt-1 grid gap-0.5 rounded-lg border p-3.5 ${
                          item.wide
                            ? "w-menu-wide grid-cols-2"
                            : "w-menu grid-cols-1"
                        }`}
                      >
                        {item.sub.map((sub) => (
                          <NavLink
                            key={sub.label}
                            href={sub.href}
                            current={isActive(sub.href)}
                            className="text-text-primary hover:bg-surface-page aria-[current=page]:text-brand-primary flex min-h-touch items-center justify-between rounded-md px-3 text-sm no-underline transition-colors"
                          >
                            {sub.label}
                            <Icon
                              name="arrow-up-right"
                              size={14}
                              className="text-icon-muted"
                            />
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Right-hand actions */}
            <div className="ml-auto flex items-center gap-2.5">
              {search.enabled ? (
                <HeaderSearch
                  id={searchId}
                  action={search.action}
                  placeholder={search.placeholder}
                />
              ) : null}
              <NavLink
                href={privateSpace.href}
                className="text-brand-primary hover:bg-surface-page hidden min-h-touch items-center gap-1.5 rounded-pill px-3 text-sm font-semibold no-underline transition-colors lg:inline-flex"
              >
                <Icon name="lock" size={15} /> {privateSpace.label}
              </NavLink>
              <button
                type="button"
                ref={hamburgerRef}
                aria-label="Ouvrir le menu"
                aria-expanded={mobileOpen}
                aria-haspopup="dialog"
                onClick={() => setMobileOpen(true)}
                className="bg-brand-primary grid size-touch place-items-center rounded-md lg:hidden"
              >
                <Icon name="menu" size={22} className="text-text-inverse" />
              </button>
            </div>
          </div>
        </Container>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="bg-brand-primary-dark/50 fixed inset-0 z-[100]"
          onClick={() => setMobileOpen(false)}
        >
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu principal"
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-main absolute right-0 top-0 bottom-0 w-[min(22rem,88vw)] overflow-y-auto p-5"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="font-display text-brand-primary-dark font-bold">
                Menu
              </span>
              <button
                type="button"
                aria-label="Fermer le menu"
                onClick={() => setMobileOpen(false)}
                className="grid size-touch place-items-center rounded-md"
              >
                <Icon name="close" size={26} />
              </button>
            </div>

            {/* Mobile search */}
            {search.enabled ? (
              <form action={search.action} role="search" className="relative mb-4">
                <label htmlFor="mobile-search" className="sr-only">
                  Rechercher sur le site du Département
                </label>
                <Icon
                  name="search"
                  size={18}
                  className="text-icon-muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                />
                <input
                  id="mobile-search"
                  name="q"
                  type="search"
                  placeholder={search.placeholder}
                  className="border-border-main bg-surface-page min-h-touch w-full rounded-pill border pl-9 pr-4 text-sm outline-none"
                />
              </form>
            ) : null}

            {nav.map((item, i) => {
              // Direct link — flat row, no expand toggle.
              if (item.menuType === "direct") {
                return (
                  <div key={item.label} className="border-border-main border-b">
                    <NavLink
                      href={item.href}
                      current={isActive(item.href)}
                      className="font-display text-brand-primary-dark aria-[current=page]:text-brand-primary flex min-h-touch w-full items-center py-1 text-base font-semibold no-underline"
                    >
                      {item.label}
                    </NavLink>
                  </div>
                );
              }
              // Dropdown sub-links, or mega columns flattened into one list.
              const items: NavLinkData[] =
                item.menuType === "mega"
                  ? item.columns.flatMap((c) => c.links)
                  : item.sub;
              return (
                <div key={item.label} className="border-border-main border-b">
                  <button
                    type="button"
                    aria-expanded={mobileSub === i}
                    onClick={() => setMobileSub(mobileSub === i ? null : i)}
                    className="font-display text-brand-primary-dark flex min-h-touch w-full items-center justify-between py-1 text-base font-semibold"
                  >
                    {item.label}
                    <Icon
                      name="chevron-down"
                      size={18}
                      className={`transition-transform duration-200 ${
                        mobileSub === i ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {mobileSub === i && (
                    <div className="pb-2.5">
                      {items.map((sub) => (
                        <NavLink
                          key={sub.label}
                          href={sub.href}
                          current={isActive(sub.href)}
                          className="text-text-muted aria-[current=page]:text-brand-primary flex min-h-touch items-center py-1 pl-3 text-sm no-underline"
                        >
                          {sub.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <NavLink
              href={privateSpace.href}
              className="text-action flex min-h-touch items-center gap-2 py-2 font-semibold no-underline"
            >
              <Icon name="lock" size={16} /> {privateSpace.label}
            </NavLink>
          </div>
        </div>
      )}
    </>
  );
}
