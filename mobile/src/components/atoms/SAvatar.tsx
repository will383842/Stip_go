import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import SSkeleton from './SSkeleton';

interface SAvatarProps {
  uri?: string | null;
  size?: 'sm' | 'md' | 'lg';
  fallbackInitials?: string;
  borderColor?: string;
}

const sizes = {
  sm: { container: 32, text: 12 },
  md: { container: 48, text: 18 },
  lg: { container: 64, text: 24 },
};

export default function SAvatar({
  uri,
  size = 'md',
  fallbackInitials,
  borderColor = '#F5C518',
}: SAvatarProps) {
  const [loading, setLoading] = useState(!!uri);
  const [error, setError] = useState(false);
  const s = sizes[size];

  if (uri && !error) {
    return (
      <View style={{ width: s.container, height: s.container, borderRadius: 9999 }}>
        {loading && (
          <SSkeleton width={s.container} height={s.container} borderRadius={9999} />
        )}
        <Image
          source={{ uri }}
          style={{
            width: s.container,
            height: s.container,
            borderRadius: 9999,
            borderWidth: 2,
            borderColor,
            position: loading ? 'absolute' : 'relative',
          }}
          onLoad={() => setLoading(false)}
          onError={() => { setError(true); setLoading(false); }}
          contentFit="cover"
          transition={200}
        />
      </View>
    );
  }

  return (
    <View
      style={{
        width: s.container,
        height: s.container,
        borderRadius: 9999,
        borderWidth: 2,
        borderColor,
        backgroundColor: '#1A1A2E',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: s.text, color: '#F5C518', fontFamily: 'PlusJakartaSans-Bold' }}>
        {fallbackInitials?.slice(0, 2).toUpperCase() || '?'}
      </Text>
    </View>
  );
}
