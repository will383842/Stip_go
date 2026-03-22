import React from 'react';
import { Pressable, Text, ActivityIndicator } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { haptic } from '../../utils/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface SButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<string, { bg: string; text: string }> = {
  primary: { bg: '#F5C518', text: '#1A1A2E' },
  secondary: { bg: 'transparent', text: '#F5C518' },
  ghost: { bg: 'transparent', text: '#FFFEF5' },
  danger: { bg: '#FF5745', text: '#FFFEF5' },
};

const sizeStyles: Record<string, { px: number; py: number; fontSize: number }> = {
  sm: { px: 16, py: 8, fontSize: 14 },
  md: { px: 24, py: 12, fontSize: 16 },
  lg: { px: 32, py: 16, fontSize: 18 },
};

export default function SButton({
  variant = 'primary',
  size = 'md',
  onPress,
  loading = false,
  disabled = false,
  children,
}: SButtonProps) {
  const scale = useSharedValue(1);
  const v = variantStyles[variant];
  const s = sizeStyles[size];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const handlePress = () => {
    if (disabled || loading) return;
    haptic.light();
    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        animatedStyle,
        {
          backgroundColor: v.bg,
          paddingHorizontal: s.px,
          paddingVertical: s.py,
          borderRadius: 9999,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          opacity: disabled ? 0.5 : 1,
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderColor: '#F5C518',
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={v.text} />
      ) : (
        <Text
          style={{
            color: v.text,
            fontSize: s.fontSize,
            fontFamily: 'PlusJakartaSans-Bold',
          }}
        >
          {children}
        </Text>
      )}
    </AnimatedPressable>
  );
}
