import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import * as Clipboard from 'expo-clipboard';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import SAvatar from '../../components/atoms/SAvatar';
import SButton from '../../components/atoms/SButton';
import SIcon from '../../components/atoms/SIcon';
import SCountryFlag from '../../components/atoms/SCountryFlag';
import { useAuthStore } from '../../stores/useAuthStore';
import { usePassportStore } from '../../stores/usePassportStore';
import { haptic } from '../../utils/haptics';

interface ProfileScreenProps {
  navigation?: NativeStackNavigationProp<any>;
}

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { t } = useTranslation();
  const { user, isMinor } = useAuthStore();
  const { stats } = usePassportStore();

  const copyRefCode = async () => {
    if (user?.ref_code) {
      await Clipboard.setStringAsync(user.ref_code);
      haptic.light();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0D0D1A' }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header — Settings icon */}
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 16, paddingTop: 8 }}>
          <Pressable
            onPress={() => navigation?.navigate('Settings')}
            style={{ padding: 8, minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' }}
          >
            <SIcon name="settings-outline" size={24} color="#FFFEF5" />
          </Pressable>
        </View>

        {/* Profile card — color header with user's profile_color */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          style={{
            margin: 16,
            borderRadius: 24,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: 'rgba(245,197,24,0.15)',
          }}
        >
          {/* Colored header band */}
          <View style={{ backgroundColor: user?.profile_color || '#F5C518', height: 80 }} />

          {/* Avatar — 120px, overlapping header */}
          <View style={{ alignItems: 'center', marginTop: -48 }}>
            <View style={{ borderRadius: 9999, borderWidth: 4, borderColor: '#0D0D1A' }}>
              <SAvatar uri={user?.avatar_url} size="lg" fallbackInitials={user?.name} borderColor={user?.profile_color || '#F5C518'} />
            </View>
          </View>

          <View style={{ backgroundColor: 'rgba(26,26,46,0.85)', paddingHorizontal: 24, paddingBottom: 24, paddingTop: 8, alignItems: 'center' }}>
            {/* Name + Level */}
            <Text style={{ fontFamily: 'PlusJakartaSans-Bold', fontSize: 24, color: '#FFFEF5' }}>
              {user?.name}
            </Text>
            <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 14, color: '#737373', marginTop: 2 }}>
              @{user?.username} {'\u{1F30D}'} Lv.{user?.level || 1}
            </Text>

            {/* Mood */}
            {user?.profile_mood && (
              <Text
                style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 14, color: '#FFFEF5', marginTop: 8, fontStyle: 'italic' }}
                numberOfLines={1}
              >
                "{user.profile_mood}"
              </Text>
            )}

            {/* Level badge */}
            <View
              style={{
                marginTop: 12,
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 9999,
                backgroundColor: 'rgba(245,197,24,0.15)',
              }}
            >
              <Text style={{ fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 14, color: '#F5C518' }}>
                {user?.passport_level_name}
              </Text>
            </View>

            {/* Top 3 pinned countries */}
            {user?.pinned_countries && user.pinned_countries.length > 0 && (
              <View style={{ flexDirection: 'row', marginTop: 12, gap: 8 }}>
                {user.pinned_countries.slice(0, 3).map((cc) => (
                  <View
                    key={cc}
                    style={{ width: 32, height: 32, borderRadius: 9999, borderWidth: 1, borderColor: '#404040', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <SCountryFlag countryCode={cc} size="sm" />
                  </View>
                ))}
              </View>
            )}

            {/* Stats — 4 counters */}
            <View style={{ flexDirection: 'row', marginTop: 20, gap: 16 }}>
              {[
                { value: user?.total_stamps || 0, label: t('passport.stamps', { count: user?.total_stamps || 0 }) },
                { value: stats.countries_visited, label: t('stamps.country') },
                { value: stats.cities_visited, label: t('passport.cities') },
                { value: stats.regions_visited, label: t('passport.regions') },
              ].map((s, i) => (
                <View key={i} style={{ alignItems: 'center' }}>
                  <Text style={{ fontFamily: 'PlusJakartaSans-Bold', fontSize: 20, color: i === 0 ? '#F5C518' : '#FFFEF5' }}>
                    {s.value}
                  </Text>
                  <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, color: '#737373' }}>
                    {s.label}
                  </Text>
                </View>
              ))}
            </View>

            {/* Invite button — prominent */}
            <View style={{ width: '100%', marginTop: 20 }}>
              <SButton variant="primary" size="md" onPress={() => { haptic.light(); }}>
                {t('profile.inviteFriends')}
              </SButton>
            </View>

            {/* Referral counter */}
            {(user?.referral_count ?? 0) > 0 && (
              <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, color: '#737373', marginTop: 8 }}>
                {t('profile.friendsInvited', { count: user?.referral_count })}
              </Text>
            )}
          </View>
        </Animated.View>

        {/* Info cards */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={{ marginHorizontal: 16, gap: 8 }}>
          {/* Username */}
          <View style={{ backgroundColor: '#1A1A2E', borderRadius: 16, padding: 16 }}>
            <Text style={{ fontFamily: 'PlusJakartaSans-Medium', fontSize: 12, color: '#737373' }}>
              {t('profile.username')}
            </Text>
            <Text style={{ fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 16, color: '#FFFEF5', marginTop: 4 }}>
              @{user?.username}
            </Text>
            <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, color: '#737373', marginTop: 2 }}>
              {t('profile.usernameHint')}
            </Text>
          </View>

          {/* Referral code */}
          <Pressable
            onPress={copyRefCode}
            style={{ backgroundColor: '#1A1A2E', borderRadius: 16, padding: 16, minHeight: 48 }}
          >
            <Text style={{ fontFamily: 'PlusJakartaSans-Medium', fontSize: 12, color: '#737373' }}>
              {t('profile.referralCode')}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <Text style={{ fontFamily: 'PlusJakartaSans-Bold', fontSize: 18, color: '#F5C518', flex: 1, letterSpacing: 2 }}>
                {user?.ref_code}
              </Text>
              <SIcon name="copy-outline" size={20} color="#737373" />
            </View>
          </Pressable>

          {/* Invisible mode (minors) */}
          {isMinor && (
            <View style={{ backgroundColor: 'rgba(0,212,255,0.1)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(0,212,255,0.2)' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <SIcon name="eye-off-outline" size={20} color="#00D4FF" />
                <Text style={{ fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 14, color: '#00D4FF' }}>
                  {t('profile.invisibleMode')}
                </Text>
              </View>
              <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, color: '#737373', marginTop: 4 }}>
                {t('profile.invisibleMinor')}
              </Text>
            </View>
          )}

          {/* Member since */}
          <View style={{ backgroundColor: '#1A1A2E', borderRadius: 16, padding: 16 }}>
            <Text style={{ fontFamily: 'PlusJakartaSans-Medium', fontSize: 12, color: '#737373' }}>
              {t('profile.memberSince')}
            </Text>
            <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 16, color: '#FFFEF5', marginTop: 4 }}>
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
            </Text>
          </View>
        </Animated.View>

        {/* Empty state for gallery (new user) */}
        {(user?.total_stamps ?? 0) === 0 && (
          <Animated.View entering={FadeInDown.delay(300).duration(400)} style={{ margin: 16, padding: 32, alignItems: 'center' }}>
            <Text style={{ fontSize: 48 }}>{'\u{1F30D}'}</Text>
            <Text style={{ fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 16, color: '#FFFEF5', marginTop: 12, textAlign: 'center' }}>
              {t('profile.exploreToFill')}
            </Text>
            <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 14, color: '#737373', marginTop: 4, textAlign: 'center' }}>
              {t('profile.stampsBadgesAppear')}
            </Text>
          </Animated.View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
