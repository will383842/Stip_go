import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { timeAgo } from '../../utils/helpers';
import type { DirectMessage, MessageReaction } from '../../types';

interface SMessageBubbleProps {
  message: DirectMessage;
  isMine: boolean;
  onReact?: (messageId: string, emoji: string) => void;
  onLongPress?: (message: DirectMessage) => void;
}

const REACTION_EMOJIS = ['❤️', '😂', '👍', '😮', '😢', '🔥'];

export default function SMessageBubble({ message, isMine, onReact, onLongPress }: SMessageBubbleProps) {
  const [showReactions, setShowReactions] = React.useState(false);

  return (
    <Animated.View
      entering={FadeInDown.duration(200)}
      style={{
        alignSelf: isMine ? 'flex-end' : 'flex-start',
        maxWidth: '75%',
        marginBottom: 4,
      }}
    >
      <Pressable
        onLongPress={() => {
          setShowReactions(true);
          onLongPress?.(message);
        }}
        style={{
          backgroundColor: isMine ? '#F5C518' : '#1A1A2E',
          borderRadius: 16,
          borderBottomRightRadius: isMine ? 4 : 16,
          borderBottomLeftRadius: isMine ? 16 : 4,
          paddingHorizontal: 14,
          paddingVertical: 10,
        }}
      >
        {/* Photo */}
        {message.photo_url && (
          <Image
            source={{ uri: message.photo_url }}
            style={{
              width: 200,
              height: 150,
              borderRadius: 12,
              marginBottom: message.content ? 8 : 0,
            }}
            resizeMode="cover"
          />
        )}

        {/* Audio */}
        {message.audio_url && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: isMine ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.05)',
              borderRadius: 12,
              padding: 8,
              marginBottom: message.content ? 8 : 0,
              gap: 8,
            }}
          >
            <Ionicons name="play-circle" size={28} color={isMine ? '#1A1A2E' : '#00D4FF'} />
            {/* Waveform placeholder */}
            <View style={{ flex: 1, height: 24, backgroundColor: isMine ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)', borderRadius: 12 }} />
            <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 11, color: isMine ? '#1A1A2E' : '#737373' }}>
              {message.audio_duration_sec ? `${message.audio_duration_sec}s` : ''}
            </Text>
          </View>
        )}

        {/* Text content */}
        {message.content ? (
          <Text
            style={{
              fontFamily: 'PlusJakartaSans-Regular',
              fontSize: 16,
              color: isMine ? '#1A1A2E' : '#FFFEF5',
              lineHeight: 22,
            }}
          >
            {message.content}
          </Text>
        ) : null}

        {/* Timestamp + read status */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4, gap: 4 }}>
          <Text
            style={{
              fontFamily: 'PlusJakartaSans-Regular',
              fontSize: 10,
              color: isMine ? 'rgba(26,26,46,0.5)' : '#737373',
            }}
          >
            {timeAgo(message.created_at)}
          </Text>
          {isMine && (
            <Ionicons
              name={message.read_at ? 'checkmark-done' : 'checkmark'}
              size={14}
              color={message.read_at ? '#00D4FF' : (isMine ? 'rgba(26,26,46,0.4)' : '#737373')}
            />
          )}
        </View>
      </Pressable>

      {/* Reactions display */}
      {message.reactions && message.reactions.length > 0 && (
        <View
          style={{
            flexDirection: 'row',
            alignSelf: isMine ? 'flex-end' : 'flex-start',
            backgroundColor: '#1A1A2E',
            borderRadius: 12,
            paddingHorizontal: 6,
            paddingVertical: 2,
            marginTop: -4,
            borderWidth: 1,
            borderColor: '#404040',
          }}
        >
          {(message.reactions as MessageReaction[]).map((r, i) => (
            <Text key={i} style={{ fontSize: 14 }}>
              {r.emoji}
            </Text>
          ))}
        </View>
      )}

      {/* Reaction picker */}
      {showReactions && onReact && (
        <Animated.View
          entering={FadeInDown.duration(150)}
          style={{
            flexDirection: 'row',
            backgroundColor: '#1A1A2E',
            borderRadius: 20,
            padding: 6,
            marginTop: 4,
            gap: 4,
            borderWidth: 1,
            borderColor: '#404040',
          }}
        >
          {REACTION_EMOJIS.map((emoji) => (
            <Pressable
              key={emoji}
              onPress={() => {
                onReact(message.id, emoji);
                setShowReactions(false);
              }}
              style={{ padding: 4 }}
            >
              <Text style={{ fontSize: 20 }}>{emoji}</Text>
            </Pressable>
          ))}
        </Animated.View>
      )}
    </Animated.View>
  );
}
