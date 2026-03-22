import React from 'react';
import { View, Text, ScrollView, Switch, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import SIcon from '../../components/atoms/SIcon';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useUpdateSettings, useDeleteAccount } from '../../hooks/useAuth';
import { haptic } from '../../utils/haptics';
import { api } from '../../services/api';

interface SettingsScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

function SettingRow({ icon, label, description, children }: {
  icon: string;
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, minHeight: 48 }}>
      <SIcon name={icon as any} size={22} color="#737373" />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ fontFamily: 'PlusJakartaSans-Medium', fontSize: 16, color: '#FFFEF5' }}>
          {label}
        </Text>
        {description && (
          <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, color: '#737373', marginTop: 2 }}>
            {description}
          </Text>
        )}
      </View>
      {children}
    </View>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <Text
      style={{
        fontFamily: 'PlusJakartaSans-SemiBold',
        fontSize: 12,
        color: '#737373',
        textTransform: 'uppercase',
        letterSpacing: 1,
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 8,
      }}
    >
      {title}
    </Text>
  );
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: '#404040', marginHorizontal: 16 }} />;
}

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const { t, i18n } = useTranslation();
  const settings = useSettingsStore();
  const { isMinor, user, logout } = useAuthStore();
  const updateSettings = useUpdateSettings();
  const deleteAccount = useDeleteAccount();

  const toggleDarkMode = () => {
    const next = settings.darkMode === 'dark' ? 'light' : 'dark';
    settings.setDarkMode(next);
    updateSettings.mutate({ dark_mode: next });
    haptic.light();
  };

  const toggleSounds = () => {
    settings.setSoundsEnabled(!settings.soundsEnabled);
    updateSettings.mutate({ sounds_enabled: !settings.soundsEnabled });
    haptic.light();
  };

  const toggleHaptic = () => {
    const newVal = !settings.hapticEnabled;
    settings.setHapticEnabled(newVal);
    updateSettings.mutate({ haptic_enabled: newVal });
    if (newVal) haptic.light();
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(newLang);
    settings.setLocale(newLang);
    haptic.light();
  };

  const handleExportData = () => {
    // RGPD export — returns 202
    api.post('/users/me/export').then(() => {
      Alert.alert(t('settings.exportRequested'), t('settings.exportRequestedDesc'));
    }).catch(() => {
      Alert.alert(t('common.error'), t('common.retry'));
    });
    haptic.light();
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('settings.deleteAccount'),
      t('settings.deleteConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.confirm'), style: 'destructive', onPress: () => deleteAccount.mutate() },
      ],
    );
  };

  const handleLogout = () => {
    logout();
    haptic.medium();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0D0D1A' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}>
        <Pressable onPress={() => navigation.goBack()} style={{ padding: 4, minWidth: 48, minHeight: 48, justifyContent: 'center' }}>
          <SIcon name="arrow-back" size={24} color="#FFFEF5" />
        </Pressable>
        <Text style={{ fontFamily: 'PlusJakartaSans-SemiBold', fontSize: 18, color: '#FFFEF5', marginLeft: 12 }}>
          {t('settings.title')}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ═══ SECTION 1: Compte ═══ */}
        <SectionTitle title={t('settings.account')} />
        <View style={{ backgroundColor: '#1A1A2E', borderRadius: 16, marginHorizontal: 16 }}>
          <SettingRow icon="person-outline" label={t('profile.username')}>
            <Text style={{ fontFamily: 'PlusJakartaSans-Medium', fontSize: 14, color: '#737373' }}>
              @{user?.username}
            </Text>
          </SettingRow>
          <Divider />
          <SettingRow icon="mail-outline" label="Email">
            <Text style={{ fontFamily: 'PlusJakartaSans-Medium', fontSize: 14, color: '#737373' }}>
              {user?.email || '-'}
            </Text>
          </SettingRow>
        </View>

        {/* ═══ SECTION: Mon Passport ═══ */}
        <SectionTitle title={t('passport.title')} />
        <View style={{ backgroundColor: '#1A1A2E', borderRadius: 16, marginHorizontal: 16 }}>
          <Pressable onPress={() => navigation.navigate('DeclareCountries', { isOnboarding: false })}>
            <SettingRow icon="airplane-outline" label={t('declare.settingsButton')}>
              <SIcon name="chevron-forward" size={20} color="#737373" />
            </SettingRow>
          </Pressable>
        </View>

        {/* ═══ SECTION 2: Apparence ═══ */}
        <SectionTitle title={t('settings.appearance')} />
        <View style={{ backgroundColor: '#1A1A2E', borderRadius: 16, marginHorizontal: 16 }}>
          <SettingRow icon="moon-outline" label={t('settings.darkMode')}>
            <Switch
              value={settings.darkMode === 'dark'}
              onValueChange={toggleDarkMode}
              trackColor={{ false: '#404040', true: '#F5C518' }}
              thumbColor="#FFFEF5"
            />
          </SettingRow>
          <Divider />
          <Pressable onPress={toggleLanguage}>
            <SettingRow icon="globe-outline" label={t('settings.language')}>
              <Text style={{ fontFamily: 'PlusJakartaSans-Medium', fontSize: 14, color: '#F5C518' }}>
                {i18n.language === 'fr' ? 'Français' : 'English'}
              </Text>
            </SettingRow>
          </Pressable>
        </View>

        {/* ═══ SECTION 3: Notifications ═══ */}
        <SectionTitle title={t('settings.notifications')} />
        <View style={{ backgroundColor: '#1A1A2E', borderRadius: 16, marginHorizontal: 16 }}>
          <SettingRow icon="volume-high-outline" label={t('settings.sounds')} description={t('settings.soundsDesc')}>
            <Switch
              value={settings.soundsEnabled}
              onValueChange={toggleSounds}
              trackColor={{ false: '#404040', true: '#F5C518' }}
              thumbColor="#FFFEF5"
            />
          </SettingRow>
          <Divider />
          <SettingRow icon="phone-portrait-outline" label={t('settings.haptic')} description={t('settings.hapticDesc')}>
            <Switch
              value={settings.hapticEnabled}
              onValueChange={toggleHaptic}
              trackColor={{ false: '#404040', true: '#F5C518' }}
              thumbColor="#FFFEF5"
            />
          </SettingRow>
        </View>

        {/* ═══ SECTION 4: Confidentialité ═══ */}
        <SectionTitle title={t('settings.privacy')} />
        <View style={{ backgroundColor: '#1A1A2E', borderRadius: 16, marginHorizontal: 16 }}>
          {/* Invisible mode */}
          <SettingRow
            icon="eye-off-outline"
            label={t('profile.invisibleMode')}
            description={isMinor ? t('profile.invisibleMinor') : t('profile.invisibleModeDesc')}
          >
            <Switch
              value={isMinor ? true : false}
              disabled={isMinor}
              onValueChange={() => { if (!isMinor) haptic.light(); }}
              trackColor={{ false: '#404040', true: '#00D4FF' }}
              thumbColor="#FFFEF5"
            />
          </SettingRow>
          <Divider />
          {/* RGPD data export */}
          <Pressable onPress={handleExportData}>
            <SettingRow icon="download-outline" label={t('settings.exportData')} description={t('settings.exportDataDesc')}>
              <SIcon name="chevron-forward" size={20} color="#737373" />
            </SettingRow>
          </Pressable>
        </View>

        {/* ═══ SECTION 5: Aide ═══ */}
        <SectionTitle title={t('settings.help')} />
        <View style={{ backgroundColor: '#1A1A2E', borderRadius: 16, marginHorizontal: 16 }}>
          <Pressable>
            <SettingRow icon="help-circle-outline" label={t('settings.helpCenter')}>
              <SIcon name="chevron-forward" size={20} color="#737373" />
            </SettingRow>
          </Pressable>
          <Divider />
          <Pressable>
            <SettingRow icon="chatbubble-outline" label={t('settings.contactUs')}>
              <SIcon name="chevron-forward" size={20} color="#737373" />
            </SettingRow>
          </Pressable>
        </View>

        {/* ═══ SECTION 6: À propos ═══ */}
        <SectionTitle title={t('settings.about')} />
        <View style={{ backgroundColor: '#1A1A2E', borderRadius: 16, marginHorizontal: 16 }}>
          <Pressable onPress={handleLogout}>
            <SettingRow icon="log-out-outline" label={t('settings.logout')}>
              <SIcon name="chevron-forward" size={20} color="#737373" />
            </SettingRow>
          </Pressable>
          <Divider />
          <Pressable onPress={handleDeleteAccount}>
            <SettingRow icon="trash-outline" label={t('settings.deleteAccount')} description={t('settings.deleteAccountDesc')}>
              <SIcon name="chevron-forward" size={20} color="#FF5745" />
            </SettingRow>
          </Pressable>
        </View>

        {/* Version */}
        <View style={{ alignItems: 'center', paddingVertical: 32 }}>
          <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, color: '#737373' }}>
            {t('settings.version')} 0.1.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
