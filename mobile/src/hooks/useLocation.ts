import { useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import { useMapStore } from '../stores/useMapStore';
import { useUploadPositions } from './usePositions';
import { distanceMeters } from '../utils/helpers';
import type { Position } from '../types';

const MIN_DISTANCE_M = 50;
const UPLOAD_INTERVAL_MS = 60_000;

export function useLocationTracking() {
  const { setCurrentPosition } = useMapStore();
  const currentPosition = useMapStore((s) => s.currentPosition);
  const uploadPositions = useUploadPositions();
  const pendingPositions = useRef<Position[]>([]);
  const lastUploadedPosition = useRef<{ lat: number; lng: number } | null>(null);

  const uploadBatch = useCallback(() => {
    if (pendingPositions.current.length === 0) return;

    const batch = [...pendingPositions.current];
    pendingPositions.current = [];
    uploadPositions.mutate({ positions: batch });
  }, [uploadPositions]);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10_000,
          distanceInterval: 10,
        },
        (location) => {
          const pos: Position = {
            lat: location.coords.latitude,
            lng: location.coords.longitude,
            accuracy: location.coords.accuracy ?? undefined,
            speed: location.coords.speed ?? undefined,
            altitude: location.coords.altitude ?? undefined,
            recorded_at: new Date(location.timestamp).toISOString(),
          };

          setCurrentPosition(pos);

          const last = lastUploadedPosition.current;
          if (!last || distanceMeters(last.lat, last.lng, pos.lat, pos.lng) >= MIN_DISTANCE_M) {
            pendingPositions.current.push(pos);
            lastUploadedPosition.current = { lat: pos.lat, lng: pos.lng };
          }
        },
      );
    })();

    const interval = setInterval(uploadBatch, UPLOAD_INTERVAL_MS);

    return () => {
      subscription?.remove();
      clearInterval(interval);
      uploadBatch();
    };
  }, [setCurrentPosition, uploadBatch]);

  return { currentPosition };
}

export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

export async function getCurrentCity(): Promise<Location.LocationGeocodedAddress | null> {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const [address] = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
    return address ?? null;
  } catch {
    return null;
  }
}
