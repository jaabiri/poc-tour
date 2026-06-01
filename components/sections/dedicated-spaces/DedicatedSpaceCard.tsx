import Link from "next/link";
import { Icon } from "@/components/ui";
import type { DedicatedSpaceItem } from "@/types/content";
import { isInternalHref } from "@/lib/href";

type Variant = "dark" | "light";

const STYLES: Record<
  Variant,
  {
    card: string;
    iconBox: string;
    title: string;
    desc: string;
    pill: string;
    iconColor: string;
  }
> = {
  dark: {
    card: "bg-gradient-to-br from-brand-primary to-brand-primary-dark border-transparent text-text-inverse",
    iconBox: "bg-white/[0.12]",
    title: "text-text-inverse",
    desc: "text-text-on-brand",
    pill: "bg-white/10 text-text-inverse border-white/[0.18]",
    iconColor: "text-text-inverse",
  },
  light: {
    card: "bg-surface-main border-border-main text-text-primary",
    iconBox: "bg-surface-tint-blue",
    title: "text-brand-primary-dark",
    desc: "text-text-muted",
    pill: "bg-surface-page text-brand-primary border-border-main",
    iconColor: "text-brand-primary",
  },
};

export function DedicatedSpaceCard({
  item,
  variant,
}: {
  item: DedicatedSpaceItem;
  variant: Variant;
}) {
  const s = STYLES[variant];
  const className = `group hover:shadow-card-hover ease-brand relative block overflow-hidden rounded-card border p-7 no-underline transition-all duration-300 hover:-translate-y-1.5 ${s.card}`;
  const content = (
    <>
      <div
        className={`mb-4 grid size-12 place-items-center rounded-lg ${s.iconBox} ${s.iconColor}`}
      >
        <Icon name={item.icon} size={26} />
      </div>
      <h3 className={`font-display mb-2 text-xl font-bold ${s.title}`}>
        {item.title}
      </h3>
      <p className={`mb-4 text-sm leading-relaxed ${s.desc}`}>
        {item.description}
      </p>
      <div className="flex flex-wrap gap-2">
        {item.links.map((link) => (
          <span
            key={link}
            className={`rounded-pill border px-3 py-1 text-xs font-semibold ${s.pill}`}
          >
            {link}
          </span>
        ))}
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
