import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import SButton from '../../components/atoms/SButton';
import SInput from '../../components/atoms/SInput';
import { useUpdateProfile } from '../../hooks/useAuth';
import { useAuthStore } from '../../stores/useAuthStore';
import { birthYearOptions, isTooYoung, isMinor } from '../../utils/helpers';
import { haptic } from '../../utils/haptics';

interface ProfileSetupScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

export default function ProfileSetupScreen({ navigation }: ProfileSetupScreenProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [birthYear, setBirthYear] = useState<number | null>(null);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [tooYoung, setTooYoung] = useState(false);
  const [nameError, setNameError] = useState('');

  const updateProfile = useUpdateProfile();
  const { setIsMinor, setOnboardingStep } = useAuthStore();
  const years = birthYearOptions();

  const handleContinue = () => {
    if (!name.trim()) {
      setNameError(t('auth.whatsYourName'));
      return;
    }
    if (!birthYear) return;
    if (!termsAccepted) return;

    if (isTooYoung(birthYear)) {
      setTooYoung(true);
      haptic.notification();
      return;
    }

    const minor = isMinor(birthYear);
    setIsMinor(minor);

    updateProfile.mutate(
      {
        name: name.trim(),
        birth_year: birthYear,
        onboarding_step: 4,
      },
      {
        onSuccess: () => {
          setOnboardingStep(4);
          navigation.replace('PassportWelcome');
        },
      },
    );
  };

  if (tooYoung) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0D0D1A', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
        <Text style={{ fontSize: 48 }}>{'\u{1F6AB}'}</Text>
        <Text style={{ fontFamily: 'PlusJakartaSans-Bold', fontSize: 24, color: '#FFFEF5', marginTop: 16, textAlign: 'center' }}>
          {t('auth.tooYoung')}
        </Text>
        <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 16, color: '#737373', marginTop: 8, textAlign: 'center' }}>
          {t('auth.tooYoungDesc')}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0D0D1A' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, justifyContent: 'center' }}>
        {/* Title */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Text style={{ fontFamily: 'PlusJakartaSans-Bold', fontSize: 24, color: '#FFFEF5', textAlign: 'center' }}>
            {t('auth.whatsYourName')}
          </Text>
        </Animated.View>

        {/* Name input */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={{ marginTop: 32 }}>
          <SInput
            value={name}
            onChangeText={(text) => { setName(text.slice(0, 30)); setNameError(''); }}
            placeholder={t('auth.namePlaceholder')}
            icon="person-outline"
            error={nameError}
            autoCapitalize="words"
            maxLength={30}
          />
        </Animated.View>

        {/* Birth year */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={{ marginTop: 20 }}>
          <Text style={{ fontFamily: 'PlusJakartaSans-Medium', fontSize: 14, color: '#FFFEF5', marginBottom: 4 }}>
            {t('auth.birthYear')}
          </Text>
          <Pressable
            onPress={() => { setShowYearPicker(!showYearPicker); haptic.light(); }}
            style={{
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderWidth: 1,
              borderColor: birthYear ? '#F5C518' : '#404040',
              backgroundColor: 'rgba(26,26,46,0.8)',
            }}
          >
            <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 16, color: birthYear ? '#FFFEF5' : '#737373' }}>
              {birthYear || t('auth.birthYearPlaceholder')}
            </Text>
          </Pressable>

          {showYearPicker && (
            <ScrollView
              style={{
                maxHeight: 200,
                marginTop: 8,
                borderRadius: 12,
                backgroundColor: '#1A1A2E',
                borderWidth: 1,
                borderColor: '#404040',
              }}
            >
              {years.map((year) => (
                <Pressable
                  key={year}
                  onPress={() => { setBirthYear(year); setShowYearPicker(false); haptic.light(); }}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    backgroundColor: year === birthYear ? 'rgba(245,197,24,0.1)' : 'transparent',
                  }}
                >
                  <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 16, color: year === birthYear ? '#F5C518' : '#FFFEF5' }}>
                    {year}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </Animated.View>

        {/* Terms checkbox */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)} style={{ marginTop: 24 }}>
          <Pressable
            onPress={() => { setTermsAccepted(!termsAccepted); haptic.light(); }}
            style={{ flexDirection: 'row', alignItems: 'flex-start' }}
          >
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                borderWidth: 2,
                borderColor: termsAccepted ? '#F5C518' : '#404040',
                backgroundColor: termsAccepted ? '#F5C518' : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 10,
                marginTop: 2,
              }}
            >
              {termsAccepted && (
                <Text style={{ color: '#1A1A2E', fontSize: 14, fontWeight: 'bold' }}>✓</Text>
              )}
            </View>
            <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 14, color: '#FFFEF5', flex: 1 }}>
              {t('auth.acceptTerms')}{' '}
              <Text style={{ color: '#F5C518', textDecorationLine: 'underline' }}>{t('auth.termsOfService')}</Text>
              {' '}{t('auth.and')}{' '}
              <Text style={{ color: '#F5C518', textDecorationLine: 'underline' }}>{t('auth.privacyPolicy')}</Text>
            </Text>
          </Pressable>
        </Animated.View>

        {/* Continue button */}
        <Animated.View entering={FadeInDown.delay(500).duration(400)} style={{ marginTop: 32, marginBottom: 24 }}>
          <SButton
            variant="primary"
            size="lg"
            onPress={handleContinue}
            loading={updateProfile.isPending}
            disabled={!name.trim() || !birthYear || !termsAccepted}
          >
            {t('common.continue')}
          </SButton>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
