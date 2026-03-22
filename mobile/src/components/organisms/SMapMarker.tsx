import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

interface SMapMarkerProps {
  type: 'user' | 'voyageur' | 'spot_unstamped' | 'spot_stamped';
}

const markerConfig = {
  user: { color: '#F5C518', size: 24, pulse: true },
  voyageur: { color: '#00D4FF', size: 14, pulse: true },
  spot_unstamped: { color: '#737373', size: 18, pulse: false },
  spot_stamped: { color: '#F5C518', size: 22, pulse: false },
};

export default function SMapMarker({ type }: SMapMarkerProps) {
  const pulseAnim = useSharedValue(0);
  const config = markerConfig[type];

  useEffect(() => {
    if (config.pulse) {
      pulseAnim.value = withRepeat(
        withTiming(1, { duration: 1500 }),
        -1,
        true,
      );
    }
  }, [config.pulse, pulseAnim]);

  const pulseStyle = useAnimatedStyle(() => {
    if (!config.pulse) return {};
    return {
      transform: [{ scale: interpolate(pulseAnim.value, [0, 1], [1, 1.5]) }],
      opacity: interpolate(pulseAnim.value, [0, 1], [0.6, 0]),
    };
  });

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: config.size * 2, height: config.size * 2 }}>
      {/* Pulse ring */}
      {config.pulse && (
        <Animated.View
          style={[
            pulseStyle,
            {
              position: 'absolute',
              width: config.size,
              height: config.size,
              borderRadius: 9999,
              backgroundColor: config.color,
            },
          ]}
        />
      )}

      {/* Core dot */}
      <View
        style={{
          width: config.size,
          height: config.size,
          borderRadius: 9999,
          backgroundColor: config.color,
          borderWidth: type === 'user' ? 3 : 0,
          borderColor: '#0D0D1A',
          opacity: type === 'spot_unstamped' ? 0.6 : 1,
        }}
      />
    </View>
  );
}
