import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import type { Stamp, UserBadge, PassportLevel, PassportStats, StampedCountry } from '../types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { MMKV } = require('react-native-mmkv');
const storage = new MMKV();

const mmkvStorage: StateStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => storage.delete(name),
};

const defaultStats: PassportStats = {
  total_stamps: 0,
  countries_visited: 0,
  verified_countries: 0,
  declared_countries: 0,
  cities_visited: 0,
  regions_visited: 0,
  spots_visited: 0,
  days_active: 0,
};

interface PassportState {
  stamps: Stamp[];
  stampedCountries: StampedCountry[];
  badges: UserBadge[];
  stats: PassportStats;
  currentLevel: PassportLevel | null;
  nextLevel: PassportLevel | null;

  setStamps: (stamps: Stamp[]) => void;
  setStampedCountries: (countries: StampedCountry[]) => void;
  addStamp: (stamp: Stamp) => void;
  setBadges: (badges: UserBadge[]) => void;
  setStats: (stats: PassportStats) => void;
  setLevels: (current: PassportLevel, next?: PassportLevel) => void;
  reset: () => void;
}

export const usePassportStore = create<PassportState>()(
  persist(
    (set) => ({
      stamps: [],
      stampedCountries: [],
      badges: [],
      stats: defaultStats,
      currentLevel: null,
      nextLevel: null,

      setStamps: (stamps) => set({ stamps }),
      setStampedCountries: (stampedCountries) => set({ stampedCountries }),
      addStamp: (stamp) => set((state) => ({ stamps: [stamp, ...state.stamps] })),
      setBadges: (badges) => set({ badges }),
      setStats: (stats) => set({ stats }),
      setLevels: (current, next) => set({ currentLevel: current, nextLevel: next ?? null }),
      reset: () => set({ stamps: [], stampedCountries: [], badges: [], stats: defaultStats, currentLevel: null, nextLevel: null }),
    }),
    {
      name: 'passport-store',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
