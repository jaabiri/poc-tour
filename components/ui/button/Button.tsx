import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import type { IconName } from "@/lib/icons";
import { isInternalHref } from "@/lib/href";

type ButtonVariant = "primary" | "accent" | "ghost";
type ButtonSize = "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  // Charte : primaire = bleu de marque ; accent/CTA = corail AA ; ghost = contour.
  primary: "bg-brand-primary text-text-inverse hover:bg-brand-primary-dark",
  accent: "bg-action text-text-inverse hover:bg-action-hover",
  ghost:
    "bg-surface-main text-brand-primary-dark border border-border-main hover:border-brand-primary",
};

const SIZES: Record<ButtonSize, string> = {
  md: "min-h-touch px-5 text-sm",
  lg: "min-h-touch px-7 py-3.5 text-base",
};

interface BaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconPosition?: "left" | "right";
  className?: string;
  children: ReactNode;
}

type ButtonAsButton = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
    href?: undefined;
  };

type ButtonAsLink = BaseProps & {
  href: string;
  external?: boolean;
};

/**
 * Button — bouton/lien standardisé de la charte Touraine.
 * Pilule, cible ≥44px (min-h-touch), focus visible global (globals.css).
 * Rend un <Link>/<a> si `href`, sinon un <button>.
 */
export function Button(props: ButtonAsButton | ButtonAsLink) {
  const {
    variant = "primary",
    size = "md",
    icon,
    iconPosition = "right",
    className = "",
    children,
  } = props;

  const cls = `group inline-flex items-center justify-center gap-2 rounded-pill font-semibold no-underline transition-colors ${VARIANTS[variant]} ${SIZES[size]} ${className}`;

  const inner = (
    <>
      {icon && iconPosition === "left" && <Icon name={icon} size={18} />}
      {children}
      {icon && iconPosition === "right" && (
        <Icon
          name={icon}
          size={18}
          className="transition-transform duration-200 group-hover:translate-x-0.5"
        />
      )}
    </>
  );

  if ("href" in props && props.href) {
    if (isInternalHref(props.href) && !props.external) {
      return (
        <Link href={props.href} className={cls}>
          {inner}
        </Link>
      );
    }
    return (
      <a
        href={props.href}
        className={cls}
        {...(props.external
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {inner}
      </a>
    );
  }

  const rest = { ...(props as ButtonAsButton) };
  delete (rest as Partial<ButtonAsButton>).variant;
  delete (rest as Partial<ButtonAsButton>).size;
  delete (rest as Partial<ButtonAsButton>).icon;
  delete (rest as Partial<ButtonAsButton>).iconPosition;
  delete (rest as Partial<ButtonAsButton>).className;
  delete (rest as Partial<ButtonAsButton>).children;
  return (
    <button className={cls} {...rest}>
      {inner}
    </button>
  );
}
