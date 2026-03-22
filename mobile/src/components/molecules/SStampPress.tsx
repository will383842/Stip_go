import React, { useCallback } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { haptic } from '../../utils/haptics';

interface SStampPressProps {
  onStampComplete: () => void;
  size?: number;
}

const STAMP_DURATION_MS = 500;

export default function SStampPress({ onStampComplete, size = 56 }: SStampPressProps) {
  const progress = useSharedValue(0);
  const scale = useSharedValue(1);
  const isActive = useSharedValue(false);

  const triggerLight = useCallback(() => haptic.light(), []);
  const triggerMedium = useCallback(() => haptic.medium(), []);
  const triggerHeavy = useCallback(() => haptic.heavy(), []);
  const completeStamp = useCallback(() => onStampComplete(), [onStampComplete]);

  // Medium haptic at halfway point
  const mediumTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const longPress = Gesture.LongPress()
    .minDuration(STAMP_DURATION_MS)
    .onBegin(() => {
      isActive.value = true;
      progress.value = withTiming(1, { duration: STAMP_DURATION_MS });
      scale.value = withTiming(1.5, { duration: STAMP_DURATION_MS });
      // Light haptic at 0ms
      runOnJS(triggerLight)();
      // Medium haptic at 250ms
      mediumTimer.current = setTimeout(() => {
        if (isActive.value) runOnJS(triggerMedium)();
      }, 250);
    })
    .onStart(() => {
      // Heavy haptic at 500ms — STAMP!
      runOnJS(triggerHeavy)();
      runOnJS(completeStamp)();
    })
    .onFinalize(() => {
      isActive.value = false;
      if (mediumTimer.current) clearTimeout(mediumTimer.current);
      progress.value = withSpring(0, { damping: 15, stiffness: 150 });
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    });

  const markerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const progressRingStyle = useAnimatedStyle(() => ({
    opacity: progress.value > 0 ? 1 : 0,
    borderWidth: 3,
    borderColor: '#F5C518',
    borderRadius: 9999,
    width: size - 4,
    height: size - 4,
    position: 'absolute' as const,
    transform: [{ scale: 0.8 + progress.value * 0.4 }],
  }));

  return (
    <GestureDetector gesture={longPress}>
      <Animated.View
        style={[
          markerStyle,
          {
            width: size,
            height: size,
            alignItems: 'center',
            justifyContent: 'center',
          },
        ]}
      >
        {/* Progress ring */}
        <Animated.View style={progressRingStyle} />

        {/* Outer ring */}
        <View
          style={{
            position: 'absolute',
            width: size - 4,
            height: size - 4,
            borderRadius: 9999,
            borderWidth: 2,
            borderColor: '#404040',
          }}
        />

        {/* Center dot */}
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 9999,
            backgroundColor: '#F5C518',
          }}
        />
      </Animated.View>
    </GestureDetector>
  );
}
