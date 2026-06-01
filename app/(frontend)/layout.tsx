import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { Fraunces, Outfit } from "next/font/google";
import { Topbar, SiteHeader, SiteFooter } from '@/components/layout'
import { SkipLink } from "@/components/layout/skip-link";
import { RefreshOnSave } from "@/components/shared/live-preview";
import { getHeader, getFooter } from "@/lib/globals";
import "../globals.css";

// Applique la préférence d'accessibilité (taille texte / contraste) AVANT le
// premier rendu pour éviter tout clignotement (cf. AccessibilityBar).
const A11Y_PREF_SCRIPT = `(function(){try{var f=localStorage.getItem('touraine-font');if(f){document.documentElement.dataset.font=f;}var c=localStorage.getItem('touraine-contrast');if(c==='more'){document.documentElement.dataset.contrast='more';}}catch(e){}})();`;

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600", "700", "900"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Touraine — Le Département vous accompagne au quotidien",
  description:
    "Portail du Département de Touraine : démarches, aides et services de proximité, réunis en un seul endroit.",
};

export default async function FrontendLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Header/footer are configured in the Payload `header`/`footer` globals.
  // Resolved (rubrique paths expanded) once at the layout level and passed down
  // as props so the components stay data-agnostic (CLAUDE.md data flow).
  const [header, { footer, newsletter }, { isEnabled: isDraft }] =
    await Promise.all([getHeader(), getFooter(), draftMode()]);

  return (
    <html lang="fr" className={`${fraunces.variable} ${outfit.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: A11Y_PREF_SCRIPT }} />
      </head>
      <body>
        {/* Live Preview: refresh the iframe on save. Only mounted in draft mode
            (i.e. inside the admin preview iframe), never on public pages. */}
        {isDraft && <RefreshOnSave />}
        <SkipLink />
        <Topbar data={header.topbar} />
        <SiteHeader nav={header.nav} search={header.search} privateSpace={header.topbar.privateSpace} />
        <div id="contenu" tabIndex={-1}>
          {children}
        </div>
        <SiteFooter footer={footer} newsletter={newsletter} />
      </body>
    </html>
  );
}
