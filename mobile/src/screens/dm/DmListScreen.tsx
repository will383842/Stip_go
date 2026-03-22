import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useConversations } from '../../hooks/useDm';
import { SConversationItem } from '../../components/molecules';
import SSkeleton from '../../components/atoms/SSkeleton';
import type { Conversation } from '../../types';

interface DmListScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

export default function DmListScreen({ navigation }: DmListScreenProps) {
  const { t } = useTranslation();
  const { data: conversations, isLoading } = useConversations();

  const handleConversationPress = (conversation: Conversation) => {
    navigation.navigate('DmChat', { conversationId: conversation.id, otherUser: conversation.other_user });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0D0D1A' }}>
        <View style={{ padding: 16, gap: 12 }}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <SSkeleton width={48} height={48} borderRadius={9999} />
              <View style={{ flex: 1, gap: 4 }}>
                <SSkeleton width={120} height={16} borderRadius={8} />
                <SSkeleton width={200} height={14} borderRadius={8} />
              </View>
            </View>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0D0D1A' }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
        <Text style={{ fontFamily: 'PlusJakartaSans-Bold', fontSize: 24, color: '#FFFEF5' }}>
          {t('dm.title')}
        </Text>
      </View>

      {!conversations || conversations.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
          <Text style={{ fontSize: 48 }}>{'\u{1F4AC}'}</Text>
          <Text style={{ fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 16, color: '#FFFEF5', marginTop: 12, textAlign: 'center' }}>
            {t('dm.noConversations')}
          </Text>
          <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 14, color: '#737373', marginTop: 4, textAlign: 'center' }}>
            {t('dm.noConversationsDesc')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={({ item }) => (
            <SConversationItem conversation={item} onPress={handleConversationPress} />
          )}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
