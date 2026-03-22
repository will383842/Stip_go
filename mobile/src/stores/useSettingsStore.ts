import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { MMKV } = require('react-native-mmkv');
const storage = new MMKV();

const mmkvStorage: StateStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => storage.delete(name),
};

interface SettingsState {
  darkMode: 'dark' | 'light' | 'system';
  soundsEnabled: boolean;
  hapticEnabled: boolean;
  locale: string;
  textSize: 'small' | 'normal' | 'large';
  reducedMotion: boolean;

  setDarkMode: (mode: 'dark' | 'light' | 'system') => void;
  setSoundsEnabled: (enabled: boolean) => void;
  setHapticEnabled: (enabled: boolean) => void;
  setLocale: (locale: string) => void;
  setTextSize: (size: 'small' | 'normal' | 'large') => void;
  setReducedMotion: (reduced: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      darkMode: 'dark',
      soundsEnabled: true,
      hapticEnabled: true,
      locale: 'fr',
      textSize: 'normal',
      reducedMotion: false,

      setDarkMode: (darkMode) => set({ darkMode }),
      setSoundsEnabled: (soundsEnabled) => set({ soundsEnabled }),
      setHapticEnabled: (hapticEnabled) => set({ hapticEnabled }),
      setLocale: (locale) => set({ locale }),
      setTextSize: (textSize) => set({ textSize }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
    }),
    {
      name: 'settings-store',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
