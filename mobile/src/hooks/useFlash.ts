import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import type { ApiResponse, StampFlash } from '../types';

export function useTodayFlash(lat?: number, lng?: number) {
  return useQuery({
    queryKey: ['flash-today', lat, lng],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<StampFlash | null>>('/stamps/flash/today', {
        params: { lat, lng },
      });
      return data.data;
    },
    enabled: !!lat && !!lng,
    staleTime: 5 * 60_000, // 5 min
  });
}

interface FlashCaptureResponse {
  captured: boolean;
  miles_bonus: number;
  new_miles_balance: number;
}

export function useCaptureFlash() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<ApiResponse<FlashCaptureResponse>>('/stamps/flash/capture');
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flash-today'] });
      queryClient.invalidateQueries({ queryKey: ['passport'] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}
