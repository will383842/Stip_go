import React, { useState } from 'react';
import { View, Text, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import SButton from '../../components/atoms/SButton';
import SInput from '../../components/atoms/SInput';
import { useSendOtp, useSocialAuth } from '../../hooks/useAuth';
import { haptic } from '../../utils/haptics';
import { isIOS } from '../../utils/helpers';

interface AuthScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

export default function AuthScreen({ navigation }: AuthScreenProps) {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const sendOtp = useSendOtp();
  const socialAuth = useSocialAuth();

  const handleSocialAuth = async (provider: 'apple' | 'google') => {
    haptic.medium();
    // Real implementation would use expo-apple-authentication / expo-auth-session
  };

  const handleSendOtp = async () => {
    if (!email.trim()) return;
    haptic.light();
    sendOtp.mutate(
      { email: email.trim() },
      { onSuccess: () => navigation.navigate('OtpVerify', { email: email.trim() }) },
    );
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(newLang);
    haptic.selection();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0D0D1A' }}>
      <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'center' }}>
        {/* Logo */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={{ alignItems: 'center', marginBottom: 48 }}>
          <Text style={{ fontSize: 56 }}>{'\u{1F30D}'}</Text>
          <Text style={{ fontFamily: 'PlusJakartaSans-Bold', fontSize: 30, color: '#F5C518', marginTop: 12 }}>
            Stip Me
          </Text>
          <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 16, color: '#737373', marginTop: 4 }}>
            {t('auth.tagline')}
          </Text>
        </Animated.View>

        {/* Social auth — Apple (iOS) / Google (Android) */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          {isIOS ? (
            <Pressable
              onPress={() => handleSocialAuth('apple')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#FFFEF5',
                borderRadius: 24,
                paddingVertical: 14,
                minHeight: 52,
                gap: 8,
              }}
            >
              <Ionicons name="logo-apple" size={20} color="#1A1A2E" />
              <Text style={{ fontFamily: 'PlusJakartaSans-Bold', fontSize: 16, color: '#1A1A2E' }}>
                {t('auth.continueWithApple')}
              </Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => handleSocialAuth('google')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#FFFEF5',
                borderRadius: 24,
                paddingVertical: 14,
                minHeight: 52,
                gap: 8,
              }}
            >
              <Ionicons name="logo-google" size={20} color="#1A1A2E" />
              <Text style={{ fontFamily: 'PlusJakartaSans-Bold', fontSize: 16, color: '#1A1A2E' }}>
                {t('auth.continueWithGoogle')}
              </Text>
            </Pressable>
          )}
        </Animated.View>

        {/* Email auth — secondary style */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={{ marginTop: 16 }}>
          {!showEmailForm ? (
            <SButton variant="secondary" size="lg" onPress={() => setShowEmailForm(true)}>
              {t('auth.continueWithEmail')}
            </SButton>
          ) : (
            <View style={{ gap: 12 }}>
              <SInput
                value={email}
                onChangeText={setEmail}
                placeholder={t('auth.emailPlaceholder')}
                icon="mail-outline"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
              <SButton
                variant="primary"
                size="lg"
                onPress={handleSendOtp}
                loading={sendOtp.isPending}
                disabled={!email.trim()}
              >
                {t('auth.sendCode')}
              </SButton>
            </View>
          )}
        </Animated.View>

        {/* Error */}
        {sendOtp.isError && (
          <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 14, color: '#FF5745', textAlign: 'center', marginTop: 12 }}>
            {t('common.error')}
          </Text>
        )}

        {/* CGU legal text */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)} style={{ marginTop: 24, alignItems: 'center' }}>
          <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 13, color: '#737373', textAlign: 'center', lineHeight: 18 }}>
            {t('auth.acceptTerms')}{' '}
            <Text
              style={{ color: '#F5C518', textDecorationLine: 'underline' }}
              onPress={() => Linking.openURL('https://stip-me.com/terms')}
            >
              {t('auth.termsOfService')}
            </Text>
            {' '}{t('auth.and')}{' '}
            <Text
              style={{ color: '#F5C518', textDecorationLine: 'underline' }}
              onPress={() => Linking.openURL('https://stip-me.com/privacy')}
            >
              {t('auth.privacyPolicy')}
            </Text>
          </Text>
        </Animated.View>
      </View>

      {/* Change language — bottom */}
      <Pressable onPress={toggleLanguage} style={{ alignItems: 'center', paddingBottom: 24 }}>
        <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 14, color: '#737373' }}>
          {t('auth.changeLanguage')}
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}
