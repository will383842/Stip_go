import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import type { Cluster, Position } from '../types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { MMKV } = require('react-native-mmkv');
const storage = new MMKV();

const mmkvStorage: StateStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => storage.delete(name),
};

interface MapState {
  currentPosition: Position | null;
  clusters: Cluster[];
  zoomLevel: number;
  mapStyle: 'dark' | 'light';
  socialProofCount: number;

  setCurrentPosition: (pos: Position | null) => void;
  setClusters: (clusters: Cluster[]) => void;
  setZoomLevel: (zoom: number) => void;
  setMapStyle: (style: 'dark' | 'light') => void;
  setSocialProofCount: (count: number) => void;
}

export const useMapStore = create<MapState>()(
  persist(
    (set) => ({
      currentPosition: null,
      clusters: [],
      zoomLevel: 10,
      mapStyle: 'dark',
      socialProofCount: 0,

      setCurrentPosition: (currentPosition) => set({ currentPosition }),
      setClusters: (clusters) => set({ clusters }),
      setZoomLevel: (zoomLevel) => set({ zoomLevel }),
      setMapStyle: (mapStyle) => set({ mapStyle }),
      setSocialProofCount: (socialProofCount) => set({ socialProofCount }),
    }),
    {
      name: 'map-store',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
