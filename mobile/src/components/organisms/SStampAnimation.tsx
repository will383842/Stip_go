import React, { useEffect } from 'react';
import { View, Text, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  withSequence,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { haptic } from '../../utils/haptics';
import { playSound } from '../../utils/audio';
import { stampIcon, countryFlag } from '../../utils/helpers';
import type { StampType } from '../../types';

interface SStampAnimationProps {
  stampType: StampType;
  stampName: string;
  countryCode?: string;
  onComplete: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const animDurations: Record<StampType, number> = {
  spot: 300,
  city: 400,
  region: 450,
  country: 500,
};

const soundMap: Record<StampType, 'thud_spot' | 'thud_city' | 'thud_region' | 'thud_country'> = {
  spot: 'thud_spot',
  city: 'thud_city',
  region: 'thud_region',
  country: 'thud_country',
};

export default function SStampAnimation({ stampType, stampName, countryCode, onComplete }: SStampAnimationProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(stampType === 'city' ? -200 : 0);

  useEffect(() => {
    const duration = animDurations[stampType];

    // Play sound
    playSound(soundMap[stampType]);

    // Haptic
    if (stampType === 'country' || stampType === 'region') {
      haptic.heavy();
    } else {
      haptic.medium();
    }

    // Scale animation
    scale.value = withSpring(1, { damping: 12, stiffness: 100 });

    // City stamp falls from top
    if (stampType === 'city') {
      translateY.value = withSpring(0, { damping: 10, stiffness: 80 });
    }

    // Auto-dismiss
    const timeout = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 300 });
      setTimeout(onComplete, 300);
    }, duration + 1500);

    return () => clearTimeout(timeout);
  }, [stampType, scale, opacity, translateY, onComplete]);

  const stampStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(100)}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 200,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(13,13,26,0.8)',
      }}
    >
      <Animated.View style={[stampStyle, { alignItems: 'center' }]}>
        {/* Country flag for country stamps */}
        {stampType === 'country' && countryCode && (
          <Text style={{ fontSize: 64, marginBottom: 16 }}>{countryFlag(countryCode)}</Text>
        )}

        {/* Stamp icon */}
        <Text style={{ fontSize: 56 }}>{stampIcon(stampType)}</Text>

        {/* Stamp name */}
        <Text
          style={{
            fontFamily: 'PlusJakartaSans-Bold',
            fontSize: 28,
            color: '#F5C518',
            marginTop: 16,
            textAlign: 'center',
            maxWidth: SCREEN_WIDTH * 0.8,
          }}
        >
          {stampName}
        </Text>

        {/* Type label */}
        <Text
          style={{
            fontFamily: 'PlusJakartaSans-Medium',
            fontSize: 14,
            color: '#737373',
            marginTop: 8,
            textTransform: 'uppercase',
            letterSpacing: 2,
          }}
        >
          {stampType}
        </Text>
      </Animated.View>
    </Animated.View>
  );
}
