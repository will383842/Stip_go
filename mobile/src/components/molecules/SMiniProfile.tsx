import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import SAvatar from '../atoms/SAvatar';
import SButton from '../atoms/SButton';
import SCountryFlag from '../atoms/SCountryFlag';
import { stampIcon } from '../../utils/helpers';
import type { PublicProfile } from '../../types';

interface SMiniProfileProps {
  user: PublicProfile;
  distance?: string;
  onPress?: () => void;
  onBlock?: () => void;
  onReport?: () => void;
}

export default function SMiniProfile({ user, distance, onPress, onBlock, onReport }: SMiniProfileProps) {
  const { t } = useTranslation();

  return (
    <View
      style={{
        backgroundColor: 'rgba(13,13,26,0.85)',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: '#404040',
      }}
    >
      <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center' }}>
        <SAvatar uri={user.avatar_url} size="md" fallbackInitials={user.name} />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={{ fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 16, color: '#FFFEF5' }}>
            {user.name}
          </Text>
          <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, color: '#737373' }}>
            @{user.username}
            {distance ? ` · ${distance}` : ''}
          </Text>
        </View>
        {user.country_code && <SCountryFlag countryCode={user.country_code} size="md" />}
      </Pressable>

      {/* Top stamps */}
      {user.top_stamps.length > 0 && (
        <View style={{ flexDirection: 'row', marginTop: 12, gap: 8 }}>
          {user.top_stamps.slice(0, 3).map((s, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 14 }}>{stampIcon(s.stamp_type)}</Text>
              <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, color: '#FFFEF5', marginLeft: 4 }}>
                {s.name}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Stats */}
      <View style={{ flexDirection: 'row', marginTop: 12, justifyContent: 'space-between' }}>
        <Text style={{ fontFamily: 'PlusJakartaSans-Medium', fontSize: 14, color: '#F5C518' }}>
          {user.total_stamps} stamps
        </Text>
        <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, color: '#737373' }}>
          {user.passport_level_name}
        </Text>
      </View>

      {/* Actions */}
      <View style={{ flexDirection: 'row', marginTop: 16, gap: 8 }}>
        {onBlock && (
          <Pressable onPress={onBlock}>
            <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, color: '#737373' }}>
              Bloquer
            </Text>
          </Pressable>
        )}
        {onReport && (
          <Pressable onPress={onReport}>
            <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, color: '#FF5745' }}>
              Signaler
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
