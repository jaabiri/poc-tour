import Link from "next/link";
import { Icon, Tag } from "@/components/ui";
import type { AgendaItem } from "@/types/content";
import { isInternalHref } from "@/lib/href";

export function AgendaCard({ item }: { item: AgendaItem }) {
  const className =
    "group bg-surface-main border-border-main text-text-primary shadow-card-sm hover:shadow-card-hover ease-brand relative flex items-center gap-4 overflow-hidden rounded-card border p-4 no-underline transition-all duration-300 hover:-translate-y-1.5";
  const content = (
    <>
      <div className="bg-brand-primary-dark text-text-inverse w-16 flex-shrink-0 rounded-md py-3 text-center">
        <div className="font-display text-2xl font-black leading-none">
          {item.day}
        </div>
        <div className="text-text-on-brand mt-1 text-[0.65rem] font-semibold tracking-wide">
          {item.month}
        </div>
      </div>
      <div>
        <Tag>{item.category}</Tag>
        <div className="text-brand-primary-dark group-hover:text-brand-primary mb-1 mt-1.5 text-base font-semibold leading-snug transition-colors">
          {item.title}
        </div>
        <div className="text-text-muted flex items-center gap-1.5 text-sm">
          <Icon name="map-pin" size={14} /> {item.place}
        </div>
      </div>
    </>
  );

  if (isInternalHref(item.href)) {
    return (
      <Link href={item.href} className={className}>
        {content}
      </Link>
    );
  }

  const isExternal = item.href?.startsWith("http");
  return (
    <a
      href={item.href}
      className={className}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {content}
    </a>
  );
}
