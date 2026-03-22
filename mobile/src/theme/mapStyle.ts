// Atlas Vintage — Custom Mapbox style JSON for Stip Me
// Palette adoucie, labels réduits, eau cyan #00D4FF, terre tons chauds
// PAS de bâtiments 3D. Transition jour/nuit gérée dans MapScreen.

export const ATLAS_VINTAGE_DARK: object = {
  version: 8,
  name: 'Atlas Vintage Dark',
  sources: {
    'mapbox-streets': {
      type: 'vector',
      url: 'mapbox://mapbox.mapbox-streets-v8',
    },
  },
  sprite: 'mapbox://sprites/mapbox/dark-v11',
  glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
  layers: [
    // Background — deep dark
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': '#0D0D1A' },
    },
    // Water — cyan tinted
    {
      id: 'water',
      type: 'fill',
      source: 'mapbox-streets',
      'source-layer': 'water',
      paint: {
        'fill-color': '#0A2A3A',
        'fill-opacity': 1,
      },
    },
    // Land use — subtle warm tones
    {
      id: 'landuse',
      type: 'fill',
      source: 'mapbox-streets',
      'source-layer': 'landuse',
      paint: {
        'fill-color': '#121225',
        'fill-opacity': 0.5,
      },
    },
    // Parks — dark green
    {
      id: 'landuse-park',
      type: 'fill',
      source: 'mapbox-streets',
      'source-layer': 'landuse',
      filter: ['==', 'class', 'park'],
      paint: {
        'fill-color': '#0F1F15',
        'fill-opacity': 0.6,
      },
    },
    // Roads — subtle warm
    {
      id: 'road-primary',
      type: 'line',
      source: 'mapbox-streets',
      'source-layer': 'road',
      filter: ['in', 'class', 'primary', 'trunk'],
      paint: {
        'line-color': '#2A2A3E',
        'line-width': 2,
      },
    },
    {
      id: 'road-secondary',
      type: 'line',
      source: 'mapbox-streets',
      'source-layer': 'road',
      filter: ['in', 'class', 'secondary', 'tertiary'],
      paint: {
        'line-color': '#1F1F35',
        'line-width': 1,
      },
    },
    {
      id: 'road-street',
      type: 'line',
      source: 'mapbox-streets',
      'source-layer': 'road',
      filter: ['==', 'class', 'street'],
      paint: {
        'line-color': '#1A1A2E',
        'line-width': 0.5,
      },
    },
    // Admin boundaries — gold accent
    {
      id: 'admin-country',
      type: 'line',
      source: 'mapbox-streets',
      'source-layer': 'admin',
      filter: ['==', 'admin_level', 2],
      paint: {
        'line-color': 'rgba(245, 197, 24, 0.25)',
        'line-width': 1,
        'line-dasharray': [3, 2],
      },
    },
    // Place labels — minimal, warm tint
    {
      id: 'place-city',
      type: 'symbol',
      source: 'mapbox-streets',
      'source-layer': 'place_label',
      filter: ['==', 'class', 'city'],
      layout: {
        'text-field': ['get', 'name'],
        'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
        'text-size': 14,
        'text-max-width': 8,
      },
      paint: {
        'text-color': 'rgba(255, 254, 245, 0.7)',
        'text-halo-color': '#0D0D1A',
        'text-halo-width': 1,
      },
    },
    {
      id: 'place-town',
      type: 'symbol',
      source: 'mapbox-streets',
      'source-layer': 'place_label',
      filter: ['==', 'class', 'town'],
      layout: {
        'text-field': ['get', 'name'],
        'text-font': ['DIN Pro Regular', 'Arial Unicode MS Regular'],
        'text-size': 12,
      },
      paint: {
        'text-color': 'rgba(255, 254, 245, 0.4)',
        'text-halo-color': '#0D0D1A',
        'text-halo-width': 1,
      },
    },
    // Country labels — gold
    {
      id: 'country-label',
      type: 'symbol',
      source: 'mapbox-streets',
      'source-layer': 'place_label',
      filter: ['==', 'class', 'country'],
      layout: {
        'text-field': ['get', 'name'],
        'text-font': ['DIN Pro Bold', 'Arial Unicode MS Bold'],
        'text-size': 16,
        'text-transform': 'uppercase',
        'text-letter-spacing': 0.15,
      },
      paint: {
        'text-color': 'rgba(245, 197, 24, 0.5)',
        'text-halo-color': '#0D0D1A',
        'text-halo-width': 1.5,
      },
    },
  ],
};

export const ATLAS_VINTAGE_LIGHT: object = {
  version: 8,
  name: 'Atlas Vintage Light',
  sources: {
    'mapbox-streets': {
      type: 'vector',
      url: 'mapbox://mapbox.mapbox-streets-v8',
    },
  },
  sprite: 'mapbox://sprites/mapbox/light-v11',
  glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': '#FFFEF5' },
    },
    {
      id: 'water',
      type: 'fill',
      source: 'mapbox-streets',
      'source-layer': 'water',
      paint: {
        'fill-color': '#C8F0FF',
        'fill-opacity': 1,
      },
    },
    {
      id: 'landuse',
      type: 'fill',
      source: 'mapbox-streets',
      'source-layer': 'landuse',
      paint: {
        'fill-color': '#F5F0E0',
        'fill-opacity': 0.5,
      },
    },
    {
      id: 'landuse-park',
      type: 'fill',
      source: 'mapbox-streets',
      'source-layer': 'landuse',
      filter: ['==', 'class', 'park'],
      paint: {
        'fill-color': '#D4EDDA',
        'fill-opacity': 0.6,
      },
    },
    {
      id: 'road-primary',
      type: 'line',
      source: 'mapbox-streets',
      'source-layer': 'road',
      filter: ['in', 'class', 'primary', 'trunk'],
      paint: {
        'line-color': '#E0D8C8',
        'line-width': 2,
      },
    },
    {
      id: 'road-secondary',
      type: 'line',
      source: 'mapbox-streets',
      'source-layer': 'road',
      filter: ['in', 'class', 'secondary', 'tertiary'],
      paint: {
        'line-color': '#EDE6D6',
        'line-width': 1,
      },
    },
    {
      id: 'admin-country',
      type: 'line',
      source: 'mapbox-streets',
      'source-layer': 'admin',
      filter: ['==', 'admin_level', 2],
      paint: {
        'line-color': 'rgba(245, 197, 24, 0.4)',
        'line-width': 1,
        'line-dasharray': [3, 2],
      },
    },
    {
      id: 'place-city',
      type: 'symbol',
      source: 'mapbox-streets',
      'source-layer': 'place_label',
      filter: ['==', 'class', 'city'],
      layout: {
        'text-field': ['get', 'name'],
        'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
        'text-size': 14,
      },
      paint: {
        'text-color': '#1A1A2E',
        'text-halo-color': '#FFFEF5',
        'text-halo-width': 1,
      },
    },
    {
      id: 'country-label',
      type: 'symbol',
      source: 'mapbox-streets',
      'source-layer': 'place_label',
      filter: ['==', 'class', 'country'],
      layout: {
        'text-field': ['get', 'name'],
        'text-font': ['DIN Pro Bold', 'Arial Unicode MS Bold'],
        'text-size': 16,
        'text-transform': 'uppercase',
        'text-letter-spacing': 0.15,
      },
      paint: {
        'text-color': 'rgba(180, 140, 10, 0.7)',
        'text-halo-color': '#FFFEF5',
        'text-halo-width': 1.5,
      },
    },
  ],
};
