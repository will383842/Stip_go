import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import type { Friendship, Shout } from '../types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { MMKV } = require('react-native-mmkv');
const storage = new MMKV();
const mmkvStorage: StateStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => storage.delete(name),
};

interface SocialState {
  friends: Friendship[];
  friendRequests: Friendship[];
  nearbyShouts: Shout[];

  setFriends: (friends: Friendship[]) => void;
  setFriendRequests: (requests: Friendship[]) => void;
  setNearbyShouts: (shouts: Shout[]) => void;
  addFriend: (friendship: Friendship) => void;
  removeFriend: (friendId: string) => void;
  reset: () => void;
}

export const useSocialStore = create<SocialState>()(
  persist(
    (set) => ({
      friends: [],
      friendRequests: [],
      nearbyShouts: [],

      setFriends: (friends) => set({ friends }),
      setFriendRequests: (friendRequests) => set({ friendRequests }),
      setNearbyShouts: (nearbyShouts) => set({ nearbyShouts }),
      addFriend: (friendship) => set((state) => ({ friends: [friendship, ...state.friends] })),
      removeFriend: (friendId) =>
        set((state) => ({ friends: state.friends.filter((f) => f.friend_id !== friendId) })),
      reset: () => set({ friends: [], friendRequests: [], nearbyShouts: [] }),
    }),
    { name: 'social-store', storage: createJSONStorage(() => mmkvStorage) },
  ),
);
