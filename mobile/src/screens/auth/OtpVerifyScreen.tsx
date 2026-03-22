import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { SOtpInput } from '../../components/molecules';
import SButton from '../../components/atoms/SButton';
import { useVerifyOtp, useSendOtp } from '../../hooks/useAuth';
import { useAuthStore } from '../../stores/useAuthStore';

interface OtpVerifyScreenProps {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<{ OtpVerify: { email: string } }, 'OtpVerify'>;
}

export default function OtpVerifyScreen({ navigation, route }: OtpVerifyScreenProps) {
  const { t } = useTranslation();
  const { email } = route.params;
  const [resendTimer, setResendTimer] = useState(60);
  const verifyOtp = useVerifyOtp();
  const sendOtp = useSendOtp();
  const { isAuthenticated, onboardingStep } = useAuthStore();

  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  // Navigate after successful auth
  useEffect(() => {
    if (isAuthenticated) {
      if (onboardingStep >= 5) {
        navigation.replace('Main');
      } else if (onboardingStep >= 4) {
        navigation.replace('PassportWelcome');
      } else {
        navigation.replace('ProfileSetup');
      }
    }
  }, [isAuthenticated, onboardingStep, navigation]);

  const handleVerify = useCallback((code: string) => {
    verifyOtp.mutate({ email, code });
  }, [email, verifyOtp]);

  const handleResend = () => {
    sendOtp.mutate({ email });
    setResendTimer(60);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0D0D1A' }}>
      <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'center' }}>
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={{ alignItems: 'center' }}>
          <Text style={{ fontFamily: 'PlusJakartaSans-Bold', fontSize: 24, color: '#FFFEF5' }}>
            {t('auth.verificationCode')}
          </Text>
          <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 14, color: '#737373', marginTop: 8, textAlign: 'center' }}>
            {t('auth.enterCode', { email })}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={{ marginTop: 32 }}>
          <SOtpInput length={6} onComplete={handleVerify} />
        </Animated.View>

        {/* Error */}
        {verifyOtp.isError && (
          <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 14, color: '#FF5745', textAlign: 'center', marginTop: 16 }}>
            {t('auth.invalidCode')}
          </Text>
        )}

        {/* Loading */}
        {verifyOtp.isPending && (
          <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 14, color: '#737373', textAlign: 'center', marginTop: 16 }}>
            {t('common.loading')}
          </Text>
        )}

        {/* Resend */}
        <View style={{ alignItems: 'center', marginTop: 32 }}>
          {resendTimer > 0 ? (
            <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 14, color: '#737373' }}>
              {t('auth.resendIn', { seconds: resendTimer })}
            </Text>
          ) : (
            <Pressable onPress={handleResend}>
              <Text style={{ fontFamily: 'PlusJakartaSans-Medium', fontSize: 14, color: '#F5C518' }}>
                {t('auth.resendCode')}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
