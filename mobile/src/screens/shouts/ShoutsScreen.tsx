import React from 'react';
import { View, Text, FlatList, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNearbyShouts, useCreateShout, useJoinShout } from '../../hooks/useShouts';
import { useMapStore } from '../../stores/useMapStore';
import SShoutCard from '../../components/molecules/SShoutCard';
import SButton from '../../components/atoms/SButton';
import { haptic } from '../../utils/haptics';
import { useTranslation } from 'react-i18next';
import type { Shout } from '../../types';

interface ShoutsScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

export default function ShoutsScreen({ navigation }: ShoutsScreenProps) {
  const { t } = useTranslation();
  const { currentPosition } = useMapStore();
  const { data: shouts, isLoading, refetch } = useNearbyShouts(currentPosition?.lat, currentPosition?.lng);
  const joinShout = useJoinShout();
  const [showCreate, setShowCreate] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const createShout = useCreateShout();

  const handleJoin = (shout: Shout) => {
    haptic.light();
    joinShout.mutate(shout.id);
  };

  const handleCreate = () => {
    if (!message.trim()) return;
    haptic.medium();
    createShout.mutate(message.trim(), {
      onSuccess: () => {
        setMessage('');
        setShowCreate(false);
      },
    });
  };

  const handleShoutPress = (shout: Shout) => {
    navigation.navigate('ShoutDetail', { shoutId: shout.id });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0D0D1A' }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#FFFEF5" />
        </Pressable>
        <Text style={{ fontFamily: 'PlusJakartaSans-Bold', fontSize: 18, color: '#FFFEF5' }}>
          {t('shouts.title')}
        </Text>
        <Pressable
          onPress={() => {
            haptic.light();
            setShowCreate(!showCreate);
          }}
        >
          <Ionicons name="add-circle-outline" size={28} color="#F5C518" />
        </Pressable>
      </View>

      {/* Create shout input */}
      {showCreate && (
        <Animated.View
          entering={FadeInDown.duration(200)}
          style={{
            marginHorizontal: 16,
            marginBottom: 12,
            backgroundColor: '#1A1A2E',
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: '#F5C518',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: '#0D0D1A',
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 8,
              }}
            >
              <Text style={{ fontFamily: 'PlusJakartaSans-Medium', fontSize: 12, color: '#737373', marginBottom: 4 }}>
                {140 - message.length} / 140
              </Text>
              <TextInput
                value={message}
                onChangeText={(text: string) => setMessage(text.slice(0, 140))}
                placeholder={t('shouts.create')}
                placeholderTextColor="#737373"
                multiline
                style={{
                  color: '#FFFEF5',
                  fontFamily: 'PlusJakartaSans-Regular',
                  fontSize: 16,
                  maxHeight: 80,
                }}
              />
            </View>
            <SButton
              variant="primary"
              size="sm"
              onPress={handleCreate}
              disabled={!message.trim() || createShout.isPending}
            >
              📣
            </SButton>
          </View>
        </Animated.View>
      )}

      {/* Shouts list */}
      <FlatList
        data={shouts ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: 32 }}
        renderItem={({ item }) => (
          <Pressable onPress={() => handleShoutPress(item)}>
            <SShoutCard shout={item} onJoin={handleJoin} />
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 80 }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📣</Text>
            <Text style={{ fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 18, color: '#FFFEF5', marginBottom: 8 }}>
              {t('shouts.title')}
            </Text>
            <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 14, color: '#737373', textAlign: 'center' }}>
              {t('shouts.beFirst')}
            </Text>
          </View>
        }
        refreshing={isLoading}
        onRefresh={refetch}
      />
    </SafeAreaView>
  );
}
