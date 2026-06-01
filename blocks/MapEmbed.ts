import type { Block } from 'payload'

/**
 * MapEmbed — embeds an ESRI/ArcGIS map item (T12 cartographie). Per ADR /
 * site-tree T12, the DEFAULT and recommended mode is a "fullscreen-button" that
 * opens the map in a new window (browser security restrictions); the inline
 * iframe is reserved for simple locator maps.
 */
export const MapEmbed: Block = {
  slug: 'mapEmbed',
  interfaceName: 'MapEmbedBlock',
  labels: { singular: 'Carte', plural: 'Cartes' },
  fields: [
    { name: 'title', type: 'text', label: 'Titre' },
    {
      name: 'arcgisItemUrl',
      type: 'text',
      required: true,
      label: 'URL de la carte ArcGIS',
      admin: { description: 'URL de l’item ArcGIS / ESRI à afficher.' },
    },
    {
      name: 'displayMode',
      type: 'select',
      required: true,
      label: 'Mode d’affichage',
      defaultValue: 'fullscreen-button',
      options: [
        {
          label: 'Bouton plein écran (recommandé)',
          value: 'fullscreen-button',
        },
        { label: 'Iframe intégrée (locator simple)', value: 'inline-iframe' },
      ],
    },
  ],
}
