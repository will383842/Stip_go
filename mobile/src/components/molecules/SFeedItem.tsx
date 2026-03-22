import React from 'react';
import { View, Text, Pressable } from 'react-native';
import SAvatar from '../atoms/SAvatar';
import { timeAgo, stampIcon, countryFlag } from '../../utils/helpers';
import type { FeedItem } from '../../types';

interface SFeedItemProps {
  item: FeedItem;
  onPress?: (item: FeedItem) => void;
}

function feedVerb(type: string): string {
  switch (type) {
    case 'stamp': return 'a stampé';
    case 'level_up': return 'a atteint le niveau';
    case 'badge': return 'a débloqué';
    case 'squad_join': return 'a rejoint le Squad';
    case 'flash_capture': return 'a capturé le Flash';
    case 'country': return 'a stampé';
    case 'pepite_created': return 'a créé une Pépite';
    case 'milestone': return 'a atteint';
    default: return 'a fait';
  }
}

function feedObject(item: FeedItem): string {
  const c = item.content as Record<string, string>;
  switch (item.type) {
    case 'stamp': return c.name || 'un lieu';
    case 'level_up': return `${c.new_level}`;
    case 'badge': return c.badge_name || 'un badge';
    case 'squad_join': return c.squad_name || 'un Squad';
    case 'flash_capture': return c.location_name || 'un lieu';
    case 'country': return `${countryFlag(c.country_code || '')} ${c.country_name || ''}`;
    case 'pepite_created': return c.caption || 'une pépite';
    case 'milestone': return c.achievement || 'un objectif';
    default: return '';
  }
}

function feedIcon(type: string): string {
  switch (type) {
    case 'stamp': return stampIcon('spot');
    case 'level_up': return '\u{2B50}';
    case 'badge': return '\u{1F3C5}';
    case 'squad_join': return '\u{1F91D}';
    case 'flash_capture': return '\u{26A1}';
    case 'country': return '\u{1F30D}';
    case 'pepite_created': return '\u{1F48E}';
    case 'milestone': return '\u{1F3C6}';
    default: return '\u{1F4CD}';
  }
}

export default function SFeedItem({ item, onPress }: SFeedItemProps) {
  return (
    <Pressable
      onPress={() => onPress?.(item)}
      style={{
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        alignItems: 'center',
        minHeight: 48,
      }}
    >
      <SAvatar uri={item.user?.avatar_url} size="sm" fallbackInitials={item.user?.name} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 14, color: '#FFFEF5' }}>
          <Text style={{ fontFamily: 'PlusJakartaSans-SemiBold' }}>{item.user?.name || 'Voyageur'}</Text>
          {' '}{feedVerb(item.type)}{' '}
          <Text style={{ fontFamily: 'PlusJakartaSans-SemiBold' }}>{feedObject(item)}</Text>
          {' '}{feedIcon(item.type)}
        </Text>
        <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, color: '#737373', marginTop: 2 }}>
          {timeAgo(item.created_at)}
        </Text>
      </View>
    </Pressable>
  );
}
