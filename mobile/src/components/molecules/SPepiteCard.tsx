import React from 'react';
import { Pressable, View, Text } from 'react-native';
import { Image } from 'expo-image';
import SButton from '../atoms/SButton';
import { haptic } from '../../utils/haptics';
import type { Pepite } from '../../types';

interface SPepiteCardProps {
  pepite: Pepite;
  onPress: (pepite: Pepite) => void;
  onVote?: (pepite: Pepite) => void;
}

export default function SPepiteCard({ pepite, onPress, onVote }: SPepiteCardProps) {
  return (
    <Pressable
      onPress={() => { haptic.light(); onPress(pepite); }}
      style={{
        backgroundColor: '#1A1A2E',
        borderRadius: 16,
        overflow: 'hidden',
      }}
    >
      {/* Photo */}
      <Image
        source={{ uri: pepite.photo_url }}
        style={{ width: '100%', height: 160 }}
        contentFit="cover"
        transition={200}
      />

      <View style={{ padding: 12 }}>
        {/* Caption */}
        {pepite.caption && (
          <Text
            style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 14, color: '#FFFEF5', marginBottom: 8 }}
            numberOfLines={2}
          >
            {pepite.caption}
          </Text>
        )}

        {/* Votes + button */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontFamily: 'PlusJakartaSans-Medium', fontSize: 14, color: '#F5C518' }}>
            {'\u{1F48E}'} {pepite.votes_count} vote{pepite.votes_count !== 1 ? 's' : ''}
          </Text>
          {onVote && pepite.can_vote && !pepite.has_voted && (
            <SButton variant="secondary" size="sm" onPress={() => onVote(pepite)}>
              À ne pas louper !
            </SButton>
          )}
          {pepite.has_voted && (
            <Text style={{ fontFamily: 'PlusJakartaSans-Medium', fontSize: 12, color: '#22C55E' }}>
              Voté ✓
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}
