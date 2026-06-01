"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Container, SectionLabel, Icon, CornerSeal, Reveal } from "@/components/ui";
import showcase from "@/data/showcase.json";

type Gabarit = (typeof showcase.gabarits)[number];

/**
 * ShowcaseTemplate — support de présentation client. Présente chaque gabarit
 * du catalogue avec sa liste de sections CCTP (cochées), un lien « voir en
 * plein écran » et un mode annotations optionnel pointant les exigences
 * couvertes. Entièrement statique / mock — aucune dépendance réseau.
 */
export function ShowcaseTemplate() {
  const [annotations, setAnnotations] = useState(false);
  const { intro, gabarits } = showcase;

  return (
    <main>
      {/* Hero */}
      <section className="bg-surface-brand text-text-inverse relative overflow-hidden">
        <Container className="relative py-16">
          <CornerSeal size={56} />
          <SectionLabel>{intro.label}</SectionLabel>
          <h1 className="font-display mt-3 max-w-3xl text-[clamp(2rem,5vw,3.25rem)] font-black leading-tight">
            {intro.title}
          </h1>
          <p className="text-text-on-brand mt-4 max-w-2xl text-lg leading-relaxed">
            {intro.lead}
          </p>

          {/* Exigences CCTP couvertes (puces de réassurance) */}
          <ul className="mt-7 flex flex-wrap gap-2">
            {intro.cctpCovered.map((c) => (
              <li
                key={c}
                className="border-text-inverse/25 text-text-inverse inline-flex items-center gap-1.5 rounded-pill border px-3 py-1 text-sm"
              >
                <Icon name="check" size={14} /> {c}
              </li>
            ))}
          </ul>
        </Container>
        <div className="filet-rainbow" />
      </section>

      {/* Barre d'outils : bascule annotations */}
      <div className="bg-surface-page border-border-main sticky top-header z-30 border-b">
        <Container className="flex flex-wrap items-center justify-between gap-3 py-3">
          <p className="text-text-muted text-sm">
            {gabarits.length} gabarits · prêts pour la démonstration
          </p>
          <button
            type="button"
            onClick={() => setAnnotations((v) => !v)}
            aria-pressed={annotations}
            className={`ease-brand inline-flex min-h-touch items-center gap-2 rounded-pill border px-4 text-sm font-semibold transition-colors ${
              annotations
                ? "bg-action text-text-inverse border-transparent"
                : "bg-surface-main border-border-main text-brand-primary-dark"
            }`}
          >
            <Icon name="info" size={16} />
            {annotations ? "Masquer les annotations CCTP" : "Afficher les annotations CCTP"}
          </button>
        </Container>
      </div>

      {/* Gabarits */}
      <Container className="py-14">
        <div className="flex flex-col gap-14">
          {gabarits.map((g, i) => (
            <Reveal key={g.id}>
              <GabaritRow gabarit={g} flip={i % 2 === 1} annotations={annotations} />
            </Reveal>
          ))}
        </div>
      </Container>
    </main>
  );
}

function GabaritRow({
  gabarit,
  flip,
  annotations,
}: {
  gabarit: Gabarit;
  flip: boolean;
  annotations: boolean;
}) {
  return (
    <article
      id={gabarit.id}
      className="grid scroll-mt-32 items-center gap-8 lg:grid-cols-2"
    >
      {/* Visuel */}
      <div className={flip ? "lg:order-2" : ""}>
        <div className="border-border-main shadow-card relative aspect-[16/10] overflow-hidden rounded-card border">
          <Image
            src={gabarit.image}
            alt={`Aperçu du gabarit ${gabarit.name}`}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
          <CornerSeal />
          <span className="bg-surface-main/95 text-brand-primary-dark absolute left-4 top-4 rounded-pill px-3 py-1 text-xs font-bold uppercase tracking-wide">
            Gabarit {gabarit.number}
          </span>
          {annotations && (
            <div className="absolute inset-x-0 bottom-0 flex flex-wrap gap-1.5 p-4">
              {gabarit.annotations.map((a) => (
                <span
                  key={a}
                  className="bg-action text-text-inverse inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-xs font-semibold shadow-card-sm"
                >
                  <Icon name="check" size={12} /> {a}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Texte + checklist */}
      <div className={flip ? "lg:order-1" : ""}>
        <SectionLabel>{gabarit.tagline}</SectionLabel>
        <h2 className="font-display text-brand-primary-dark mt-2.5 text-3xl font-bold">
          {gabarit.name}
        </h2>
        <p className="text-text-muted mt-3 text-base leading-relaxed">
          {gabarit.description}
        </p>

        <h3 className="text-brand-primary-dark mt-6 mb-2 text-sm font-bold uppercase tracking-wide">
          Sections requises (CCTP)
        </h3>
        <ul className="grid gap-2 sm:grid-cols-2">
          {gabarit.sections.map((s) => (
            <li key={s} className="text-text-primary flex items-start gap-2 text-sm">
              <span
                aria-hidden="true"
                className="bg-surface-tint-blue text-brand-primary mt-0.5 grid size-5 flex-shrink-0 place-items-center rounded-full"
              >
                <Icon name="check" size={12} />
              </span>
              {s}
            </li>
          ))}
        </ul>

        <Link
          href={gabarit.href}
          className="bg-action text-text-inverse hover:bg-action-hover ease-brand mt-6 inline-flex min-h-touch items-center gap-2 rounded-pill px-6 font-semibold no-underline transition-colors"
        >
          Voir en plein écran
          <Icon name="arrow-up-right" size={18} />
        </Link>
      </div>
    </article>
  );
}
