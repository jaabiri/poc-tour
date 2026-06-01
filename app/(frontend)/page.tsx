import {
  Hero,
  QuickAccess,
  Featured,
  News,
  Agenda,
  DedicatedSpaces,
  Services,
} from "@/components/sections";

// Ordre des sections conforme au CCTP (page d'accueil dynamique) :
// Hero → Accès rapides → Mise en avant → Actualités → Agenda →
// Espaces dédiés → Services en ligne → Newsletter. Le Footer est fourni
// par le layout. <main id="contenu"> est fourni par app/(frontend)/layout.tsx.
export default function Home() {
  return (
    <main>
      <Hero />
      <QuickAccess />
      <Featured />
      <News />
      <Agenda />
      <DedicatedSpaces />
      <Services />
    </main>
  );
}
