import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { usePassportData } from '../../hooks/usePassport';
import { useAuthStore } from '../../stores/useAuthStore';
import { usePassportStore } from '../../stores/usePassportStore';
import SAvatar from '../../components/atoms/SAvatar';
import SSkeleton from '../../components/atoms/SSkeleton';
import { SBadge } from '../../components/atoms';
import { SStampCard } from '../../components/molecules';
import { SWorldMap, SPassportGrid } from '../../components/organisms';
import { haptic } from '../../utils/haptics';
import type { Stamp, StampType } from '../../types';

type StampFilter = 'all' | StampType;

interface PassportScreenProps {
  navigation?: NativeStackNavigationProp<any>;
}

const STAMP_TABS: { key: StampFilter; label: string }[] = [
  { key: 'all', label: 'Tous' },
  { key: 'country', label: 'Pays' },
  { key: 'region', label: 'Regions' },
  { key: 'city', label: 'Villes' },
  { key: 'spot', label: 'Spots' },
];

export default function PassportScreen({ navigation }: PassportScreenProps) {
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();
  const { stamps, stampedCountries, badges, stats, currentLevel, nextLevel } = usePassportStore();
  const { isLoading, refetch, isRefetching } = usePassportData();
  const [activeFilter, setActiveFilter] = useState<StampFilter>('all');

  const lang = i18n.language;

  const filteredStamps = useMemo(() => {
    if (activeFilter === 'all') return stamps;
    return stamps.filter((s) => s.stamp_type === activeFilter);
  }, [stamps, activeFilter]);

  const handleStampPress = (stamp: Stamp) => {
    navigation?.navigate('StampDetail', { stamp });
  };

  const handleCountryPress = (countryCode: string) => {
    // Could navigate to country detail or filter stamps
  };

  const handleDeclarePress = () => {
    haptic.light();
    navigation?.navigate('DeclareCountries', { isOnboarding: false });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0D0D1A' }}>
        <View style={{ padding: 24, gap: 16 }}>
          <SSkeleton width="100%" height={120} borderRadius={16} />
          <SSkeleton width="100%" height={80} borderRadius={16} />
          <SSkeleton width="100%" height={200} borderRadius={16} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0D0D1A' }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#F5C518" />}
      >
        {/* Header — profile + level */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          style={{
            margin: 16,
            padding: 20,
            borderRadius: 24,
            backgroundColor: 'rgba(26,26,46,0.85)',
            borderWidth: 1,
            borderColor: 'rgba(245,197,24,0.15)',
            alignItems: 'center',
          }}
        >
          <SAvatar uri={user?.avatar_url} size="lg" fallbackInitials={user?.name} />
          <Text style={{ fontFamily: 'PlusJakartaSans-Bold', fontSize: 20, color: '#FFFEF5', marginTop: 12 }}>
            {user?.name}
          </Text>
          <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 14, color: '#737373', marginTop: 2 }}>
            @{user?.username}
          </Text>

          {/* Level badge */}
          {currentLevel && (
            <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 14, color: '#F5C518' }}>
                {currentLevel.name[lang] || currentLevel.name.en}
              </Text>
              <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, color: '#737373' }}>
                Lv.{currentLevel.level}
              </Text>
            </View>
          )}

          {/* Total stamps — hero counter 40px */}
          <Text style={{ fontFamily: 'PlusJakartaSans-Bold', fontSize: 40, color: '#F5C518', marginTop: 8 }}>
            {stats.total_stamps}
          </Text>
          <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 14, color: '#737373' }}>
            stamps
          </Text>

          {/* Next level progress */}
          {nextLevel && (
            <View style={{ width: '100%', marginTop: 16 }}>
              <View style={{ height: 4, borderRadius: 2, backgroundColor: '#404040' }}>
                <View
                  style={{
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: '#F5C518',
                    width: `${Math.min((stats.total_stamps / nextLevel.min_stamps) * 100, 100)}%`,
                  }}
                />
              </View>
              <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, color: '#737373', marginTop: 4 }}>
                {t('passport.nextLevel', { name: nextLevel.name[lang] || nextLevel.name.en, stamps: nextLevel.min_stamps })}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* World Map + declare button */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={{ marginHorizontal: 16, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 18, color: '#FFFEF5' }}>
              {t('passport.worldMap')}
            </Text>
            <Pressable
              onPress={handleDeclarePress}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 9999,
                backgroundColor: 'rgba(245,197,24,0.1)',
                borderWidth: 1,
                borderColor: 'rgba(245,197,24,0.3)',
              }}
            >
              <Text style={{ fontSize: 14 }}>{'\u2708\uFE0F'}</Text>
              <Text style={{ fontFamily: 'PlusJakartaSans-Medium', fontSize: 12, color: '#F5C518' }}>
                {t('declare.addPastTrips')}
              </Text>
            </Pressable>
          </View>
          <SWorldMap stampedCountries={stampedCountries} />
        </Animated.View>

        {/* Stats grid — with verified/declared breakdown */}
        <Animated.View entering={FadeInDown.delay(250).duration(400)} style={{ marginHorizontal: 16, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {[
              {
                label: t('passport.countries', { count: stats.countries_visited }),
                value: stats.countries_visited,
                subtitle: stats.verified_countries > 0 && stats.declared_countries > 0
                  ? t('declare.verifiedCount', { count: stats.verified_countries })
                  : undefined,
              },
              { label: t('passport.cities'), value: stats.cities_visited },
              { label: t('passport.regions'), value: stats.regions_visited },
              { label: t('passport.spots'), value: stats.spots_visited },
              { label: t('passport.daysActive'), value: stats.days_active },
            ].map((stat, i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  minWidth: '30%',
                  backgroundColor: '#1A1A2E',
                  borderRadius: 12,
                  padding: 12,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontFamily: 'PlusJakartaSans-Bold', fontSize: 20, color: '#F5C518' }}>
                  {stat.value}
                </Text>
                <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, color: '#737373', marginTop: 2 }}>
                  {stat.label}
                </Text>
                {stat.subtitle && (
                  <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 10, color: '#737373', marginTop: 1 }}>
                    {stat.subtitle}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Stamp filter tabs (Tous / Pays / Regions / Villes / Spots) */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={{ marginHorizontal: 16, marginBottom: 16 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, marginBottom: 12 }}
          >
            {STAMP_TABS.map((tab) => (
              <Pressable
                key={tab.key}
                onPress={() => { setActiveFilter(tab.key); haptic.light(); }}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 9999,
                  backgroundColor: activeFilter === tab.key ? '#F5C518' : '#1A1A2E',
                  borderWidth: 1,
                  borderColor: activeFilter === tab.key ? '#F5C518' : '#404040',
                }}
              >
                <Text
                  style={{
                    fontFamily: 'PlusJakartaSans-Medium',
                    fontSize: 14,
                    color: activeFilter === tab.key ? '#1A1A2E' : '#FFFEF5',
                  }}
                >
                  {tab.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {filteredStamps.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 32 }}>
              <Text style={{ fontSize: 48 }}>{'\u{1F30D}'}</Text>
              <Text style={{ fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 16, color: '#FFFEF5', marginTop: 12, textAlign: 'center' }}>
                {t('passport.countriesAwait')}
              </Text>
              <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 14, color: '#737373', marginTop: 4, textAlign: 'center' }}>
                {t('passport.firstStampNearby')}
              </Text>
            </View>
          ) : (
            <View style={{ gap: 8 }}>
              {filteredStamps.slice(0, 20).map((stamp) => (
                <SStampCard key={stamp.id} stamp={stamp} onPress={handleStampPress} />
              ))}
            </View>
          )}
        </Animated.View>

        {/* Badges */}
        <Animated.View entering={FadeInDown.delay(350).duration(400)} style={{ marginHorizontal: 16, marginBottom: 32 }}>
          <Text style={{ fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 18, color: '#FFFEF5', marginBottom: 12 }}>
            {t('passport.badges')}
          </Text>
          {badges.length === 0 ? (
            <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 14, color: '#737373' }}>
              {t('passport.noBadges')}
            </Text>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {badges.map((ub, i) => (
                <SBadge
                  key={i}
                  icon={ub.badge.icon_url || '\u{1F3C5}'}
                  label={ub.badge.name[lang] || ub.badge.name.en || ub.badge.code}
                  isEarned
                  isGolden={ub.is_pinned}
                />
              ))}
            </View>
          )}
        </Animated.View>

        {/* 193 countries grid */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)} style={{ marginHorizontal: 16, marginBottom: 32 }}>
          <Text style={{ fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 18, color: '#FFFEF5', marginBottom: 12 }}>
            {t('passport.allStamps')}
          </Text>
          <SPassportGrid stampedCountries={stampedCountries} onStampPress={handleCountryPress} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
