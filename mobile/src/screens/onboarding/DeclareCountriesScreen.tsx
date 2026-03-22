import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import SButton from '../../components/atoms/SButton';
import { countryFlag } from '../../utils/helpers';
import { haptic } from '../../utils/haptics';
import { useDeclareCountries } from '../../hooks/usePassport';
import { usePassportStore } from '../../stores/usePassportStore';
import type { StampSource } from '../../types';

// ISO 3166-1 alpha-2 — 193 UN member states
const ALL_COUNTRIES = [
  'AF','AL','DZ','AD','AO','AG','AR','AM','AU','AT','AZ','BS','BH','BD','BB','BY','BE','BZ','BJ','BT',
  'BO','BA','BW','BR','BN','BG','BF','BI','CV','KH','CM','CA','CF','TD','CL','CN','CO','KM','CG','CD',
  'CR','CI','HR','CU','CY','CZ','DK','DJ','DM','DO','EC','EG','SV','GQ','ER','EE','SZ','ET','FJ','FI',
  'FR','GA','GM','GE','DE','GH','GR','GD','GT','GN','GW','GY','HT','HN','HU','IS','IN','ID','IR','IQ',
  'IE','IL','IT','JM','JP','JO','KZ','KE','KI','KP','KR','KW','KG','LA','LV','LB','LS','LR','LY','LI',
  'LT','LU','MG','MW','MY','MV','ML','MT','MH','MR','MU','MX','FM','MD','MC','MN','ME','MA','MZ','MM',
  'NA','NR','NP','NL','NZ','NI','NE','NG','MK','NO','OM','PK','PW','PA','PG','PY','PE','PH','PL','PT',
  'QA','RO','RU','RW','KN','LC','VC','WS','SM','ST','SA','SN','RS','SC','SL','SG','SK','SI','SB','SO',
  'ZA','SS','ES','LK','SD','SR','SE','CH','SY','TJ','TZ','TH','TL','TG','TO','TT','TN','TR','TM','TV',
  'UG','UA','AE','GB','US','UY','UZ','VU','VE','VN','YE','ZM','ZW',
];

interface DeclareCountriesScreenProps {
  navigation: NativeStackNavigationProp<any>;
  route?: RouteProp<any>;
}

export default function DeclareCountriesScreen({ navigation, route }: DeclareCountriesScreenProps) {
  const { t } = useTranslation();
  const isOnboarding = route?.params?.isOnboarding ?? false;
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const declareCountries = useDeclareCountries();
  const { stampedCountries } = usePassportStore();

  // Countries already stamped (GPS, imported, or declared) — non-selectable
  const existingCountries = useMemo(() => {
    const map = new Map<string, StampSource>();
    stampedCountries.forEach((sc) => map.set(sc.country_code, sc.source));
    return map;
  }, [stampedCountries]);

  const toggleCountry = useCallback((code: string) => {
    if (existingCountries.has(code)) return;
    haptic.light();
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  }, [existingCountries]);

  const handleConfirm = async () => {
    if (selected.size === 0) return;
    haptic.medium();

    declareCountries.mutate(Array.from(selected), {
      onSuccess: () => {
        if (isOnboarding) {
          navigation.replace('Main');
        } else {
          navigation.goBack();
        }
      },
    });
  };

  const handleSkip = () => {
    haptic.light();
    if (isOnboarding) {
      navigation.replace('Main');
    } else {
      navigation.goBack();
    }
  };

  const renderCountry = useCallback(({ item }: { item: string }) => {
    const existing = existingCountries.get(item);
    const isSelected = selected.has(item);
    const isDisabled = !!existing;
    const isGps = existing === 'gps' || existing === 'imported';
    const isDeclared = existing === 'declared';

    return (
      <Pressable
        onPress={() => toggleCountry(item)}
        disabled={isDisabled}
        style={{
          width: 48,
          height: 48,
          alignItems: 'center',
          justifyContent: 'center',
          margin: 4,
          borderRadius: 9999,
          backgroundColor: isSelected
            ? 'rgba(245,197,24,0.2)'
            : isGps
              ? 'rgba(245,197,24,0.1)'
              : isDeclared
                ? 'rgba(245,197,24,0.05)'
                : 'rgba(26,26,46,0.4)',
          borderWidth: isSelected ? 2 : isGps ? 1.5 : isDeclared ? 1 : 0,
          borderColor: isSelected ? '#F5C518' : isGps ? '#F5C518' : isDeclared ? 'rgba(245,197,24,0.4)' : 'transparent',
          opacity: isDisabled ? 0.6 : 1,
        }}
      >
        <Text style={{
          fontSize: 24,
          opacity: isGps ? 1 : isDeclared ? 0.4 : isSelected ? 1 : 0.35,
        }}>
          {countryFlag(item)}
        </Text>
        {isGps && (
          <Text style={{ fontSize: 10, position: 'absolute', bottom: 1, right: 4, color: '#F5C518' }}>
            {'\u2713'}
          </Text>
        )}
        {isDeclared && (
          <Text style={{ fontSize: 10, position: 'absolute', bottom: 1, right: 4, opacity: 0.5 }}>
            {'\u2708\uFE0F'}
          </Text>
        )}
      </Pressable>
    );
  }, [selected, existingCountries, toggleCountry]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0D0D1A' }}>
      {/* Header */}
      <Animated.View entering={FadeInDown.delay(100).duration(400)} style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
        <Text style={{ fontFamily: 'PlusJakartaSans-Bold', fontSize: 24, color: '#FFFEF5', textAlign: 'center' }}>
          {t('declare.title')}
        </Text>
        <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 14, color: '#737373', textAlign: 'center', marginTop: 6 }}>
          {t('declare.subtitle')}
        </Text>
      </Animated.View>

      {/* Counter */}
      {selected.size > 0 && (
        <Animated.View entering={FadeInDown.duration(200)} style={{ alignItems: 'center', paddingVertical: 8 }}>
          <Text style={{ fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 16, color: '#F5C518' }}>
            {t('declare.selected', { count: selected.size })}
          </Text>
        </Animated.View>
      )}

      {/* Grid */}
      <FlatList
        data={ALL_COUNTRIES}
        renderItem={renderCountry}
        keyExtractor={(item) => item}
        numColumns={5}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{ justifyContent: 'center' }}
      />

      {/* Bottom CTA */}
      <View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 40,
        backgroundColor: 'rgba(13,13,26,0.95)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(245,197,24,0.1)',
        gap: 8,
      }}>
        {selected.size > 0 && (
          <SButton
            variant="primary"
            size="lg"
            onPress={handleConfirm}
            loading={declareCountries.isPending}
          >
            {t('common.confirm')} ({selected.size})
          </SButton>
        )}
        <SButton variant="ghost" size="lg" onPress={handleSkip}>
          {isOnboarding ? t('declare.later') : t('common.back')}
        </SButton>
      </View>
    </SafeAreaView>
  );
}
