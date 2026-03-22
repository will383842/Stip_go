import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import type { Pepite } from '../../types';

interface SMapPepitesProps {
  visible: boolean;
  pepites: Pepite[];
  onPepitePress: (pepite: Pepite) => void;
}

/**
 * Pépites overlay layer on the map.
 *
 * In production with Mapbox GL:
 * - Use PointAnnotation or ShapeSource + SymbolLayer
 * - Each pépite renders as a 💎 marker at its location
 * - Tap opens PepiteDetailScreen
 *
 * For Mapbox GL integration:
 * <MapboxGL.ShapeSource id="pepites-source" shape={pepitesGeoJSON} onPress={handlePress}>
 *   <MapboxGL.SymbolLayer
 *     id="pepites-symbols"
 *     style={{
 *       iconImage: 'pepite-icon',
 *       iconSize: 0.8,
 *       textField: '{votes_count}',
 *       textSize: 10,
 *       textOffset: [0, 1.2],
 *     }}
 *   />
 * </MapboxGL.ShapeSource>
 */
export default function SMapPepites({ visible, pepites, onPepitePress }: SMapPepitesProps) {
  if (!visible || pepites.length === 0) return null;

  // This is a placeholder overlay — in production, markers are rendered
  // via Mapbox native layers for GPU performance
  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      {/* Placeholder: Mapbox PointAnnotations would go here */}
      {/* Each pepite gets a 💎 marker at its lat/lng */}
      {pepites.map((pepite) => (
        <Animated.View
          key={pepite.id}
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
        >
          {/* In production: MapboxGL.PointAnnotation with coordinate={[lng, lat]} */}
          <Pressable onPress={() => onPepitePress(pepite)}>
            <View
              style={{
                backgroundColor: 'rgba(26,26,46,0.9)',
                borderRadius: 12,
                paddingHorizontal: 8,
                paddingVertical: 4,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                borderWidth: 1,
                borderColor: '#F5C518',
              }}
            >
              <Text style={{ fontSize: 16 }}>💎</Text>
              <Text style={{ fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 12, color: '#F5C518' }}>
                {pepite.votes_count}
              </Text>
            </View>
          </Pressable>
        </Animated.View>
      ))}
    </View>
  );
}
