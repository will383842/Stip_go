import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import SButton from '../atoms/SButton';
import SAvatar from '../atoms/SAvatar';
import SCountdown from '../atoms/SCountdown';
import type { Shout } from '../../types';

interface SShoutCardProps {
  shout: Shout;
  onJoin: (shout: Shout) => void;
}

export default function SShoutCard({ shout, onJoin }: SShoutCardProps) {
  const { t } = useTranslation();

  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      style={{
        backgroundColor: 'rgba(26,26,46,0.9)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#404040',
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <SAvatar uri={shout.user?.avatar_url} size="sm" fallbackInitials={shout.user?.name} />
        <Text style={{ fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 14, color: '#FFFEF5', marginLeft: 8, flex: 1 }}>
          {shout.user?.name || 'Voyageur'}
        </Text>
        <SCountdown expiresAt={shout.expires_at} />
      </View>

      {/* Message */}
      <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 16, color: '#FFFEF5', marginBottom: 12 }}>
        {shout.message}
      </Text>

      {/* Footer */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontFamily: 'PlusJakartaSans-Medium', fontSize: 14, color: '#00D4FF' }}>
          {shout.participants_count > 0
            ? t('shouts.participants', { count: shout.participants_count })
            : t('shouts.beFirst')}
        </Text>
        <SButton variant="primary" size="sm" onPress={() => onJoin(shout)}>
          {t('shouts.join')}
        </SButton>
      </View>
    </Animated.View>
  );
}
