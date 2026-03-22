import React, { useState, useCallback, useRef } from 'react';
import { View, Text, Pressable } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocationTracking } from '../../hooks/useLocation';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useMapStore } from '../../stores/useMapStore';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { SMapMarker, SStampAnimation, SMilesAnimation, SInvisibleBorders } from '../../components/organisms';
import { SStampPress } from '../../components/molecules';
import { haptic } from '../../utils/haptics';
import { playSound } from '../../utils/audio';
import { addToOfflineQueue, getOfflineQueueCount } from '../../utils/offlineQueue';
import { ATLAS_VINTAGE_DARK, ATLAS_VINTAGE_LIGHT } from '../../theme/mapStyle';
import type { StampType } from '../../types';
import SSkeleton from '../../components/atoms/SSkeleton';
import SIcon from '../../components/atoms/SIcon';

// Initialize Mapbox (token from env)
// MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN || '');

interface StampEvent {
  type: StampType;
  name: string;
  countryCode?: string;
}

export default function MapScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { currentPosition } = useLocationTracking();
  const { isConnected } = useNetworkStatus();
  const { clusters, socialProofCount } = useMapStore();
  const { darkMode } = useSettingsStore();
  const [stampAnimation, setStampAnimation] = useState<StampEvent | null>(null);
  const [showMiles, setShowMiles] = useState(false);
  const [borderCrossing, setBorderCrossing] = useState<{ code: string; name: string } | null>(null);

  // Debounce stamp — prevent double-tap
  const lastStampTime = useRef<number>(0);

  // Atlas Vintage style (JSON inline, no Mapbox Studio account needed)
  const mapStyleJSON = darkMode === 'dark' ? ATLAS_VINTAGE_DARK : ATLAS_VINTAGE_LIGHT;

  const handleFabStamp = useCallback(() => {
    if (!currentPosition) return;

    // Debounce — prevent double-tap (500ms minimum between stamps)
    const now = Date.now();
    if (now - lastStampTime.current < 1000) return;
    lastStampTime.current = now;

    haptic.heavy();
    playSound('thud_spot');
    setStampAnimation({ type: 'spot', name: 'Nouveau spot' });
    setShowMiles(true);

    // If offline, queue the stamp locally
    if (!isConnected) {
      addToOfflineQueue({
        id: `offline_${now}`,
        lat: currentPosition.lat,
        lng: currentPosition.lng,
        stamp_type: 'spot',
        name: 'Nouveau spot',
        created_at: new Date().toISOString(),
      });
    }
  }, [currentPosition, isConnected]);

  const handleMapLongPress = useCallback((event: any) => {
    const { geometry } = event;
    if (!geometry?.coordinates) return;

    // Debounce
    const now = Date.now();
    if (now - lastStampTime.current < 1000) return;
    lastStampTime.current = now;

    haptic.heavy();
    playSound('thud_spot');

    setStampAnimation({
      type: 'spot',
      name: 'Nouveau spot',
    });
    setShowMiles(true);
  }, []);

  if (!currentPosition) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0D0D1A', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
        {/* Skeleton carte + shimmer */}
        <SSkeleton width={200} height={200} borderRadius={100} />
        <SSkeleton width={280} height={16} borderRadius={8} />
        <SSkeleton width={200} height={16} borderRadius={8} />
        <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 14, color: '#737373', marginTop: 16 }}>
          {t('common.loading')}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Header — logo + notifs */}
      <View
        style={{
          position: 'absolute',
          top: insets.top + 8,
          left: 16,
          right: 16,
          zIndex: 15,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ fontFamily: 'PlusJakartaSans-Bold', fontSize: 18, color: '#F5C518', letterSpacing: 1 }}>
          STIP ME
        </Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable style={{ width: 36, height: 36, borderRadius: 9999, backgroundColor: 'rgba(13,13,26,0.7)', alignItems: 'center', justifyContent: 'center' }}>
            <SIcon name="notifications-outline" size={20} color="#FFFEF5" />
          </Pressable>
        </View>
      </View>

      {/* Offline indicator */}
      {!isConnected && (
        <View
          style={{
            position: 'absolute',
            top: insets.top + 52,
            alignSelf: 'center',
            zIndex: 20,
            backgroundColor: 'rgba(255,87,69,0.15)',
            paddingHorizontal: 16,
            paddingVertical: 6,
            borderRadius: 9999,
            borderWidth: 1,
            borderColor: 'rgba(255,87,69,0.3)',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <SIcon name="cloud-offline-outline" size={16} color="#FF5745" />
          <Text style={{ fontFamily: 'PlusJakartaSans-Medium', fontSize: 12, color: '#FF5745' }}>
            Hors ligne{getOfflineQueueCount() > 0 ? ` · ${getOfflineQueueCount()} stamp(s) en attente` : ''}
          </Text>
        </View>
      )}

      {/* Stamp animation overlay */}
      {stampAnimation && (
        <SStampAnimation
          stampType={stampAnimation.type}
          stampName={stampAnimation.name}
          countryCode={stampAnimation.countryCode}
          onComplete={() => setStampAnimation(null)}
        />
      )}

      {/* +10 Miles floating animation */}
      {showMiles && (
        <SMilesAnimation miles={10} onComplete={() => setShowMiles(false)} />
      )}

      {/* Invisible Borders — country crossing animation */}
      {borderCrossing && (
        <SInvisibleBorders
          countryCode={borderCrossing.code}
          countryName={borderCrossing.name}
          onComplete={() => setBorderCrossing(null)}
        />
      )}

      {/* Social proof badge */}
      {socialProofCount > 0 && (
        <View
          style={{
            position: 'absolute',
            top: 60,
            alignSelf: 'center',
            zIndex: 10,
            backgroundColor: 'rgba(13,13,26,0.85)',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 9999,
            borderWidth: 1,
            borderColor: '#404040',
          }}
        >
          <Text style={{ fontFamily: 'PlusJakartaSans-Medium', fontSize: 14, color: '#00D4FF' }}>
            {t('map.activeExplorers', { count: socialProofCount })}
          </Text>
        </View>
      )}

      {/* GPS accuracy warning */}
      {currentPosition.accuracy && currentPosition.accuracy > 100 && (
        <View
          style={{
            position: 'absolute',
            top: socialProofCount > 0 ? 100 : 60,
            alignSelf: 'center',
            zIndex: 10,
            backgroundColor: 'rgba(245,197,24,0.15)',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 9999,
          }}
        >
          <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, color: '#F5C518' }}>
            {t('map.approximatePosition')}
          </Text>
        </View>
      )}

      <MapboxGL.MapView
        style={{ flex: 1 }}
        styleJSON={JSON.stringify(mapStyleJSON)}
        onLongPress={handleMapLongPress}
        compassEnabled={false}
        logoEnabled={false}
        attributionEnabled={false}
      >
        <MapboxGL.Camera
          zoomLevel={14}
          centerCoordinate={[currentPosition.lng, currentPosition.lat]}
          animationMode="flyTo"
          animationDuration={1000}
        />

        {/* User position */}
        <MapboxGL.PointAnnotation
          id="user-position"
          coordinate={[currentPosition.lng, currentPosition.lat]}
        >
          <SMapMarker type="user" />
        </MapboxGL.PointAnnotation>

        {/* Clusters */}
        {clusters.map((cluster, i) => (
          <MapboxGL.PointAnnotation
            key={`cluster-${i}`}
            id={`cluster-${i}`}
            coordinate={[cluster.lng, cluster.lat]}
          >
            <View
              style={{
                backgroundColor: '#00D4FF',
                borderRadius: 9999,
                width: 32,
                height: 32,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontFamily: 'PlusJakartaSans-Bold', fontSize: 12, color: '#0D0D1A' }}>
                {cluster.count}
              </Text>
            </View>
          </MapboxGL.PointAnnotation>
        ))}
      </MapboxGL.MapView>

      {/* FAB — Stamp Press button */}
      <View
        style={{
          position: 'absolute',
          bottom: 24 + insets.bottom,
          alignSelf: 'center',
          zIndex: 20,
        }}
      >
        <SStampPress onStampComplete={handleFabStamp} size={64} />
      </View>

      {/* Stamp hint */}
      <View
        style={{
          position: 'absolute',
          bottom: 96 + insets.bottom,
          alignSelf: 'center',
          zIndex: 10,
        }}
      >
        <Text style={{ fontFamily: 'PlusJakartaSans-Regular', fontSize: 12, color: '#737373' }}>
          {t('map.stampPress')}
        </Text>
      </View>
    </View>
  );
}
