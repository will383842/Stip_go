import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useExplorationStore } from '../../stores/useExplorationStore';

interface SMapFogProps {
  visible: boolean;
  viewport?: {
    swLat: number;
    swLng: number;
    neLat: number;
    neLng: number;
  };
}

/**
 * Terra Incognita fog overlay using H3 hexagons.
 *
 * In production, this renders a ShapeSource with H3 hexagon polygons.
 * Explored tiles are transparent, unexplored tiles have fog.
 *
 * For Mapbox GL integration:
 * - Use @rnmapbox/maps ShapeSource + FillLayer
 * - Generate GeoJSON polygons from H3 indexes
 * - Color: rgba(13, 13, 26, 0.7) for fog, transparent for explored
 */
export default function SMapFog({ visible, viewport }: SMapFogProps) {
  const { exploredTiles } = useExplorationStore();

  // Generate GeoJSON for explored tiles
  const exploredGeoJSON = useMemo(() => {
    if (!visible || exploredTiles.length === 0) return null;

    // In production: convert H3 indexes to polygon coordinates
    // using h3-js library: h3ToGeoBoundary(h3Index)
    // Then create a GeoJSON FeatureCollection with "explored" polygons
    return {
      type: 'FeatureCollection' as const,
      features: exploredTiles.map((h3Index) => ({
        type: 'Feature' as const,
        properties: { h3Index, explored: true },
        geometry: {
          type: 'Polygon' as const,
          // Placeholder: real H3 boundaries would go here
          coordinates: [[]] as number[][][],
        },
      })),
    };
  }, [exploredTiles, visible]);

  if (!visible) return null;

  // In production, this would render:
  // <MapboxGL.ShapeSource id="fog-source" shape={fogGeoJSON}>
  //   <MapboxGL.FillLayer
  //     id="fog-layer"
  //     style={{
  //       fillColor: 'rgba(13, 13, 26, 0.7)',
  //       fillOutlineColor: 'rgba(64, 64, 64, 0.3)',
  //     }}
  //   />
  // </MapboxGL.ShapeSource>
  // <MapboxGL.ShapeSource id="explored-source" shape={exploredGeoJSON}>
  //   <MapboxGL.FillLayer
  //     id="explored-layer"
  //     style={{
  //       fillColor: 'transparent',
  //       fillOutlineColor: 'rgba(0, 212, 255, 0.3)',
  //     }}
  //   />
  // </MapboxGL.ShapeSource>

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    />
  );
}
