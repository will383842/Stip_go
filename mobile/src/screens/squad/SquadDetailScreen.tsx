import React from 'react';
import { View, Text, ScrollView, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useSquadDetail, useSquadLeaderboard } from '../../hooks/useSquad';
import SAvatar from '../../components/atoms/SAvatar';
import SIcon from '../../components/atoms/SIcon';
import SStreakBadge from '../../components/atoms/SStreakBadge';
import SSkeleton from '../../components/atoms/SSkeleton';
import SButton from '../../components/atoms/SButton';
import { haptic } from '../../utils/haptics';
import * as Clipboard from 'expo-clipboard';

interface SquadDetailScreenProps {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<{ SquadDetail: { squadId: string } }, 'SquadDetail'>;
}

export default function SquadDetailScreen({ navigation, route }: SquadDetailScreenProps) {
  const { t } = useTranslation();
  const { squadId } = route.params;
  const { data: squad, isLoading } = useSquadDetail(squadId);
  const { data: leaderboard } = useSquadLeaderboard(squadId);

  const copyInviteCode = async () => {
    if (squad?.invite_code) {
      await Clipboard.setStringAsync(squad.invite_code);
      haptic.light();
    }
  };

  if (isLoading || !squad) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0D0D1A' }}>
        <View style={{ padding: 16, gap: 16 }}>
          <SSkeleton width="100%" height={120} borderRadius={16} />
          <SSkeleton width="100%" height={200} borderRadius={16} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0D0D1A' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8 }}>
        <Pressable onPress={() => navigation.goBack()} style={{ padding: 8, minWidth: 48, minHeight: 48, justifyContent: 'center' }}>
          <SIcon name="arrow-back" size={24} color="#FFFEF5" />
        </Pressable>
        <Text style={{ fontSize: 24, marginLeft: 4 }}>{squad.emoji}</Text>
        <Text style={{ fontFamily: 'PlusJakartaSans-Bold', fontSize: 20, color: '#FFFEF5', marginLeft: 8, flex: 1 }}>
          {squad.name}
        </Text>
        <SStreakBadge streak={squad.current_streak} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stats card */}
        <View style={{ margin: 16, padding: 20, backgroundColor: '#1A1A2E', borderRadius: 24, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', gap: 24 }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontFamily: 'PlusJakartaSans-Bold', fontSize: 28, color: '#F5C518' }}>
                {squad.total_stamps}
              </Text>
              <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, color: '#737373' }}>{t('squad.stamps')}</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontFamily: 'PlusJakartaSans-Bold', fontSize: 28, color: '#FFFEF5' }}>
                {squad.member_count}/8
              </Text>
              <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, color: '#737373' }}>{t('squad.members')}</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontFamily: 'PlusJakartaSans-Bold', fontSize: 28, color: '#FFFEF5' }}>
                {squad.max_streak}
              </Text>
              <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, color: '#737373' }}>{t('squad.streak')}</Text>
            </View>
          </View>

          {/* Invite code */}
          <Pressable
            onPress={copyInviteCode}
            style={{
              marginTop: 16,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(245,197,24,0.1)',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 9999,
              gap: 8,
            }}
          >
            <Text style={{ fontFamily: 'PlusJakartaSans-Bold', fontSize: 16, color: '#F5C518', letterSpacing: 2 }}>
              {squad.invite_code}
            </Text>
            <SIcon name="copy-outline" size={16} color="#F5C518" />
          </Pressable>
        </View>

        {/* Members */}
        <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
          <Text style={{ fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 18, color: '#FFFEF5', marginBottom: 12 }}>
            {t('squad.members')}
          </Text>
          {squad.members?.map((member) => (
            <View
              key={member.user_id}
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}
            >
              <View style={{ borderRadius: 9999, borderWidth: 2, borderColor: member.color }}>
                <SAvatar uri={member.user?.avatar_url} size="sm" fallbackInitials={member.user?.name} borderColor={member.color} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 14, color: '#FFFEF5' }}>
                  {member.user?.name || 'Membre'}
                  {member.role === 'creator' && ' 👑'}
                </Text>
                <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, color: '#737373' }}>
                  {member.weekly_stamps} {t('squad.stamps')} / {t('squad.leaderboard').toLowerCase()}
                </Text>
              </View>
              <Text style={{ fontFamily: 'PlusJakartaSans-Bold', fontSize: 16, color: member.color }}>
                {member.total_stamps}
              </Text>
            </View>
          ))}
        </View>

        {/* Leaderboard */}
        {leaderboard && leaderboard.length > 0 && (
          <View style={{ marginHorizontal: 16, marginBottom: 32 }}>
            <Text style={{ fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 18, color: '#FFFEF5', marginBottom: 12 }}>
              {t('squad.leaderboard')}
            </Text>
            {leaderboard.map((member, i) => (
              <View key={member.user_id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6 }}>
                <Text style={{ fontFamily: 'PlusJakartaSans-Bold', fontSize: 16, color: i < 3 ? '#F5C518' : '#737373', width: 28 }}>
                  #{i + 1}
                </Text>
                <View style={{ flex: 1, height: 24, borderRadius: 12, backgroundColor: '#404040', overflow: 'hidden' }}>
                  <View
                    style={{
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: member.color,
                      width: `${Math.min((member.weekly_stamps / Math.max(...leaderboard.map((m) => m.weekly_stamps), 1)) * 100, 100)}%`,
                      alignItems: 'flex-end',
                      justifyContent: 'center',
                      paddingRight: 8,
                    }}
                  >
                    <Text style={{ fontFamily: 'PlusJakartaSans-Bold', fontSize: 12, color: '#0D0D1A' }}>
                      {member.weekly_stamps}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
