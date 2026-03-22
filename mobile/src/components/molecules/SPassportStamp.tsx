import React from 'react';
import { View, Text } from 'react-native';
import { stampIcon, countryFlag } from '../../utils/helpers';
import type { StampType, StampSource } from '../../types';

interface SPassportStampProps {
  stampType: StampType;
  name: string;
  countryCode: string;
  source?: StampSource;
  isGolden?: boolean;
}

export default function SPassportStamp({ stampType, name, countryCode, source = 'gps', isGolden = false }: SPassportStampProps) {
  const isDeclared = source === 'declared';

  return (
    <View
      style={{
        alignItems: 'center',
        padding: 8,
        borderRadius: 12,
        borderWidth: isGolden ? 1.5 : 1,
        borderColor: isGolden ? '#F5C518' : isDeclared ? 'rgba(64,64,64,0.5)' : '#404040',
        borderStyle: isDeclared ? 'dashed' : 'solid',
        backgroundColor: 'rgba(26,26,46,0.6)',
        minWidth: 80,
        opacity: isDeclared ? 0.5 : 1,
      }}
    >
      <Text style={{ fontSize: 20, opacity: isDeclared ? 0.4 : 1 }}>{countryFlag(countryCode)}</Text>
      <Text style={{ fontSize: 16, marginTop: 2, opacity: isDeclared ? 0.4 : 1 }}>{stampIcon(stampType)}</Text>
      <Text
        style={{
          fontFamily: 'PlusJakartaSans-Medium',
          fontSize: 12,
          color: isGolden ? '#F5C518' : isDeclared ? '#A0A0A0' : '#FFFEF5',
          marginTop: 4,
          textAlign: 'center',
        }}
        numberOfLines={2}
      >
        {name}
      </Text>
      {isDeclared && (
        <Text style={{ fontSize: 10, color: '#737373', marginTop: 2 }}>{'\u2708\uFE0F'} Non verifie</Text>
      )}
    </View>
  );
}
