import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import type { Conversation } from '../types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { MMKV } = require('react-native-mmkv');
const storage = new MMKV();
const mmkvStorage: StateStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => storage.delete(name),
};

interface DmState {
  conversations: Conversation[];
  unreadCount: number;
  currentConversationId: string | null;

  setConversations: (conversations: Conversation[]) => void;
  setUnreadCount: (count: number) => void;
  setCurrentConversation: (id: string | null) => void;
  updateConversation: (id: string, partial: Partial<Conversation>) => void;
  reset: () => void;
}

export const useDmStore = create<DmState>()(
  persist(
    (set) => ({
      conversations: [],
      unreadCount: 0,
      currentConversationId: null,

      setConversations: (conversations) => set({ conversations }),
      setUnreadCount: (unreadCount) => set({ unreadCount }),
      setCurrentConversation: (currentConversationId) => set({ currentConversationId }),
      updateConversation: (id, partial) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, ...partial } : c,
          ),
        })),
      reset: () => set({ conversations: [], unreadCount: 0, currentConversationId: null }),
    }),
    { name: 'dm-store', storage: createJSONStorage(() => mmkvStorage) },
  ),
);
