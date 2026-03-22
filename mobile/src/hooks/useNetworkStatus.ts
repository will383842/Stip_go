import { useEffect, useState } from 'react';
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { syncOfflineQueue } from '../utils/offlineQueue';

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const connected = state.isConnected ?? true;
      const wasOffline = !isConnected;

      setIsConnected(connected);

      // Auto-sync offline queue when network returns
      if (connected && wasOffline) {
        syncOfflineQueue();
      }
    });

    return () => unsubscribe();
  }, [isConnected]);

  return { isConnected };
}
