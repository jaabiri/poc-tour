"use client";

import { useState } from "react";
import Link from "next/link";
import site from "@/data/site.json";

interface BrandLogoProps {
  /** Show the "Le Département" tagline under the name (fallback wordmark only). */
  showTagline?: boolean;
  /** Rendered logo height in pixels. Header ≈ 56, Footer ≈ 64. */
  height?: number;
}

const ALT = "Touraine, le Département";

/** The five rainbow crénaux of the château symbol (cyan → coral). */
const CRENEAUX = [
  "var(--rainbow-cyan)",
  "var(--rainbow-blue)",
  "var(--rainbow-lime)",
  "var(--rainbow-orange)",
  "var(--rainbow-coral)",
];

/**
 * Official Touraine logo. Renders `/public/logo-touraine.svg` when present and
 * gracefully falls back to an inline wordmark (rainbow-castle mark + name) so
 * the header/footer never break while the asset is being supplied.
 */
export function BrandLogo({ showTagline = true, height = 56 }: BrandLogoProps) {
  const [failed, setFailed] = useState(false);

  return (
    <Link
      href="/"
      aria-label={ALT}
      className="flex flex-shrink-0 items-center gap-3 no-underline"
    >
      {failed ? (
        <Fallback showTagline={showTagline} height={height} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- raster logo with onError fallback; next/image can't surface load errors at SSR.
        <img
          src="/logo.png"
          alt={ALT}
          height={height}
          style={{ height, width: "auto" }}
          onError={() => setFailed(true)}
        />
      )}
    </Link>
  );
}

/** Inline wordmark used until the official SVG is dropped into /public. */
function Fallback({
  showTagline,
  height,
}: {
  showTagline: boolean;
  height: number;
}) {
  const mark = Math.round(height * 0.82);
  return (
    <>
      <span
        aria-hidden="true"
        className="bg-brand-primary relative grid place-items-center overflow-hidden rounded-md"
        style={{ width: mark, height: mark }}
      >
        {/* Rainbow crénaux of the château symbol */}
        <span className="absolute left-0 right-0 top-0 flex h-[28%]">
          {CRENEAUX.map((c) => (
            <span key={c} className="flex-1" style={{ background: c }} />
          ))}
        </span>
        <span className="text-text-inverse font-display text-2xl font-bold">
          T
        </span>
      </span>
      <span className="leading-[1.1]">
        <span className="font-display text-brand-primary-dark block text-xl font-bold">
          {site.name}
        </span>
        {showTagline && (
          <span className="text-text-muted block text-[10.5px] uppercase tracking-[1.5px]">
            {site.tagline}
          </span>
        )}
      </span>
    </>
  );
}
