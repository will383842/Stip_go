import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useFeed } from '../../hooks/useFeed';
import { SFeedItem } from '../../components/molecules';
import SSkeleton from '../../components/atoms/SSkeleton';
import type { FeedItem } from '../../types';

export default function FeedScreen() {
  const { t } = useTranslation();
  const { data, isLoading, fetchNextPage, hasNextPage } = useFeed();

  const items = data?.pages.flatMap((page) => page.items) ?? [];

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0D0D1A' }}>
        <View style={{ padding: 16, gap: 12 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <SSkeleton width={32} height={32} borderRadius={9999} />
              <View style={{ flex: 1, gap: 4 }}>
                <SSkeleton width={200} height={14} borderRadius={8} />
                <SSkeleton width={100} height={12} borderRadius={8} />
              </View>
            </View>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0D0D1A' }}>
      <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
        <Text style={{ fontFamily: 'PlusJakartaSans-Bold', fontSize: 24, color: '#FFFEF5' }}>
          {t('feed.title')}
        </Text>
      </View>

      {items.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
          <Text style={{ fontSize: 48 }}>{'\u{1F30D}'}</Text>
          <Text style={{ fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 16, color: '#FFFEF5', marginTop: 12, textAlign: 'center' }}>
            {t('feed.empty')}
          </Text>
          <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 14, color: '#737373', marginTop: 4, textAlign: 'center' }}>
            {t('feed.emptyDesc')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={({ item }) => <SFeedItem item={item} />}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          onEndReached={() => { if (hasNextPage) fetchNextPage(); }}
          onEndReachedThreshold={0.3}
        />
      )}
    </SafeAreaView>
  );
}
