import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../stores/useAuthStore';
import { useDmStore } from '../stores/useDmStore';
import type { Stamp, PublicProfile } from '../types';

// Auth screens
import SplashScreen from '../screens/auth/SplashScreen';
import AuthScreen from '../screens/auth/AuthScreen';
import OtpVerifyScreen from '../screens/auth/OtpVerifyScreen';
import ProfileSetupScreen from '../screens/auth/ProfileSetupScreen';
import PassportWelcomeScreen from '../screens/auth/PassportWelcomeScreen';
import DeclareCountriesScreen from '../screens/onboarding/DeclareCountriesScreen';

// Main screens
import MapScreen from '../screens/map/MapScreen';
import PassportScreen from '../screens/passport/PassportScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

// Detail screens Sprint 1-2
import SettingsScreen from '../screens/profile/SettingsScreen';
import StampDetailScreen from '../screens/passport/StampDetailScreen';
import ExportScreen from '../screens/passport/ExportScreen';

// Sprint 3-4 screens
import DmListScreen from '../screens/dm/DmListScreen';
import DmChatScreen from '../screens/dm/DmChatScreen';
import ShoutsScreen from '../screens/shouts/ShoutsScreen';
import ShoutDetailScreen from '../screens/shouts/ShoutDetailScreen';
import SquadListScreen from '../screens/squad/SquadListScreen';
import SquadDetailScreen from '../screens/squad/SquadDetailScreen';
import SquadCreateScreen from '../screens/squad/SquadCreateScreen';
import FlashAlertScreen from '../screens/flash/FlashAlertScreen';
import PepiteDetailScreen from '../screens/pepites/PepiteDetailScreen';
import FeedScreen from '../screens/feed/FeedScreen';

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  OtpVerify: { email: string };
  ProfileSetup: undefined;
  PassportWelcome: undefined;
  DeclareCountries: { isOnboarding?: boolean };
  Main: undefined;
  Settings: undefined;
  StampDetail: { stamp: Stamp };
  Export: { stamp?: Stamp } | undefined;
  // Sprint 3-4
  DmList: undefined;
  DmChat: { conversationId: string; otherUser: PublicProfile };
  SquadList: undefined;
  SquadDetail: { squadId: string };
  SquadCreate: undefined;
  Shouts: undefined;
  ShoutDetail: { shoutId: string };
  FlashAlert: undefined;
  PepiteDetail: { pepiteId: string };
  Feed: undefined;
};

export type MainTabParamList = {
  Map: undefined;
  Passport: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#F5C518',
        tabBarInactiveTintColor: '#737373',
        tabBarStyle: {
          backgroundColor: '#0D0D1A',
          borderTopColor: '#1A1A2E',
          borderTopWidth: 1,
          height: 85,
          paddingBottom: 30,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'PlusJakartaSans-Medium',
          fontSize: 12,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'map-outline';
          if (route.name === 'Map') iconName = 'map-outline';
          else if (route.name === 'Passport') iconName = 'book-outline';
          else if (route.name === 'Profile') iconName = 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Map" component={MapScreen} options={{ tabBarLabel: 'Carte' }} />
      <Tab.Screen name="Passport" component={PassportScreen} options={{ tabBarLabel: 'Passport' }} />
      <Tab.Screen name="Profile" component={ProfileScreen as any} options={{ tabBarLabel: 'Profil' }} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { isAuthenticated, isOnboarded } = useAuthStore();

  let initialRoute: keyof RootStackParamList = 'Splash';
  if (isAuthenticated && isOnboarded) {
    initialRoute = 'Main';
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false, animation: 'fade' }}
      >
        {/* Auth flow */}
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="OtpVerify" component={OtpVerifyScreen} />
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
        <Stack.Screen name="PassportWelcome" component={PassportWelcomeScreen} />
        <Stack.Screen name="DeclareCountries" component={DeclareCountriesScreen} />

        {/* Main app */}
        <Stack.Screen name="Main" component={MainTabs} />

        {/* Detail screens — Sprint 1-2 */}
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="StampDetail" component={StampDetailScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Export" component={ExportScreen} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />

        {/* Sprint 3-4 screens */}
        <Stack.Screen name="DmList" component={DmListScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="DmChat" component={DmChatScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Shouts" component={ShoutsScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="ShoutDetail" component={ShoutDetailScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="SquadList" component={SquadListScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="SquadDetail" component={SquadDetailScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="SquadCreate" component={SquadCreateScreen} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="FlashAlert" component={FlashAlertScreen} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="PepiteDetail" component={PepiteDetailScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Feed" component={FeedScreen} options={{ animation: 'slide_from_right' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
