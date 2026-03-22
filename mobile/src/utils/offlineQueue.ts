// Offline stamp queue — persisted in MMKV
// Stamps created while offline are queued and synced when network returns

import { api } from '../services/api';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { MMKV } = require('react-native-mmkv');
const storage = new MMKV();

const QUEUE_KEY = 'offline_stamp_queue';

export interface OfflineStamp {
  id: string; // local UUID to prevent duplicates
  lat: number;
  lng: number;
  stamp_type: 'spot' | 'city' | 'region' | 'country';
  name: string;
  created_at: string;
}

export function getOfflineQueue(): OfflineStamp[] {
  const raw = storage.getString(QUEUE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function addToOfflineQueue(stamp: OfflineStamp): void {
  const queue = getOfflineQueue();
  // Prevent duplicates by local id
  if (queue.some((s) => s.id === stamp.id)) return;
  queue.push(stamp);
  storage.set(QUEUE_KEY, JSON.stringify(queue));
}

export function clearOfflineQueue(): void {
  storage.delete(QUEUE_KEY);
}

export function getOfflineQueueCount(): number {
  return getOfflineQueue().length;
}

export async function syncOfflineQueue(): Promise<number> {
  const queue = getOfflineQueue();
  if (queue.length === 0) return 0;

  let synced = 0;
  const remaining: OfflineStamp[] = [];

  for (const stamp of queue) {
    try {
      await api.post('/positions', {
        positions: [{
          lat: stamp.lat,
          lng: stamp.lng,
          recorded_at: stamp.created_at,
        }],
      });
      synced++;
    } catch {
      // Keep in queue for next sync attempt
      remaining.push(stamp);
    }
  }

  if (remaining.length > 0) {
    storage.set(QUEUE_KEY, JSON.stringify(remaining));
  } else {
    storage.delete(QUEUE_KEY);
  }

  return synced;
}
