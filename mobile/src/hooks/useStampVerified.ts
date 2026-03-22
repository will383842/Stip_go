import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface StampVerifiedState {
  isVisible: boolean;
  countryCode: string | null;
}

/**
 * Hook to manage "Stamp vérifié !" animation state.
 * Triggered when a push notification of type 'stamp_verified' arrives,
 * or when polling detects a previously-declared stamp became GPS-verified.
 */
export function useStampVerified() {
  const [state, setState] = useState<StampVerifiedState>({
    isVisible: false,
    countryCode: null,
  });
  const queryClient = useQueryClient();

  const showVerified = useCallback((countryCode: string) => {
    setState({ isVisible: true, countryCode });
  }, []);

  const dismiss = useCallback(() => {
    setState({ isVisible: false, countryCode: null });
    // Refresh passport data to reflect the source change
    queryClient.invalidateQueries({ queryKey: ['passport'] });
  }, [queryClient]);

  /**
   * Called when a push notification is received. Check if it's stamp_verified
   * and trigger the animation.
   */
  const handleNotification = useCallback((notification: { type: string; data?: Record<string, unknown> }) => {
    if (notification.type === 'stamp_verified' && notification.data?.country_code) {
      showVerified(notification.data.country_code as string);
    }
  }, [showVerified]);

  return {
    isVerifiedVisible: state.isVisible,
    verifiedCountryCode: state.countryCode,
    showVerified,
    dismissVerified: dismiss,
    handleNotification,
  };
}
