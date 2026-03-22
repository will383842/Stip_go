import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { StampedCountry } from '../../types';

interface SWorldMapProps {
  stampedCountries: string[] | StampedCountry[];
  totalCountries?: number;
}

// Simplified world map representation using country flags in a grid
// A proper SVG world map would require a large path data file
// This is a visual placeholder that shows stamped vs total countries
export default function SWorldMap({ stampedCountries, totalCountries = 193 }: SWorldMapProps) {
  const { t } = useTranslation();

  // Support both string[] (legacy) and StampedCountry[] (new)
  const isTyped = stampedCountries.length > 0 && typeof stampedCountries[0] === 'object';
  const total = stampedCountries.length;
  const verifiedCount = isTyped
    ? (stampedCountries as StampedCountry[]).filter((sc) => sc.source === 'gps' || sc.source === 'imported').length
    : total;
  const declaredCount = isTyped
    ? (stampedCountries as StampedCountry[]).filter((sc) => sc.source === 'declared').length
    : 0;

  const percentage = Math.round((total / totalCountries) * 100);
  const verifiedPercentage = Math.round((verifiedCount / totalCountries) * 100);

  return (
    <View
      style={{
        backgroundColor: 'rgba(26,26,46,0.6)',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
      }}
    >
      {/* Globe icon */}
      <Text style={{ fontSize: 48 }}>{'\u{1F30D}'}</Text>

      {/* Stats */}
      <Text
        style={{
          fontFamily: 'PlusJakartaSans-Bold',
          fontSize: 24,
          color: '#F5C518',
          marginTop: 12,
        }}
      >
        {total}/{totalCountries}
      </Text>

      {/* Breakdown: "dont X vérifiés" in smaller grey */}
      {declaredCount > 0 && (
        <Text
          style={{
            fontFamily: 'PlusJakartaSans-Regular',
            fontSize: 12,
            color: '#737373',
            marginTop: 2,
          }}
        >
          {t('declare.verifiedCount', { count: verifiedCount })}
        </Text>
      )}

      <Text
        style={{
          fontFamily: 'PlusJakartaSans-Regular',
          fontSize: 14,
          color: '#737373',
          marginTop: 4,
        }}
      >
        {percentage}% du monde exploré
      </Text>

      {/* Progress bar — verified (gold) + declared (gold semi-transparent) */}
      <View
        style={{
          width: '100%',
          height: 6,
          borderRadius: 3,
          backgroundColor: '#404040',
          marginTop: 12,
          overflow: 'hidden',
        }}
      >
        {/* Verified portion (solid gold) */}
        <View
          style={{
            width: `${verifiedPercentage}%`,
            height: 6,
            borderRadius: 3,
            backgroundColor: '#F5C518',
            position: 'absolute',
            left: 0,
          }}
        />
        {/* Total portion including declared (semi-transparent gold) */}
        {declaredCount > 0 && (
          <View
            style={{
              width: `${percentage}%`,
              height: 6,
              borderRadius: 3,
              backgroundColor: 'rgba(245,197,24,0.3)',
            }}
          />
        )}
      </View>
    </View>
  );
}
