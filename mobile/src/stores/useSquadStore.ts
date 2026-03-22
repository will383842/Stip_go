import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import type { Squad } from '../types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { MMKV } = require('react-native-mmkv');
const storage = new MMKV();
const mmkvStorage: StateStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => storage.delete(name),
};

interface SquadState {
  squads: Squad[];
  currentSquadId: string | null;

  setSquads: (squads: Squad[]) => void;
  setCurrentSquad: (id: string | null) => void;
  updateSquad: (id: string, partial: Partial<Squad>) => void;
  addSquad: (squad: Squad) => void;
  removeSquad: (id: string) => void;
  reset: () => void;
}

export const useSquadStore = create<SquadState>()(
  persist(
    (set) => ({
      squads: [],
      currentSquadId: null,

      setSquads: (squads) => set({ squads }),
      setCurrentSquad: (currentSquadId) => set({ currentSquadId }),
      updateSquad: (id, partial) =>
        set((state) => ({
          squads: state.squads.map((s) => (s.id === id ? { ...s, ...partial } : s)),
        })),
      addSquad: (squad) => set((state) => ({ squads: [squad, ...state.squads] })),
      removeSquad: (id) => set((state) => ({ squads: state.squads.filter((s) => s.id !== id) })),
      reset: () => set({ squads: [], currentSquadId: null }),
    }),
    { name: 'squad-store', storage: createJSONStorage(() => mmkvStorage) },
  ),
);
