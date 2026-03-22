import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import SButton from '../../components/atoms/SButton';
import SIcon from '../../components/atoms/SIcon';
import SAvatar from '../../components/atoms/SAvatar';
import { usePepiteDetail, useVotePepite } from '../../hooks/usePepites';
import { haptic } from '../../utils/haptics';
import { timeAgo } from '../../utils/helpers';

interface PepiteDetailScreenProps {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<{ PepiteDetail: { pepiteId: string } }, 'PepiteDetail'>;
}

export default function PepiteDetailScreen({ navigation, route }: PepiteDetailScreenProps) {
  const { t } = useTranslation();
  const { pepiteId } = route.params;
  const { data: pepite, isLoading } = usePepiteDetail(pepiteId);
  const votePepite = useVotePepite();

  const handleVote = () => {
    haptic.medium();
    votePepite.mutate(pepiteId);
  };

  if (!pepite || isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0D0D1A', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 16, color: '#737373' }}>
          {t('common.loading')}
        </Text>
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
        <Text style={{ fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 18, color: '#FFFEF5', flex: 1, marginLeft: 8 }}>
          {t('pepites.title')}
        </Text>
      </View>

      {/* Photo */}
      <Image
        source={{ uri: pepite.photo_url }}
        style={{ width: '100%', height: 300 }}
        contentFit="cover"
        transition={200}
      />

      {/* Content */}
      <View style={{ padding: 16 }}>
        {/* Creator */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <SAvatar uri={pepite.user?.avatar_url} size="sm" fallbackInitials={pepite.user?.name} />
          <View style={{ marginLeft: 8 }}>
            <Text style={{ fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 14, color: '#FFFEF5' }}>
              {pepite.user?.name || 'Voyageur'}
            </Text>
            <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, color: '#737373' }}>
              {timeAgo(pepite.created_at)}
            </Text>
          </View>
        </View>

        {/* Caption */}
        {pepite.caption && (
          <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 16, color: '#FFFEF5', marginBottom: 16 }}>
            {pepite.caption}
          </Text>
        )}

        {/* Votes */}
        <View
          style={{
            backgroundColor: '#1A1A2E',
            borderRadius: 16,
            padding: 16,
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <Text style={{ fontFamily: 'PlusJakartaSans-Bold', fontSize: 32, color: '#F5C518' }}>
            {pepite.votes_count}
          </Text>
          <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 14, color: '#737373' }}>
            {t('pepites.votes')}
          </Text>
        </View>

        {/* Vote button */}
        {pepite.can_vote && !pepite.has_voted && (
          <SButton variant="primary" size="lg" onPress={handleVote} loading={votePepite.isPending}>
            {t('pepites.vote')}
          </SButton>
        )}

        {pepite.has_voted && (
          <View style={{ alignItems: 'center', paddingVertical: 12 }}>
            <Text style={{ fontFamily: 'PlusJakartaSans-Medium', fontSize: 16, color: '#22C55E' }}>
              {t('pepites.voted')} ✓
            </Text>
          </View>
        )}

        {!pepite.can_vote && !pepite.has_voted && (
          <View style={{ alignItems: 'center', paddingVertical: 12 }}>
            <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 14, color: '#737373', textAlign: 'center' }}>
              {t('pepites.mustVisit')}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
