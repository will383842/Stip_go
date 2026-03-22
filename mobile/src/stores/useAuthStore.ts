import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import type { User } from '../types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { MMKV } = require('react-native-mmkv');
const storage = new MMKV();

const mmkvStorage: StateStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => storage.delete(name),
};

// Tokens in SecureStore (encrypted), NOT MMKV
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setTokens(token: string, refreshToken: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  onboardingStep: number;
  isMinor: boolean;

  setUser: (user: User | null) => void;
  setOnboarded: (value: boolean) => void;
  setOnboardingStep: (step: number) => void;
  setIsMinor: (value: boolean) => void;
  updateUser: (partial: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isOnboarded: false,
      onboardingStep: 1,
      isMinor: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          onboardingStep: user?.onboarding_step ?? 1,
        }),

      setOnboarded: (isOnboarded) => set({ isOnboarded }),
      setOnboardingStep: (onboardingStep) => set({ onboardingStep }),
      setIsMinor: (isMinor) => set({ isMinor }),

      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),

      logout: async () => {
        await clearTokens();
        set({
          user: null,
          isAuthenticated: false,
          isOnboarded: false,
          onboardingStep: 1,
          isMinor: false,
        });
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
