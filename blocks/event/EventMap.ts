import type { Block } from 'payload'

/**
 * eventMap — carte de situation d'un événement (gabarit Détail T7). Par défaut
 * elle se construit depuis le point `geo` de l'événement (`source: fromEvent`) ;
 * `source: custom` permet de saisir un couple lat/lng spécifique. Le rendu front
 * est un locator OpenStreetMap (iframe) DOUBLÉ d'une alternative texte (adresse)
 * pour l'accessibilité — aucune clé d'API requise.
 */
export const EventMap: Block = {
  slug: 'eventMap',
  interfaceName: 'EventMapBlock',
  labels: { singular: 'Carte de situation', plural: 'Cartes de situation' },
  fields: [
    { name: 'title', type: 'text', label: 'Titre', admin: { description: 'Optionnel — défaut « Comment s’y rendre ».' } },
    {
      name: 'source',
      type: 'select',
      required: true,
      label: 'Source des coordonnées',
      defaultValue: 'fromEvent',
      options: [
        { label: 'Depuis la géolocalisation de l’événement', value: 'fromEvent' },
        { label: 'Coordonnées personnalisées', value: 'custom' },
      ],
    },
    {
      type: 'row',
      admin: { condition: (_, siblingData) => siblingData?.source === 'custom' },
      fields: [
        { name: 'lat', type: 'number', label: 'Latitude', admin: { width: '50%' } },
        { name: 'lng', type: 'number', label: 'Longitude', admin: { width: '50%' } },
      ],
    },
    {
      name: 'zoom',
      type: 'number',
      label: 'Niveau de zoom',
      defaultValue: 15,
      min: 1,
      max: 19,
    },
  ],
}

export default EventMap
