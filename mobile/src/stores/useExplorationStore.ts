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

interface ExplorationState {
  exploredTiles: string[]; // H3 indexes
  coveragePercent: number;
  currentCity: string;

  setExploredTiles: (tiles: string[]) => void;
  addExploredTile: (h3Index: string) => void;
  setCoveragePercent: (percent: number) => void;
  setCurrentCity: (city: string) => void;
  reset: () => void;
}

export const useExplorationStore = create<ExplorationState>()(
  persist(
    (set) => ({
      exploredTiles: [],
      coveragePercent: 0,
      currentCity: '',

      setExploredTiles: (exploredTiles) => set({ exploredTiles }),
      addExploredTile: (h3Index) =>
        set((state) => ({
          exploredTiles: state.exploredTiles.includes(h3Index)
            ? state.exploredTiles
            : [...state.exploredTiles, h3Index],
        })),
      setCoveragePercent: (coveragePercent) => set({ coveragePercent }),
      setCurrentCity: (currentCity) => set({ currentCity }),
      reset: () => set({ exploredTiles: [], coveragePercent: 0, currentCity: '' }),
    }),
    { name: 'exploration-store', storage: createJSONStorage(() => mmkvStorage) },
  ),
);
