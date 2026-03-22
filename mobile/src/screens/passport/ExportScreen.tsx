import React, { useState, useRef } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import * as Sharing from 'expo-sharing';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import SButton from '../../components/atoms/SButton';
import SIcon from '../../components/atoms/SIcon';
import { SExportPreview } from '../../components/organisms';
import { useAuthStore } from '../../stores/useAuthStore';
import { usePassportStore } from '../../stores/usePassportStore';
import { haptic } from '../../utils/haptics';
import type { Stamp, StampTemplate } from '../../types';

export default function ExportScreen({ navigation, route }: any) {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { stamps, stats } = usePassportStore();
  const [template, setTemplate] = useState<StampTemplate>('minimal');

  // Use passed stamp or latest stamp
  const stamp = route.params?.stamp || stamps[0];

  if (!stamp) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0D0D1A', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 16, color: '#737373' }}>
          {t('passport.noStamps')}
        </Text>
      </SafeAreaView>
    );
  }

  const handleShare = async () => {
    haptic.medium();
    // In production, use react-native-view-shot to capture the preview
    // then share via expo-sharing
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      // Would share the captured image
      // await Sharing.shareAsync(capturedImageUri);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0D0D1A' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}>
        <SButton variant="ghost" size="sm" onPress={() => navigation.goBack()}>
          {t('common.close')}
        </SButton>
        <Text
          style={{
            flex: 1,
            fontFamily: 'PlusJakartaSans-SemiBold',
            fontSize: 18,
            color: '#FFFEF5',
            textAlign: 'center',
          }}
        >
          {t('export.title')}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Preview + template selector */}
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <SExportPreview
          template={template}
          stamp={stamp}
          userName={user?.name || 'Explorer'}
          totalStamps={stats.total_stamps}
          onSelectTemplate={setTemplate}
        />
      </View>

      {/* Share button */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 24, gap: 8 }}>
        <SButton variant="primary" size="lg" onPress={handleShare}>
          {t('export.shareStory')}
        </SButton>
      </View>
    </SafeAreaView>
  );
}
