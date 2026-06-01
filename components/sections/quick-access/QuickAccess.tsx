import { Container, SectionLabel, Reveal } from "@/components/ui";
import { ProfileCard } from "./ProfileCard";
import quickAccess from "@/data/quick-access.json";
import type { QuickAccessContent } from "@/types/content";

const data = quickAccess as QuickAccessContent;

/** Intertitre de groupe : tick arc-en-ciel (accent décoratif) + label. */
function GroupHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h3
      id={id}
      className="text-text-heading flex items-center gap-2.5 text-sm font-bold uppercase tracking-wide"
    >
      <span aria-hidden="true" className="bg-rainbow h-1 w-6 rounded-sm" />
      {children}
    </h3>
  );
}

/**
 * Section "Accès rapides" — entrée par profil « Je suis… ». Répond à l'exigence
 * CCTP « plusieurs entrées par typologies d'internautes, le moins de clics
 * possible » en séparant deux logiques distinctes :
 *   1. « Je suis un habitant » — profils citoyens (famille, jeune, senior,
 *      handicap) en cartes claires différenciées par teinte d'icône ;
 *   2. « Je représente une structure » — entreprise/association, commune, en
 *      cartes bleu-nuit pour signaler le changement de logique.
 *
 * Charte / a11y : bande blanche (vs canvas de la page) + voile bleu très subtil
 * en haut pour détacher les cartes ; chaque groupe est un `<section
 * aria-labelledby>` sémantique ; l'arc-en-ciel reste un accent (filets, ticks),
 * jamais sous du texte. Les « accès directs » (CCTP) vivent dans le panneau du
 * hero (HeroAccesDirects) — pas de doublon ici.
 *
 * Data-driven : profils regroupés par `family` (mappable CMS), grille auto-fit.
 */
export function QuickAccess() {
  const habitants = data.profiles.filter((p) => p.family === "habitant");
  const structures = data.profiles.filter((p) => p.family === "structure");

  return (
    <section aria-labelledby="qa-title" className="bg-surface-main relative">
      {/* Voile bleu très subtil en haut de la bande — détache les cartes du fond. Décoratif. */}
      <div
        aria-hidden="true"
        className="from-surface-tint-blue/40 pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b to-transparent"
      />

      <Container className="relative py-16">
        <div className="max-w-2xl">
          <SectionLabel>{data.label}</SectionLabel>
          <h2
            id="qa-title"
            className="font-display text-brand-primary-dark mt-2.5 text-3xl font-bold leading-tight sm:text-4xl"
          >
            {data.title}
          </h2>
          <p className="text-text-muted mt-3 text-base leading-relaxed">
            {data.intro}
          </p>
        </div>

        {/* Groupe 1 — habitants (profils citoyens) */}
        <section aria-labelledby="qa-habitant" className="mt-10">
          <GroupHeading id="qa-habitant">Je suis un habitant</GroupHeading>
          <div className="mt-5 grid grid-cols-[repeat(auto-fit,minmax(15rem,1fr))] gap-5">
            {habitants.map((item, i) => (
              <Reveal key={item.audience} delay={i * 0.06}>
                <ProfileCard item={item} index={i} />
              </Reveal>
            ))}
          </div>
        </section>

        {/* Groupe 2 — structures (entreprises/asso, communes) : traitement bleu-nuit distinct */}
        <section aria-labelledby="qa-structure" className="mt-12">
          <GroupHeading id="qa-structure">
            Je représente une structure
          </GroupHeading>
          <div className="mt-5 grid grid-cols-[repeat(auto-fit,minmax(20rem,1fr))] gap-5">
            {structures.map((item, i) => (
              <Reveal key={item.audience} delay={i * 0.06}>
                <ProfileCard item={item} index={i} />
              </Reveal>
            ))}
          </div>
        </section>
      </Container>
    </section>
  );
}
