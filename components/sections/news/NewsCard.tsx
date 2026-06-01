import Link from "next/link";
import Image from "next/image";
import { Tag } from "@/components/ui";
import type { NewsItem } from "@/types/content";
import { isInternalHref } from "@/lib/href";

/** Editorial news card (DSFR "Carte"): real image, category tag, date, title. */
export function NewsCard({ item }: { item: NewsItem }) {
  const className =
    "group bg-surface-main border-border-main shadow-card-sm hover:shadow-card-hover ease-brand flex flex-col overflow-hidden rounded-card border no-underline transition-all duration-300 hover:-translate-y-1.5";
  // Back-compat: legacy data passes a CSS gradient string as `image`; real
  // cards pass a media path. Render <Image> only for genuine file paths.
  const isImagePath = item.image?.startsWith("/") || item.image?.startsWith("http");
  const content = (
    <>
      <div className="relative aspect-[16/10] overflow-hidden">
        {isImagePath ? (
          <Image
            src={item.image}
            alt={item.imageAlt ?? ""}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="ease-brand object-cover transition-transform duration-500 group-hover:scale-[1.06]"
          />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{ background: item.image || "var(--color-surface-brand)" }}
          />
        )}
        <span className="absolute left-3 top-3">
          <Tag>{item.tag}</Tag>
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        {item.dateLabel && (
          <time
            dateTime={item.date}
            className="text-text-muted text-xs font-semibold uppercase tracking-wide"
          >
            {item.dateLabel}
          </time>
        )}
        <h3 className="font-display text-brand-primary-dark group-hover:text-brand-primary mt-1.5 text-lg font-bold leading-snug transition-colors">
          {item.title}
        </h3>
        {item.excerpt && (
          <p className="text-text-muted mt-2 text-sm leading-relaxed">
            {item.excerpt}
          </p>
        )}
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
