import React from 'react';
import { View, Text } from 'react-native';

interface SStreakBadgeProps {
  streak: number;
  size?: 'sm' | 'md';
}

export default function SStreakBadge({ streak, size = 'md' }: SStreakBadgeProps) {
  if (streak <= 0) return null;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(245,197,24,0.15)',
        paddingHorizontal: size === 'sm' ? 8 : 12,
        paddingVertical: size === 'sm' ? 2 : 4,
        borderRadius: 9999,
        gap: 4,
      }}
    >
      <Text style={{ fontSize: size === 'sm' ? 12 : 16 }}>{'\u{1F525}'}</Text>
      <Text
        style={{
          fontFamily: 'PlusJakartaSans-Bold',
          fontSize: size === 'sm' ? 12 : 14,
          color: '#F5C518',
        }}
      >
        {streak}
      </Text>
    </View>
  );
}
