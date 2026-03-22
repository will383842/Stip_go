import React, { useEffect, useRef } from 'react';
import { View, Text, useColorScheme } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, FadeOut } from 'react-native-reanimated';
import { useAuthStore } from '../../stores/useAuthStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface SplashScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

export default function SplashScreen({ navigation }: SplashScreenProps) {
  const { isAuthenticated, isOnboarded, onboardingStep } = useAuthStore();
  const { darkMode } = useSettingsStore();
  const systemTheme = useColorScheme();
  const logoScale = useSharedValue(0.8);
  const logoOpacity = useSharedValue(0);
  const hasNavigated = useRef(false);

  // Resolve effective theme
  const isDark = darkMode === 'system' ? systemTheme !== 'light' : darkMode === 'dark';

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 500 });
    logoScale.value = withTiming(1, { duration: 800 });

    const timer = setTimeout(() => {
      if (hasNavigated.current) return;
      hasNavigated.current = true;

      if (isAuthenticated && isOnboarded) {
        // J2+ — skip splash, direct to map
        navigation.replace('Main');
      } else if (isAuthenticated && onboardingStep >= 4) {
        navigation.replace('PassportWelcome');
      } else if (isAuthenticated && onboardingStep >= 3) {
        navigation.replace('ProfileSetup');
      } else {
        navigation.replace('Auth');
      }
    }, isAuthenticated && isOnboarded ? 0 : 2500); // Skip splash if returning user

    return () => clearTimeout(timer);
  }, [isAuthenticated, isOnboarded, onboardingStep, navigation, logoScale, logoOpacity]);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  // J2+ returning users: skip entirely (timer = 0ms above)
  if (isAuthenticated && isOnboarded) return null;

  return (
    <Animated.View
      exiting={FadeOut.duration(300)}
      style={{
        flex: 1,
        backgroundColor: isDark ? '#0D0D1A' : '#FFFEF5',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Animated.View style={[logoStyle, { alignItems: 'center' }]}>
        <Text style={{ fontSize: 64 }}>{'\u{1F30D}'}</Text>
        <Text
          style={{
            fontFamily: 'PlusJakartaSans-Bold',
            fontSize: 36,
            color: '#F5C518',
            marginTop: 16,
          }}
        >
          Stip Me
        </Text>
        <Text
          style={{
            fontFamily: 'PlusJakartaSans-Regular',
            fontSize: 16,
            color: isDark ? '#737373' : '#A3A3A3',
            marginTop: 8,
          }}
        >
          Tamponne le monde.
        </Text>
      </Animated.View>
    </Animated.View>
  );
}
