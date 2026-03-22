import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { countryFlag } from '../../utils/helpers';
import { haptic } from '../../utils/haptics';
import { playSound } from '../../utils/audio';

interface SStampVerifiedAnimationProps {
  countryCode: string;
  onComplete: () => void;
}

/**
 * Animation "Stamp vérifié !" — plays when a declared stamp gets GPS-verified.
 * Flag scales from 0.4→1.0 + opacity 40%→100% + THUD sound + haptic heavy.
 */
export default function SStampVerifiedAnimation({ countryCode, onComplete }: SStampVerifiedAnimationProps) {
  const scale = useSharedValue(0.4);
  const opacity = useSharedValue(0.4);
  const badgeOpacity = useSharedValue(0);
  const badgeScale = useSharedValue(0.5);

  useEffect(() => {
    // Step 1: Flag reveal (scale 0.4→1.0 + opacity 40%→100%)
    scale.value = withSpring(1.0, { damping: 8, stiffness: 100 });
    opacity.value = withTiming(1.0, { duration: 600 });

    // Step 2: Sound + haptic at peak
    setTimeout(() => {
      haptic.heavy();
      playSound('thud_country');
    }, 300);

    // Step 3: "Stamp vérifié ✓" badge appears
    badgeOpacity.value = withDelay(500, withTiming(1, { duration: 400 }));
    badgeScale.value = withDelay(500, withSpring(1, { damping: 10, stiffness: 120 }));

    // Step 4: Auto-dismiss after 2.5s
    const timer = setTimeout(() => {
      runOnJS(onComplete)();
    }, 2500);

    return () => clearTimeout(timer);
  }, [scale, opacity, badgeOpacity, badgeScale, onComplete]);

  const flagStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
    opacity: badgeOpacity.value,
  }));

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        {/* Flag — scales up from semi-transparent to full */}
        <Animated.View style={flagStyle}>
          <Text style={styles.flag}>{countryFlag(countryCode)}</Text>
        </Animated.View>

        {/* "Stamp vérifié ✓" badge */}
        <Animated.View style={[styles.badge, badgeStyle]}>
          <Text style={styles.badgeText}>Stamp vérifié ! {'\u2713'}</Text>
        </Animated.View>

        {/* Subtitle */}
        <Animated.View style={badgeStyle}>
          <Text style={styles.subtitle}>
            Ton stamp {countryCode} est maintenant officiel
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13,13,26,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  container: {
    alignItems: 'center',
    gap: 16,
  },
  flag: {
    fontSize: 80,
  },
  badge: {
    backgroundColor: 'rgba(245,197,24,0.15)',
    borderWidth: 1,
    borderColor: '#F5C518',
    borderRadius: 9999,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  badgeText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 18,
    color: '#F5C518',
  },
  subtitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: '#737373',
    textAlign: 'center',
  },
});
