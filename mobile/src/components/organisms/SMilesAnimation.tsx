import React, { useEffect } from 'react';
import { Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  FadeIn,
} from 'react-native-reanimated';

interface SMilesAnimationProps {
  miles?: number;
  onComplete: () => void;
}

export default function SMilesAnimation({ miles = 10, onComplete }: SMilesAnimationProps) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    // Pop in
    scale.value = withSequence(
      withTiming(1.2, { duration: 200 }),
      withTiming(1, { duration: 100 }),
    );

    // Float up and fade out
    translateY.value = withDelay(400, withTiming(-80, { duration: 1000 }));
    opacity.value = withDelay(800, withTiming(0, { duration: 600 }));

    const timeout = setTimeout(onComplete, 1500);
    return () => clearTimeout(timeout);
  }, [translateY, opacity, scale, onComplete]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(100)}
      style={[
        animatedStyle,
        {
          position: 'absolute',
          top: '40%',
          alignSelf: 'center',
          zIndex: 150,
          backgroundColor: 'rgba(245, 197, 24, 0.2)',
          paddingHorizontal: 20,
          paddingVertical: 8,
          borderRadius: 9999,
          borderWidth: 1,
          borderColor: 'rgba(245, 197, 24, 0.4)',
        },
      ]}
    >
      <Text
        style={{
          fontFamily: 'PlusJakartaSans-Bold',
          fontSize: 20,
          color: '#F5C518',
        }}
      >
        +{miles} Miles
      </Text>
    </Animated.View>
  );
}
