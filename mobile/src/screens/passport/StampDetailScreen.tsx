import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import SButton from '../../components/atoms/SButton';
import SCountryFlag from '../../components/atoms/SCountryFlag';
import { stampIcon } from '../../utils/helpers';
import type { Stamp } from '../../types';

interface StampDetailScreenProps {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<{ StampDetail: { stamp: Stamp } }, 'StampDetail'>;
}

function stampDisplayName(stamp: Stamp): string {
  switch (stamp.stamp_type) {
    case 'spot': return stamp.spot_name || 'Spot';
    case 'city': return stamp.city_name || 'City';
    case 'region': return stamp.region_name || 'Region';
    case 'country': return stamp.country_code.toUpperCase();
    default: return 'Stamp';
  }
}

export default function StampDetailScreen({ navigation, route }: StampDetailScreenProps) {
  const { t } = useTranslation();
  const { stamp } = route.params;

  const handleExport = () => {
    navigation.navigate('Export', { stamp });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0D0D1A' }}>
      <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'center', alignItems: 'center' }}>
        {/* Country flag */}
        <SCountryFlag countryCode={stamp.country_code} size="lg" />

        {/* Stamp icon */}
        <Text style={{ fontSize: 56, marginTop: 16 }}>{stampIcon(stamp.stamp_type)}</Text>

        {/* Name */}
        <Text
          style={{
            fontFamily: 'PlusJakartaSans-Bold',
            fontSize: 28,
            color: stamp.is_golden ? '#F5C518' : '#FFFEF5',
            marginTop: 16,
            textAlign: 'center',
          }}
        >
          {stampDisplayName(stamp)}
        </Text>

        {/* Type */}
        <Text
          style={{
            fontFamily: 'PlusJakartaSans-Medium',
            fontSize: 14,
            color: '#737373',
            marginTop: 4,
            textTransform: 'uppercase',
            letterSpacing: 2,
          }}
        >
          {stamp.stamp_type}
        </Text>

        {/* Date */}
        <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 14, color: '#737373', marginTop: 16 }}>
          {t('stamps.stampedAt', { date: new Date(stamp.stamped_at).toLocaleDateString() })}
        </Text>

        {/* Visits */}
        {stamp.visits_count > 1 && (
          <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 14, color: '#00D4FF', marginTop: 4 }}>
            {t('stamps.visits', { count: stamp.visits_count })}
          </Text>
        )}

        {/* Golden badge */}
        {stamp.is_golden && (
          <View
            style={{
              marginTop: 12,
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 9999,
              backgroundColor: 'rgba(245,197,24,0.15)',
            }}
          >
            <Text style={{ fontFamily: 'PlusJakartaSans-Medium', fontSize: 12, color: '#F5C518' }}>
              {t('stamps.golden')}
            </Text>
          </View>
        )}

        {/* Category */}
        {stamp.spot_category && (
          <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, color: '#737373', marginTop: 8 }}>
            {stamp.spot_category}
          </Text>
        )}
      </View>

      {/* Export button */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 24 }}>
        <SButton variant="primary" size="lg" onPress={handleExport}>
          {t('passport.export')}
        </SButton>
      </View>
    </SafeAreaView>
  );
}
