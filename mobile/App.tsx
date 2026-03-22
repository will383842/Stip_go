import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, AccessibilityInfo } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import RootNavigator from './src/navigation/RootNavigator';
import { useSettingsStore } from './src/stores/useSettingsStore';
import { useAppVersion } from './src/hooks/useAppVersion';
import { preloadSounds } from './src/utils/audio';
import './src/i18n';

// Prevent splash from auto-hiding
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function ForceUpdateScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0D0D1A', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
      <Text style={{ fontSize: 48 }}>{'\u{1F504}'}</Text>
      <Text style={{ fontFamily: 'PlusJakartaSans-Bold', fontSize: 24, color: '#FFFEF5', marginTop: 16, textAlign: 'center' }}>
        Mise à jour requise
      </Text>
      <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 16, color: '#737373', marginTop: 8, textAlign: 'center' }}>
        Une nouvelle version est disponible.
      </Text>
    </View>
  );
}

function AppContent() {
  const { darkMode, setReducedMotion } = useSettingsStore();

  // Check reduced motion preference
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion);
    const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducedMotion);
    return () => listener.remove();
  }, [setReducedMotion]);

  return (
    <>
      <RootNavigator />
      <StatusBar style={darkMode === 'dark' ? 'light' : 'dark'} />
    </>
  );
}

export default function App() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Load fonts
        await Font.loadAsync({
          'PlusJakartaSans-Regular': require('./src/assets/fonts/PlusJakartaSans-Regular.ttf'),
          'PlusJakartaSans-Medium': require('./src/assets/fonts/PlusJakartaSans-Medium.ttf'),
          'PlusJakartaSans-SemiBold': require('./src/assets/fonts/PlusJakartaSans-SemiBold.ttf'),
          'PlusJakartaSans-Bold': require('./src/assets/fonts/PlusJakartaSans-Bold.ttf'),
        });

        // Preload sounds
        await preloadSounds();
      } catch {
        // Font/sound loading failed — continue with system fonts
      } finally {
        setAppReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appReady) {
      await SplashScreen.hideAsync();
    }
  }, [appReady]);

  if (!appReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AppContent />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
