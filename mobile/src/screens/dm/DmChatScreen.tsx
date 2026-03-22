import React, { useEffect } from 'react';
import { View, Text, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useMessages, useSendMessage, useMarkConversationRead } from '../../hooks/useDm';
import { SDmInput } from '../../components/organisms';
import SAvatar from '../../components/atoms/SAvatar';
import SIcon from '../../components/atoms/SIcon';
import { useAuthStore } from '../../stores/useAuthStore';
import { timeAgo } from '../../utils/helpers';
import type { DirectMessage, PublicProfile } from '../../types';

interface DmChatScreenProps {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<{ DmChat: { conversationId: string; otherUser: PublicProfile } }, 'DmChat'>;
}

export default function DmChatScreen({ navigation, route }: DmChatScreenProps) {
  const { conversationId, otherUser } = route.params;
  const { user } = useAuthStore();
  const { data, fetchNextPage, hasNextPage } = useMessages(conversationId);
  const sendMessage = useSendMessage();
  const markRead = useMarkConversationRead(conversationId);

  // Mark as read on mount
  useEffect(() => {
    markRead.mutate();
  }, []);

  const messages = data?.pages.flatMap((page) => page.messages) ?? [];

  const handleSend = (content: string) => {
    sendMessage.mutate({
      receiver_user_id: otherUser.id,
      content,
    });
  };

  const renderMessage = ({ item }: { item: DirectMessage }) => {
    const isMine = item.sender_user_id === user?.id;

    return (
      <View
        style={{
          alignSelf: isMine ? 'flex-end' : 'flex-start',
          maxWidth: '75%',
          marginHorizontal: 16,
          marginVertical: 4,
        }}
      >
        <View
          style={{
            backgroundColor: isMine ? '#F5C518' : '#1A1A2E',
            borderRadius: 18,
            borderBottomRightRadius: isMine ? 4 : 18,
            borderBottomLeftRadius: isMine ? 18 : 4,
            paddingHorizontal: 14,
            paddingVertical: 10,
          }}
        >
          <Text
            style={{
              fontFamily: 'PlusJakartaSans-Regular',
              fontSize: 16,
              color: isMine ? '#1A1A2E' : '#FFFEF5',
            }}
          >
            {item.content}
          </Text>
        </View>

        {/* Timestamp + read status */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: 4, alignSelf: isMine ? 'flex-end' : 'flex-start' }}>
          <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, color: '#737373' }}>
            {timeAgo(item.created_at)}
          </Text>
          {isMine && (
            <Text style={{ fontSize: 12, color: item.read_at ? '#F5C518' : '#737373' }}>
              {item.read_at ? '✓✓' : '✓'}
            </Text>
          )}
        </View>

        {/* Reactions */}
        {item.reactions.length > 0 && (
          <View style={{ flexDirection: 'row', gap: 4, marginTop: 4 }}>
            {item.reactions.map((r, i) => (
              <Text key={i} style={{ fontSize: 16 }}>{r.emoji}</Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0D0D1A' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#1A1A2E' }}>
        <Pressable onPress={() => navigation.goBack()} style={{ padding: 8, minWidth: 48, minHeight: 48, justifyContent: 'center' }}>
          <SIcon name="arrow-back" size={24} color="#FFFEF5" />
        </Pressable>
        <SAvatar uri={otherUser.avatar_url} size="sm" fallbackInitials={otherUser.name} />
        <View style={{ marginLeft: 8, flex: 1 }}>
          <Text style={{ fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 16, color: '#FFFEF5' }}>
            {otherUser.name}
          </Text>
          <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, color: '#737373' }}>
            @{otherUser.username}
          </Text>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        inverted
        showsVerticalScrollIndicator={false}
        onEndReached={() => { if (hasNextPage) fetchNextPage(); }}
        onEndReachedThreshold={0.3}
        contentContainerStyle={{ paddingVertical: 8 }}
      />

      {/* Input */}
      <SDmInput onSend={handleSend} onPhoto={() => {}} onAudio={() => {}} />
    </SafeAreaView>
  );
}
