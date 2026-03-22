import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import SButton from '../../components/atoms/SButton';
import SCountdown from '../../components/atoms/SCountdown';
import { useTodayFlash, useCaptureFlash } from '../../hooks/useFlash';
import { useMapStore } from '../../stores/useMapStore';
import { haptic } from '../../utils/haptics';
import { playSound } from '../../utils/audio';

interface FlashAlertScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

export default function FlashAlertScreen({ navigation }: FlashAlertScreenProps) {
  const { t } = useTranslation();
  const { currentPosition } = useMapStore();
  const { data: flash } = useTodayFlash(currentPosition?.lat, currentPosition?.lng);
  const captureFlash = useCaptureFlash();
  const [captured, setCaptured] = useState(false);

  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(withTiming(1.1, { duration: 800 }), -1, true);
  }, [pulseScale]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const handleCapture = () => {
    haptic.heavy();
    playSound('thud_spot');
    captureFlash.mutate(undefined, {
      onSuccess: () => setCaptured(true),
    });
  };

  if (!flash) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0D0D1A', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 16, color: '#737373' }}>
          {t('flash.noFlashToday')}
        </Text>
        <View style={{ marginTop: 16 }}>
          <SButton variant="ghost" size="md" onPress={() => navigation.goBack()}>
            {t('common.close')}
          </SButton>
        </View>
      </SafeAreaView>
    );
  }

  if (captured) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0D0D1A', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
        <Animated.View entering={FadeIn.duration(300)} style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 64 }}>{'\u{26A1}'}</Text>
          <Text style={{ fontFamily: 'PlusJakartaSans-Bold', fontSize: 28, color: '#F5C518', marginTop: 16 }}>
            {t('flash.captured')}
          </Text>
          <Text style={{ fontFamily: 'PlusJakartaSans-Bold', fontSize: 20, color: '#22C55E', marginTop: 8 }}>
            +{flash.miles_bonus} Miles
          </Text>
          <View style={{ marginTop: 32 }}>
            <SButton variant="primary" size="lg" onPress={() => navigation.goBack()}>
              {t('common.continue')}
            </SButton>
          </View>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0D0D1A', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
      {/* Flash icon pulsating */}
      <Animated.View style={pulseStyle}>
        <Text style={{ fontSize: 72 }}>{'\u{26A1}'}</Text>
      </Animated.View>

      <Text style={{ fontFamily: 'PlusJakartaSans-Bold', fontSize: 24, color: '#FFFEF5', marginTop: 24, textAlign: 'center' }}>
        Stamp Flash !
      </Text>

      <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 16, color: '#737373', marginTop: 8, textAlign: 'center' }}>
        {flash.name}
      </Text>

      {/* Countdown */}
      <View style={{ marginTop: 24, alignItems: 'center' }}>
        <Text style={{ fontFamily: 'PlusJakartaSans-Medium', fontSize: 14, color: '#737373' }}>
          {t('flash.timeLeft')}
        </Text>
        <SCountdown
          expiresAt={flash.expires_at}
          onExpired={() => navigation.goBack()}
          style={{ fontSize: 36, marginTop: 8 }}
        />
      </View>

      {/* Capture button */}
      <View style={{ marginTop: 32, width: '100%' }}>
        <SButton variant="primary" size="lg" onPress={handleCapture} loading={captureFlash.isPending}>
          {t('flash.capture')}
        </SButton>
      </View>

      {/* Bonus info */}
      <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 14, color: '#F5C518', marginTop: 12 }}>
        +{flash.miles_bonus} Miles {t('flash.bonus')}
      </Text>

      {/* Close */}
      <View style={{ marginTop: 16 }}>
        <SButton variant="ghost" size="sm" onPress={() => navigation.goBack()}>
          {t('common.close')}
        </SButton>
      </View>
    </SafeAreaView>
  );
}
