/**
 * SkipLink — lien d'évitement « Aller au contenu principal » (RGAA 12.7).
 * Premier élément focusable du document ; visible uniquement au focus clavier.
 * Cible l'élément #contenu (le <main> du layout).
 */
export function SkipLink() {
  return (
    <a href="#contenu" className="skip-link">
      Aller au contenu principal
    </a>
  );
}
