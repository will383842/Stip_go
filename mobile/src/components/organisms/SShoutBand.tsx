import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import SCountdown from '../atoms/SCountdown';
import SButton from '../atoms/SButton';
import { haptic } from '../../utils/haptics';
import { useTranslation } from 'react-i18next';
import type { Shout } from '../../types';

interface SShoutBandProps {
  shout: Shout;
  onJoin: (shout: Shout) => void;
  onPress: (shout: Shout) => void;
  onDismiss?: () => void;
}

export default function SShoutBand({ shout, onJoin, onPress, onDismiss }: SShoutBandProps) {
  const { t } = useTranslation();

  return (
    <Animated.View
      entering={FadeInUp.duration(300).springify()}
      exiting={FadeOutUp.duration(200)}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
      }}
    >
      <Pressable
        onPress={() => onPress(shout)}
        style={{
          marginHorizontal: 16,
          marginTop: 8,
          backgroundColor: 'rgba(26,26,46,0.95)',
          borderRadius: 16,
          padding: 14,
          borderWidth: 1,
          borderColor: '#F5C518',
          shadowColor: '#F5C518',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 5,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {/* Shout icon */}
          <Text style={{ fontSize: 20, marginRight: 10 }}>📣</Text>

          {/* Content */}
          <View style={{ flex: 1 }}>
            <Text
              numberOfLines={1}
              style={{
                fontFamily: 'PlusJakartaSans-SemiBold',
                fontSize: 14,
                color: '#FFFEF5',
                marginBottom: 2,
              }}
            >
              {shout.message}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, color: '#00D4FF' }}>
                {shout.participants_count > 0
                  ? t('shouts.participants', { count: shout.participants_count })
                  : t('shouts.beFirst')}
              </Text>
              <SCountdown expiresAt={shout.expires_at} />
            </View>
          </View>

          {/* Join button */}
          <SButton
            variant="primary"
            size="sm"
            onPress={() => {
              haptic.light();
              onJoin(shout);
            }}
          >
            {t('shouts.join')}
          </SButton>
        </View>
      </Pressable>

      {/* Dismiss */}
      {onDismiss && (
        <Pressable
          onPress={onDismiss}
          style={{ position: 'absolute', top: 4, right: 20, padding: 4 }}
          hitSlop={8}
        >
          <Text style={{ fontSize: 16, color: '#737373' }}>✕</Text>
        </Pressable>
      )}
    </Animated.View>
  );
}
