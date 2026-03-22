import React, { useState, useEffect } from 'react';
import { View, Text, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import SButton from '../../components/atoms/SButton';
import { SStampAnimation } from '../../components/organisms';
import { useAuthStore } from '../../stores/useAuthStore';
import { useUpdateProfile } from '../../hooks/useAuth';
import { requestLocationPermission, getCurrentCity } from '../../hooks/useLocation';
import { haptic } from '../../utils/haptics';
import { playSound } from '../../utils/audio';

interface PassportWelcomeScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

export default function PassportWelcomeScreen({ navigation }: PassportWelcomeScreenProps) {
  const { t } = useTranslation();
  const [cityName, setCityName] = useState<string | null>(null);
  const [showStampAnimation, setShowStampAnimation] = useState(false);
  const [stampDone, setStampDone] = useState(false);
  const [gpsRequested, setGpsRequested] = useState(false);
  const [gpsDenied, setGpsDenied] = useState(false);
  const updateProfile = useUpdateProfile();
  const { setOnboardingStep, setOnboarded } = useAuthStore();

  const passportScale = useSharedValue(0.9);
  const passportOpacity = useSharedValue(0);

  useEffect(() => {
    passportOpacity.value = withSpring(1);
    passportScale.value = withSpring(1, { damping: 12, stiffness: 80 });
  }, [passportScale, passportOpacity]);

  const passportStyle = useAnimatedStyle(() => ({
    transform: [{ scale: passportScale.value }],
    opacity: passportOpacity.value,
  }));

  const handleActivateGps = async () => {
    setGpsRequested(true);
    const granted = await requestLocationPermission();

    if (!granted) {
      haptic.notification();
      setGpsDenied(true);
      // Fallback — use GeoIP city name as approximation
      setCityName('ta ville');
      return;
    }
    setGpsDenied(false);

    // Get current city
    const address = await getCurrentCity();
    const city = address?.city || address?.region || 'Unknown';
    setCityName(city);

    // Show stamp animation
    haptic.heavy();
    playSound('thud_city');
    setShowStampAnimation(true);
  };

  const handleStampAnimationComplete = () => {
    setShowStampAnimation(false);
    setStampDone(true);

    // Update onboarding step
    updateProfile.mutate(
      { onboarding_step: 5 },
      {
        onSuccess: () => {
          setOnboardingStep(5);
          setOnboarded(true);
        },
      },
    );
  };

  const handleExploreMap = () => {
    // After first stamp → show declare countries screen (onboarding)
    navigation.replace('DeclareCountries', { isOnboarding: true });
  };

  const handleShare = () => {
    // Navigate to export screen with the first stamp
    navigation.navigate('Export');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0D0D1A' }}>
      {showStampAnimation && cityName && (
        <SStampAnimation
          stampType="city"
          stampName={cityName}
          onComplete={handleStampAnimationComplete}
        />
      )}

      <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'center', alignItems: 'center' }}>
        {/* Passport visual */}
        <Animated.View style={[passportStyle, { alignItems: 'center' }]}>
          {/* Glassmorphism passport card */}
          <View
            style={{
              width: 260,
              height: 360,
              borderRadius: 24,
              backgroundColor: 'rgba(26,26,46,0.85)',
              borderWidth: 1,
              borderColor: 'rgba(245,197,24,0.3)',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
            }}
          >
            <Text style={{ fontSize: 48 }}>{'\u{1F30D}'}</Text>
            <Text
              style={{
                fontFamily: 'PlusJakartaSans-Bold',
                fontSize: 18,
                color: '#F5C518',
                marginTop: 16,
                letterSpacing: 3,
              }}
            >
              WORLD PASSPORT
            </Text>

            {/* Empty pages visual */}
            <View style={{ marginTop: 24, width: '100%', gap: 8 }}>
              {[1, 2, 3].map((i) => (
                <View
                  key={i}
                  style={{
                    height: 2,
                    backgroundColor: 'rgba(245,197,24,0.15)',
                    borderRadius: 1,
                  }}
                />
              ))}
            </View>

            {stampDone && cityName && (
              <Animated.View entering={FadeIn.delay(200).duration(400)} style={{ marginTop: 16, alignItems: 'center' }}>
                <Text style={{ fontSize: 28 }}>{'\u{1F3D9}\uFE0F'}</Text>
                <Text style={{ fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 14, color: '#F5C518', marginTop: 4 }}>
                  {cityName}
                </Text>
              </Animated.View>
            )}
          </View>
        </Animated.View>

        {/* Title text */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={{ marginTop: 32, alignItems: 'center' }}>
          <Text style={{ fontFamily: 'PlusJakartaSans-Bold', fontSize: 24, color: '#FFFEF5', textAlign: 'center' }}>
            {t('onboarding.passportTitle')}
          </Text>

          {cityName ? (
            <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 16, color: '#737373', marginTop: 8, textAlign: 'center' }}>
              {t('onboarding.passportSubtitle', { city: cityName, count: 42 })}
            </Text>
          ) : (
            <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 16, color: '#737373', marginTop: 8, textAlign: 'center' }}>
              {t('onboarding.activateGps')}
            </Text>
          )}
        </Animated.View>

        {/* Social proof */}
        {stampDone && cityName && (
          <Animated.View entering={FadeInDown.delay(400).duration(400)} style={{ marginTop: 12 }}>
            <Text style={{ fontFamily: 'PlusJakartaSans-Medium', fontSize: 14, color: '#00D4FF', textAlign: 'center' }}>
              {t('onboarding.explorer', { rank: 847, city: cityName })}
            </Text>
          </Animated.View>
        )}

        {/* GPS denied message */}
        {gpsDenied && (
          <Animated.View entering={FadeInDown.delay(400).duration(400)} style={{ marginTop: 12, alignItems: 'center' }}>
            <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 14, color: '#FF5745', textAlign: 'center' }}>
              {t('onboarding.gpsPermissionDenied')}
            </Text>
            <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 13, color: '#737373', marginTop: 4, textAlign: 'center' }}>
              {t('onboarding.gpsPermissionDesc')}
            </Text>
          </Animated.View>
        )}

        {/* CTA */}
        <Animated.View entering={FadeInDown.delay(500).duration(400)} style={{ marginTop: 32, width: '100%', gap: 12 }}>
          {gpsDenied ? (
            <>
              <SButton variant="primary" size="lg" onPress={() => Linking.openSettings()}>
                {t('onboarding.openSettings')}
              </SButton>
              <SButton variant="ghost" size="lg" onPress={handleExploreMap}>
                {t('common.skip')}
              </SButton>
            </>
          ) : !gpsRequested ? (
            <SButton variant="primary" size="lg" onPress={handleActivateGps}>
              {t('onboarding.activateGps')}
            </SButton>
          ) : stampDone ? (
            <>
              <SButton variant="primary" size="lg" onPress={handleShare}>
                {t('onboarding.shareStories')}
              </SButton>
              <SButton variant="ghost" size="lg" onPress={handleExploreMap}>
                {t('onboarding.exploreMap')}
              </SButton>
            </>
          ) : (
            <SButton variant="primary" size="lg" onPress={handleExploreMap} loading>
              {t('common.loading')}
            </SButton>
          )}
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
