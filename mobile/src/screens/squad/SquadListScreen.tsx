import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMySquads } from '../../hooks/useSquad';
import SButton from '../../components/atoms/SButton';
import SSkeleton from '../../components/atoms/SSkeleton';
import { SSquadCard } from '../../components/molecules';
import type { Squad } from '../../types';

interface SquadListScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

export default function SquadListScreen({ navigation }: SquadListScreenProps) {
  const { t } = useTranslation();
  const { data: squads, isLoading } = useMySquads();

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0D0D1A' }}>
        <View style={{ padding: 16, gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <SSkeleton key={i} width="100%" height={80} borderRadius={16} />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0D0D1A' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 }}>
        <Text style={{ fontFamily: 'PlusJakartaSans-Bold', fontSize: 24, color: '#FFFEF5' }}>
          {t('squad.title')}
        </Text>
        <SButton variant="primary" size="sm" onPress={() => navigation.navigate('SquadCreate')}>
          {t('squad.create')}
        </SButton>
      </View>

      {!squads || squads.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
          <Text style={{ fontSize: 48 }}>{'\u{1F91D}'}</Text>
          <Text style={{ fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 16, color: '#FFFEF5', marginTop: 12, textAlign: 'center' }}>
            {t('squad.noSquads')}
          </Text>
          <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 14, color: '#737373', marginTop: 4, textAlign: 'center' }}>
            {t('squad.noSquadsDesc')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={squads}
          renderItem={({ item }) => (
            <View style={{ paddingHorizontal: 16, paddingVertical: 4 }}>
              <SSquadCard squad={item} onPress={(s: Squad) => navigation.navigate('SquadDetail', { squadId: s.id })} />
            </View>
          )}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
