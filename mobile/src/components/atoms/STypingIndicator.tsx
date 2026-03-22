import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

function Dot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: 400 }), -1, true),
    );
  }, [delay, opacity]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: -(opacity.value - 0.3) * 6 }],
  }));

  return (
    <Animated.View
      style={[
        style,
        {
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: '#737373',
        },
      ]}
    />
  );
}

export default function STypingIndicator() {
  return (
    <View style={{ flexDirection: 'row', gap: 4, padding: 12, alignItems: 'center' }}>
      <Dot delay={0} />
      <Dot delay={150} />
      <Dot delay={300} />
    </View>
  );
}
