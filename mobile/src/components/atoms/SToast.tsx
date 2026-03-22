import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { SlideInUp, SlideOutUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

interface SToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onDismiss: () => void;
}

const config: Record<string, { icon: keyof typeof Ionicons.glyphMap; bg: string; color: string }> = {
  success: { icon: 'checkmark-circle-outline', bg: 'rgba(34,197,94,0.15)', color: '#22C55E' },
  error: { icon: 'alert-circle-outline', bg: 'rgba(255,87,69,0.15)', color: '#FF5745' },
  info: { icon: 'information-circle-outline', bg: 'rgba(0,212,255,0.15)', color: '#00D4FF' },
};

export default function SToast({ message, type = 'info', duration = 3000, onDismiss }: SToastProps) {
  useEffect(() => {
    const timeout = setTimeout(onDismiss, duration);
    return () => clearTimeout(timeout);
  }, [duration, onDismiss]);

  const c = config[type];

  return (
    <Animated.View
      entering={SlideInUp.springify().damping(15)}
      exiting={SlideOutUp.duration(200)}
      style={{ position: 'absolute', top: 60, left: 16, right: 16, zIndex: 50 }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: '#404040',
          backgroundColor: c.bg,
        }}
      >
        <Ionicons name={c.icon} size={20} color={c.color} />
        <Text style={{ fontFamily: 'PlusJakartaSans-Medium', fontSize: 14, color: '#FFFEF5', marginLeft: 8, flex: 1 }}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}
