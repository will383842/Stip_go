import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import SButton from '../../components/atoms/SButton';
import SInput from '../../components/atoms/SInput';
import { useCreateSquad } from '../../hooks/useSquad';
import { haptic } from '../../utils/haptics';

const EMOJIS = ['🌍', '🚀', '🏔️', '🌊', '🎒', '✈️', '🗺️', '🏝️', '⛺', '🌄', '🎭', '🎪'];

interface SquadCreateScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

export default function SquadCreateScreen({ navigation }: SquadCreateScreenProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🌍');
  const createSquad = useCreateSquad();

  const handleCreate = () => {
    if (!name.trim()) return;
    haptic.medium();
    createSquad.mutate(
      { name: name.trim(), emoji },
      { onSuccess: (squad) => navigation.replace('SquadDetail', { squadId: squad.id }) },
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0D0D1A' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, justifyContent: 'center' }}>
        <Text style={{ fontFamily: 'PlusJakartaSans-Bold', fontSize: 24, color: '#FFFEF5', textAlign: 'center' }}>
          {t('squad.createTitle')}
        </Text>
        <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 14, color: '#737373', textAlign: 'center', marginTop: 4 }}>
          {t('squad.createDesc')}
        </Text>

        {/* Emoji picker */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 32 }}>
          {EMOJIS.map((e) => (
            <View
              key={e}
              onTouchEnd={() => { setEmoji(e); haptic.light(); }}
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: e === emoji ? 'rgba(245,197,24,0.2)' : '#1A1A2E',
                borderWidth: e === emoji ? 2 : 0,
                borderColor: '#F5C518',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 24 }}>{e}</Text>
            </View>
          ))}
        </View>

        {/* Name input */}
        <View style={{ marginTop: 24 }}>
          <SInput
            value={name}
            onChangeText={(text) => setName(text.slice(0, 30))}
            placeholder={t('squad.namePlaceholder')}
            icon="people-outline"
            maxLength={30}
          />
        </View>

        {/* Create button */}
        <View style={{ marginTop: 32 }}>
          <SButton
            variant="primary"
            size="lg"
            onPress={handleCreate}
            loading={createSquad.isPending}
            disabled={!name.trim()}
          >
            {t('squad.create')}
          </SButton>
        </View>

        {/* Cancel */}
        <View style={{ marginTop: 12 }}>
          <SButton variant="ghost" size="md" onPress={() => navigation.goBack()}>
            {t('common.cancel')}
          </SButton>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
