import React, { useEffect } from 'react';
import { View, Text, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { haptic } from '../../utils/haptics';
import { playSound } from '../../utils/audio';
import { countryFlag } from '../../utils/helpers';

interface SInvisibleBordersProps {
  countryCode: string;
  countryName: string;
  onComplete: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SInvisibleBorders({ countryCode, countryName, onComplete }: SInvisibleBordersProps) {
  const lineProgress = useSharedValue(0);
  const contentScale = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const overlayOpacity = useSharedValue(1);

  useEffect(() => {
    // Heavy haptic + country THUD
    haptic.heavy();
    playSound('thud_country');

    // 1. Gold line sweeps across screen (0-300ms)
    lineProgress.value = withTiming(1, { duration: 300 });

    // 2. Glow pulse (200-500ms)
    glowOpacity.value = withDelay(200, withSequence(
      withTiming(0.6, { duration: 200 }),
      withTiming(0.2, { duration: 300 }),
    ));

    // 3. Content appears (300-600ms)
    contentScale.value = withDelay(300, withSpring(1, { damping: 10, stiffness: 80 }));
    contentOpacity.value = withDelay(300, withTiming(1, { duration: 200 }));

    // 4. Auto-dismiss (after 2.5s total)
    const timeout = setTimeout(() => {
      overlayOpacity.value = withTiming(0, { duration: 400 });
      setTimeout(onComplete, 400);
    }, 2500);

    return () => clearTimeout(timeout);
  }, [lineProgress, contentScale, contentOpacity, glowOpacity, overlayOpacity, onComplete]);

  const lineStyle = useAnimatedStyle(() => ({
    width: lineProgress.value * SCREEN_WIDTH,
    opacity: 1 - lineProgress.value * 0.3,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: contentScale.value }],
    opacity: contentOpacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(100)}
      style={[
        overlayStyle,
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 250,
          alignItems: 'center',
          justifyContent: 'center',
        },
      ]}
    >
      {/* Dark overlay */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(13, 13, 26, 0.85)',
        }}
      />

      {/* Gold glow pulse */}
      <Animated.View
        style={[
          glowStyle,
          {
            position: 'absolute',
            width: SCREEN_WIDTH * 1.5,
            height: SCREEN_WIDTH * 1.5,
            borderRadius: SCREEN_WIDTH,
            backgroundColor: 'rgba(245, 197, 24, 0.08)',
          },
        ]}
      />

      {/* Horizontal gold line */}
      <Animated.View
        style={[
          lineStyle,
          {
            position: 'absolute',
            top: SCREEN_HEIGHT * 0.5,
            left: 0,
            height: 2,
            backgroundColor: '#F5C518',
          },
        ]}
      />

      {/* Content */}
      <Animated.View style={[contentStyle, { alignItems: 'center' }]}>
        {/* "INVISIBLE BORDERS" label */}
        <Text
          style={{
            fontFamily: 'PlusJakartaSans-Medium',
            fontSize: 12,
            color: 'rgba(245, 197, 24, 0.6)',
            letterSpacing: 4,
            textTransform: 'uppercase',
            marginBottom: 16,
          }}
        >
          Invisible Borders
        </Text>

        {/* Country flag */}
        <Text style={{ fontSize: 72 }}>{countryFlag(countryCode)}</Text>

        {/* Country name */}
        <Text
          style={{
            fontFamily: 'PlusJakartaSans-Bold',
            fontSize: 32,
            color: '#FFFEF5',
            marginTop: 16,
            textAlign: 'center',
          }}
        >
          {countryName}
        </Text>

        {/* "Bienvenue" subtitle */}
        <Text
          style={{
            fontFamily: 'PlusJakartaSans-Regular',
            fontSize: 16,
            color: '#F5C518',
            marginTop: 8,
          }}
        >
          Bienvenue !
        </Text>
      </Animated.View>
    </Animated.View>
  );
}
