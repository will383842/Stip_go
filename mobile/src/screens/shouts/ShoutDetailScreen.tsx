import React from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useShoutDetail, useJoinShout } from '../../hooks/useShouts';
import SAvatar from '../../components/atoms/SAvatar';
import SCountdown from '../../components/atoms/SCountdown';
import SButton from '../../components/atoms/SButton';
import { haptic } from '../../utils/haptics';
import { useTranslation } from 'react-i18next';
import type { ShoutParticipant } from '../../types';

interface ShoutDetailScreenProps {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<{ ShoutDetail: { shoutId: string } }, 'ShoutDetail'>;
}

export default function ShoutDetailScreen({ navigation, route }: ShoutDetailScreenProps) {
  const { t } = useTranslation();
  const { shoutId } = route.params;
  const { data: shout, isLoading } = useShoutDetail(shoutId);
  const joinShout = useJoinShout();

  const handleJoin = () => {
    haptic.medium();
    joinShout.mutate(shoutId);
  };

  if (isLoading || !shout) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0D0D1A', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 16, color: '#737373' }}>
          {t('common.loading') || 'Chargement...'}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0D0D1A' }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: '#1A1A2E',
        }}
      >
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#FFFEF5" />
        </Pressable>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 16, color: '#FFFEF5' }}>
            {shout.user?.name || 'Voyageur'}
          </Text>
        </View>
        <SCountdown expiresAt={shout.expires_at} />
      </View>

      {/* Shout content */}
      <Animated.View entering={FadeInDown.duration(300)} style={{ padding: 16 }}>
        <Text
          style={{
            fontFamily: 'PlusJakartaSans-Regular',
            fontSize: 22,
            color: '#FFFEF5',
            lineHeight: 30,
            marginBottom: 24,
          }}
        >
          {shout.message}
        </Text>

        {/* Creator */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
          <SAvatar uri={shout.user?.avatar_url} size="md" fallbackInitials={shout.user?.name} />
          <View style={{ marginLeft: 12 }}>
            <Text style={{ fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 16, color: '#FFFEF5' }}>
              {shout.user?.name}
            </Text>
            <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 13, color: '#737373' }}>
              @{shout.user?.username}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: '#1A1A2E',
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
          }}
        >
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontFamily: 'PlusJakartaSans-Bold', fontSize: 24, color: '#00D4FF' }}>
              {shout.participants_count}
            </Text>
            <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, color: '#737373' }}>
              {t('shouts.participants', { count: shout.participants_count })}
            </Text>
          </View>
          <View style={{ width: 1, backgroundColor: '#404040' }} />
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontFamily: 'PlusJakartaSans-Bold', fontSize: 24, color: '#F5C518' }}>
              {shout.radius_meters}m
            </Text>
            <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, color: '#737373' }}>
              {t('shouts.remaining')}
            </Text>
          </View>
        </View>

        {/* Join button */}
        <SButton variant="primary" size="lg" onPress={handleJoin} disabled={joinShout.isPending}>
          {t('shouts.join')}
        </SButton>
      </Animated.View>

      {/* Participants list */}
      {shout.participants && shout.participants.length > 0 && (
        <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
          <Text
            style={{
              fontFamily: 'PlusJakartaSans-SemiBold',
              fontSize: 14,
              color: '#737373',
              marginBottom: 12,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            {t('shouts.participants', { count: shout.participants_count })}
          </Text>
          <FlatList
            data={shout.participants}
            keyExtractor={(item) => item.user_id}
            renderItem={({ item }) => (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <SAvatar uri={item.user?.avatar_url} size="sm" fallbackInitials={item.user?.name} />
                <Text
                  style={{
                    fontFamily: 'PlusJakartaSans-Medium',
                    fontSize: 14,
                    color: '#FFFEF5',
                    marginLeft: 10,
                  }}
                >
                  {item.user?.name}
                </Text>
              </View>
            )}
          />
        </View>
      )}
    </SafeAreaView>
  );
}
