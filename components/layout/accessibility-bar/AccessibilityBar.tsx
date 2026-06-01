"use client";

import { useSyncExternalStore } from "react";
import { Icon } from "@/components/ui";

/**
 * AccessibilityBar — réglages d'accessibilité exigés par le CCTP (p.13) :
 * taille du texte A= / A+ / A− et contraste renforcé, persistés en localStorage
 * et appliqués via les attributs data-font / data-contrast sur <html>
 * (les styles vivent dans globals.css). Un script inline dans le <head>
 * applique la préférence avant le premier rendu pour éviter tout clignotement.
 */

const FONT_LEVELS = ["", "lg", "xl"] as const;
type FontLevel = (typeof FONT_LEVELS)[number];

const FONT_KEY = "touraine-font";
const CONTRAST_KEY = "touraine-contrast";

function applyFont(level: FontLevel) {
  const el = document.documentElement;
  if (level) el.dataset.font = level;
  else delete el.dataset.font;
  try {
    localStorage.setItem(FONT_KEY, level);
  } catch {}
}

function applyContrast(on: boolean) {
  const el = document.documentElement;
  if (on) el.dataset.contrast = "more";
  else delete el.dataset.contrast;
  try {
    localStorage.setItem(CONTRAST_KEY, on ? "more" : "");
  } catch {}
}

/**
 * Le store externe est le dataset de <html>, déjà réglé par le script inline
 * du <head> avant l'hydratation. On s'y abonne via useSyncExternalStore : le
 * snapshot serveur (valeurs par défaut) sert aussi au premier rendu client, ce
 * qui garantit la correspondance d'hydratation, puis React relit le DOM réel et
 * re-rend après hydratation. Aucun mismatch, aucun clignotement.
 */
function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-font", "data-contrast"],
  });
  return () => observer.disconnect();
}

const getFontSnapshot = (): FontLevel =>
  (document.documentElement.dataset.font as FontLevel) ?? "";
const getContrastSnapshot = (): boolean =>
  document.documentElement.dataset.contrast === "more";

// Snapshots serveur (= état par défaut, identique au HTML rendu côté serveur).
const getServerFont = (): FontLevel => "";
const getServerContrast = (): boolean => false;

export function AccessibilityBar() {
  const fontLevel = useSyncExternalStore(subscribe, getFontSnapshot, getServerFont);
  const contrast = useSyncExternalStore(subscribe, getContrastSnapshot, getServerContrast);
  const fontIdx = FONT_LEVELS.indexOf(fontLevel);

  // Les setters mutent le dataset de <html> ; le MutationObserver déclenche le re-rendu.
  const setFont = (idx: number) => {
    const clamped = Math.max(0, Math.min(FONT_LEVELS.length - 1, idx));
    applyFont(FONT_LEVELS[clamped]);
  };

  const toggleContrast = () => {
    applyContrast(!contrast);
  };

  const btn =
    "inline-flex min-h-touch min-w-touch items-center justify-center gap-1.5 rounded-md px-2.5 font-semibold transition-colors hover:bg-surface-main/10";

  return (
    <div
      role="group"
      aria-label="Réglages d'accessibilité"
      className="flex items-center gap-0.5"
    >
      <span className="sr-only">Taille du texte</span>
      <button
        type="button"
        className={btn}
        onClick={() => setFont(fontIdx - 1)}
        disabled={fontIdx === 0}
        aria-label="Diminuer la taille du texte"
      >
        <span aria-hidden="true">A−</span>
      </button>
      <button
        type="button"
        className={btn}
        onClick={() => setFont(0)}
        aria-pressed={fontIdx === 0}
        aria-label="Taille du texte par défaut"
      >
        <span aria-hidden="true">A</span>
      </button>
      <button
        type="button"
        className={btn}
        onClick={() => setFont(fontIdx + 1)}
        disabled={fontIdx === FONT_LEVELS.length - 1}
        aria-label="Augmenter la taille du texte"
      >
        <span aria-hidden="true">A+</span>
      </button>
      <button
        type="button"
        className={btn}
        onClick={toggleContrast}
        aria-pressed={contrast}
        aria-label="Activer le contraste renforcé"
      >
        <Icon name="eye" size={15} />
        <span className="hidden sm:inline">Contraste</span>
      </button>
    </div>
  );
}
