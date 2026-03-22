import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import SAvatar from '../atoms/SAvatar';
import { useTranslation } from 'react-i18next';
import type { SquadMember } from '../../types';

interface SSquadLeaderboardProps {
  members: SquadMember[];
}

export default function SSquadLeaderboard({ members }: SSquadLeaderboardProps) {
  const { t } = useTranslation();

  // Sort by weekly stamps descending
  const sorted = [...members].sort((a, b) => b.weekly_stamps - a.weekly_stamps);
  const maxStamps = sorted[0]?.weekly_stamps || 1;

  return (
    <View>
      <Text
        style={{
          fontFamily: 'PlusJakartaSans-SemiBold',
          fontSize: 16,
          color: '#FFFEF5',
          marginBottom: 16,
        }}
      >
        {t('squad.leaderboard')}
      </Text>

      {sorted.map((member, index) => {
        const barWidth = maxStamps > 0 ? (member.weekly_stamps / maxStamps) * 100 : 0;

        return (
          <Animated.View
            key={member.user_id}
            entering={FadeInRight.duration(300).delay(index * 80)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 12,
              gap: 10,
            }}
          >
            {/* Rank */}
            <Text
              style={{
                fontFamily: 'PlusJakartaSans-Bold',
                fontSize: 16,
                color: index === 0 ? '#F5C518' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#737373',
                width: 24,
                textAlign: 'center',
              }}
            >
              {index + 1}
            </Text>

            {/* Avatar */}
            <SAvatar uri={member.user?.avatar_url} size="sm" fallbackInitials={member.user?.name} />

            {/* Name + bar */}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: 'PlusJakartaSans-Medium',
                  fontSize: 14,
                  color: '#FFFEF5',
                  marginBottom: 4,
                }}
              >
                {member.user?.name}
              </Text>

              {/* Progress bar */}
              <View
                style={{
                  height: 8,
                  backgroundColor: '#1A1A2E',
                  borderRadius: 4,
                  overflow: 'hidden',
                }}
              >
                <Animated.View
                  style={{
                    height: '100%',
                    width: `${barWidth}%`,
                    backgroundColor: member.color,
                    borderRadius: 4,
                  }}
                />
              </View>
            </View>

            {/* Stamps count */}
            <Text
              style={{
                fontFamily: 'PlusJakartaSans-Bold',
                fontSize: 16,
                color: member.color,
                minWidth: 32,
                textAlign: 'right',
              }}
            >
              {member.weekly_stamps}
            </Text>
          </Animated.View>
        );
      })}
    </View>
  );
}
