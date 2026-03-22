import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Image } from 'expo-image';

interface SBadgeProps {
  icon: string;
  label: string;
  isEarned?: boolean;
  isGolden?: boolean;
}

export default function SBadge({ icon, label, isEarned = false, isGolden = false }: SBadgeProps) {
  return (
    <Animated.View
      entering={isEarned ? FadeIn.duration(300).springify() : undefined}
      style={{
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        backgroundColor: isEarned ? '#1A1A2E' : 'rgba(26,26,46,0.5)',
        opacity: isEarned ? 1 : 0.4,
      }}
    >
      {icon.startsWith('http') ? (
        <Image source={{ uri: icon }} style={{ width: 40, height: 40 }} contentFit="contain" />
      ) : (
        <Text style={{ fontSize: 32 }}>{icon}</Text>
      )}
      <Text
        style={{
          fontFamily: 'PlusJakartaSans-Medium',
          fontSize: 12,
          marginTop: 4,
          textAlign: 'center',
          color: isGolden ? '#F5C518' : '#FFFEF5',
        }}
        numberOfLines={2}
      >
        {label}
      </Text>
      {isGolden && isEarned && (
        <View
          style={{
            position: 'absolute',
            top: -4,
            right: -4,
            width: 16,
            height: 16,
            borderRadius: 9999,
            backgroundColor: '#F5C518',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 12 }}>✨</Text>
        </View>
      )}
    </Animated.View>
  );
}
