import React from 'react';
import { Pressable, View, Text } from 'react-native';
import SStreakBadge from '../atoms/SStreakBadge';
import SAvatar from '../atoms/SAvatar';
import { haptic } from '../../utils/haptics';
import type { Squad } from '../../types';

interface SSquadCardProps {
  squad: Squad;
  onPress: (squad: Squad) => void;
}

export default function SSquadCard({ squad, onPress }: SSquadCardProps) {
  return (
    <Pressable
      onPress={() => { haptic.light(); onPress(squad); }}
      style={{
        backgroundColor: '#1A1A2E',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      {/* Emoji */}
      <Text style={{ fontSize: 32, marginRight: 12 }}>{squad.emoji}</Text>

      {/* Info */}
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontFamily: 'PlusJakartaSans-Bold', fontSize: 16, color: '#FFFEF5' }}>
            {squad.name}
          </Text>
          <SStreakBadge streak={squad.current_streak} size="sm" />
        </View>
        <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, color: '#737373', marginTop: 2 }}>
          {squad.member_count} membre{squad.member_count > 1 ? 's' : ''} · {squad.total_stamps} stamps
        </Text>
      </View>

      {/* Member avatars (stacked) */}
      {squad.members && (
        <View style={{ flexDirection: 'row' }}>
          {squad.members.slice(0, 3).map((m, i) => (
            <View key={m.user_id} style={{ marginLeft: i > 0 ? -8 : 0 }}>
              <SAvatar
                uri={m.user?.avatar_url}
                size="sm"
                fallbackInitials={m.user?.name}
                borderColor={m.color}
              />
            </View>
          ))}
          {squad.member_count > 3 && (
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 9999,
                backgroundColor: '#404040',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: -8,
              }}
            >
              <Text style={{ fontFamily: 'PlusJakartaSans-Bold', fontSize: 12, color: '#FFFEF5' }}>
                +{squad.member_count - 3}
              </Text>
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
}
