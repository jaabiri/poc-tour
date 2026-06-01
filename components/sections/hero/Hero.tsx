import Image from "next/image";
import { Container, Icon } from "@/components/ui";
import { HeroAccesDirects } from "./HeroAccesDirects";
import hero from "@/data/hero.json";
import quickAccess from "@/data/quick-access.json";
import type { HeroContent, QuickAccessContent } from "@/types/content";

const data = hero as HeroContent;
const { shortcuts } = quickAccess as QuickAccessContent;

export function Hero() {
  return (
    <section className="relative">
      {/* Bande image plein cadre */}
      <div className="relative h-[30rem] sm:h-[32rem] lg:h-[34rem]">
        <Image
          src={data.image}
          alt={data.imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_32%]"
        />
        {/* Voile dégradé (scrim) garantissant le contraste AA du texte
            (jamais d'arc-en-ciel sous le texte). Plus dense à gauche où vit le
            titre, plus léger à droite où la photo respire derrière la carte. */}
        <div
          aria-hidden="true"
          className="from-brand-primary-dark/95 via-brand-primary/75 to-brand-primary-dark/30 absolute inset-0 bg-gradient-to-r"
        />

        {/* Colonne gauche : badge + titre + sous-titre + recherche */}
        <div className="absolute inset-0 flex items-center">
          <Container>
            <div className="grid lg:grid-cols-12 lg:gap-10">
              <div className="text-text-inverse max-w-[40rem] lg:col-span-7 lg:max-w-none lg:pr-6">
                <span className="bg-action text-text-inverse shadow-card-sm mb-4 inline-flex items-center rounded-pill px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide">
                  {data.badge}
                </span>
                <h1 className="font-display text-[clamp(2rem,5vw,3.25rem)] font-black leading-[1.05] tracking-tight [text-shadow:0_8px_30px_rgba(0,61,92,.65)]">
                  {data.title}
                </h1>
                <p className="text-text-on-brand mt-4 max-w-[32rem] text-[clamp(1rem,1.8vw,1.125rem)] leading-snug [text-shadow:0_2px_12px_rgba(0,61,92,.5)]">
                  {data.subtitle}
                </p>

                {/* Barre de recherche (geste primaire, dans le flux de lecture) */}
                <form
                  action="/recherche"
                  method="get"
                  role="search"
                  className="bg-surface-main border-border-main shadow-float mt-7 flex max-w-[34rem] flex-col gap-3 rounded-lg border p-2 sm:flex-row sm:items-center sm:gap-3 sm:pl-5"
                >
                  <label htmlFor="hero-search" className="sr-only">
                    {data.search.label}
                  </label>
                  <Icon
                    name="search"
                    size={22}
                    className="text-text-muted hidden sm:block"
                  />
                  <input
                    id="hero-search"
                    name="q"
                    placeholder={data.search.placeholder}
                    className="text-text-primary min-h-touch flex-1 border-none bg-transparent px-3 text-base outline-none sm:px-0"
                  />
                  <button
                    type="submit"
                    className="bg-action text-text-inverse hover:bg-action-hover ease-brand min-h-touch rounded-pill border-none px-6 font-semibold transition-colors"
                  >
                    {data.search.button}
                  </button>
                </form>
              </div>

              {/* Réservation de la colonne droite (la carte est superposée plus bas
                  pour pouvoir chevaucher le bord de l'image). */}
              <div className="hidden lg:col-span-5 lg:block" aria-hidden="true" />
            </div>
          </Container>
        </div>

        {/* Filet arc-en-ciel en bas de la bande sombre (charte) */}
        <div
          aria-hidden="true"
          className="filet-rainbow absolute inset-x-0 bottom-0"
        />
      </div>

      {/* Carte « Accès directs » : flottante à droite, chevauche le bas de la
          bande (lg) ; en flux pleine largeur sous le titre (mobile). */}
      <Container className="relative">
        <div className="lg:grid lg:grid-cols-12 lg:gap-10">
          <div className="hidden lg:col-span-7 lg:block" aria-hidden="true" />
          <div className="relative z-10 -mt-10 mb-14 lg:col-span-5 lg:mb-0 lg:-mt-[20.5rem] lg:pb-12">
            <HeroAccesDirects label={data.quickAccessLabel} items={shortcuts} />
          </div>
        </div>
      </Container>
    </section>
  );
}
