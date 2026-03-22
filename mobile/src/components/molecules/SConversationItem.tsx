import React from 'react';
import { Pressable, View, Text } from 'react-native';
import SAvatar from '../atoms/SAvatar';
import { timeAgo } from '../../utils/helpers';
import { haptic } from '../../utils/haptics';
import type { Conversation } from '../../types';

interface SConversationItemProps {
  conversation: Conversation;
  onPress: (conversation: Conversation) => void;
}

export default function SConversationItem({ conversation, onPress }: SConversationItemProps) {
  const { other_user, last_message_preview, last_message_at, unread_count } = conversation;

  return (
    <Pressable
      onPress={() => { haptic.light(); onPress(conversation); }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        minHeight: 48,
      }}
    >
      <SAvatar uri={other_user.avatar_url} size="md" fallbackInitials={other_user.name} />

      <View style={{ flex: 1, marginLeft: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text
            style={{
              fontFamily: unread_count > 0 ? 'PlusJakartaSans-Bold' : 'PlusJakartaSans-SemiBold',
              fontSize: 16,
              color: '#FFFEF5',
            }}
            numberOfLines={1}
          >
            {other_user.name}
          </Text>
          {last_message_at && (
            <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, color: '#737373' }}>
              {timeAgo(last_message_at)}
            </Text>
          )}
        </View>
        {last_message_preview && (
          <Text
            style={{
              fontFamily: 'PlusJakartaSans-Regular',
              fontSize: 14,
              color: unread_count > 0 ? '#FFFEF5' : '#737373',
              marginTop: 2,
            }}
            numberOfLines={1}
          >
            {last_message_preview}
          </Text>
        )}
      </View>

      {unread_count > 0 && (
        <View
          style={{
            backgroundColor: '#F5C518',
            borderRadius: 9999,
            minWidth: 22,
            height: 22,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 6,
            marginLeft: 8,
          }}
        >
          <Text style={{ fontFamily: 'PlusJakartaSans-Bold', fontSize: 12, color: '#1A1A2E' }}>
            {unread_count}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
