import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { haptic } from '../../utils/haptics';
import { stampIcon, timeAgo, countryFlag } from '../../utils/helpers';
import type { Stamp } from '../../types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface SStampCardProps {
  stamp: Stamp;
  onPress: (stamp: Stamp) => void;
}

function stampName(stamp: Stamp): string {
  switch (stamp.stamp_type) {
    case 'spot': return stamp.spot_name || 'Spot';
    case 'city': return stamp.city_name || 'Ville';
    case 'region': return stamp.region_name || 'Region';
    case 'country': return countryFlag(stamp.country_code) + ' ' + stamp.country_code;
    default: return 'Stamp';
  }
}

export default function SStampCard({ stamp, onPress }: SStampCardProps) {
  const scale = useSharedValue(1);
  const isDeclared = stamp.source === 'declared';

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={() => { haptic.light(); onPress(stamp); }}
      onPressIn={() => { scale.value = withSpring(0.95, { damping: 15, stiffness: 150 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 150 }); }}
      style={[
        animatedStyle,
        {
          backgroundColor: 'rgba(26,26,46,0.85)',
          borderRadius: 16,
          padding: 16,
          borderWidth: stamp.is_golden ? 1 : isDeclared ? 1 : 0,
          borderColor: stamp.is_golden ? '#F5C518' : isDeclared ? 'rgba(245,197,24,0.3)' : 'transparent',
          borderStyle: isDeclared ? 'dashed' : 'solid',
          opacity: isDeclared ? 0.6 : 1,
        },
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ fontSize: 28, marginRight: 12, opacity: isDeclared ? 0.4 : 1 }}>
          {stampIcon(stamp.stamp_type)}
        </Text>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text
              style={{
                fontFamily: 'PlusJakartaSans-SemiBold',
                fontSize: 16,
                color: stamp.is_golden ? '#F5C518' : isDeclared ? '#A0A0A0' : '#FFFEF5',
              }}
              numberOfLines={1}
            >
              {stampName(stamp)}
            </Text>
            {isDeclared && (
              <Text style={{ fontSize: 12, opacity: 0.5 }}>{'\u2708\uFE0F'}</Text>
            )}
          </View>
          <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, color: '#737373', marginTop: 2 }}>
            {stamp.stamp_type.charAt(0).toUpperCase() + stamp.stamp_type.slice(1)} · {timeAgo(stamp.stamped_at)}
            {isDeclared ? ' · Non verifie' : ''}
          </Text>
        </View>
      </View>
    </AnimatedPressable>
  );
}
