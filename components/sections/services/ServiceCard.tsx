import Link from "next/link";
import { Icon, ArrowLink } from "@/components/ui";
import type { ServiceItem } from "@/types/content";
import { isInternalHref } from "@/lib/href";

export function ServiceCard({ item }: { item: ServiceItem }) {
  const className =
    "group bg-surface-main border-border-main shadow-card-sm hover:shadow-card-hover ease-brand relative block overflow-hidden rounded-card border p-6 no-underline transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-primary";
  const ariaLabel = `${item.title} — voir les aides et services`;
  const content = (
    <>
      <div className="bg-surface-tint-blue text-brand-primary group-hover:bg-brand-primary group-hover:text-text-inverse ease-brand mb-4 grid size-12 place-items-center rounded-lg transition-all duration-300 group-hover:scale-105">
        <Icon name={item.icon} size={26} />
      </div>
      <h3 className="text-brand-primary-dark group-hover:text-brand-primary mb-2 text-lg font-bold transition-colors">
        {item.title}
      </h3>
      <p className="text-text-muted text-sm leading-relaxed">
        {item.description}
      </p>
      <span className="mt-4 inline-block">
        <ArrowLink as="span">Découvrir</ArrowLink>
      </span>
    </>
  );

  if (isInternalHref(item.href)) {
    return (
      <Link href={item.href} aria-label={ariaLabel} className={className}>
        {content}
      </Link>
    );
  }

  const isExternal = item.href?.startsWith("http");
  return (
    <a
      href={item.href}
      aria-label={ariaLabel}
      className={className}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {content}
    </a>
  );
}
