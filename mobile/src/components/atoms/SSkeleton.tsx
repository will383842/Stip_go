import React, { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

interface SSkeletonProps {
  width: number | string;
  height: number;
  borderRadius?: number;
}

export default function SSkeleton({ width, height, borderRadius = 8 }: SSkeletonProps) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1200 }),
      -1,
      true,
    );
  }, [shimmer]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 1], [0.3, 0.7]),
  }));

  return (
    <Animated.View
      style={[
        {
          width: typeof width === 'number' ? width : undefined,
          height,
          borderRadius,
          backgroundColor: '#1A1A2E',
        },
        typeof width === 'string' ? { alignSelf: 'stretch' } : {},
        animatedStyle,
      ]}
    />
  );
}
