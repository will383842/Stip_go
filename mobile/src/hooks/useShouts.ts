import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useSocialStore } from '../stores/useSocialStore';
import type { ApiResponse, Shout } from '../types';

export function useNearbyShouts(lat?: number, lng?: number) {
  const { setNearbyShouts } = useSocialStore();

  return useQuery({
    queryKey: ['shouts', lat, lng],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Shout[]>>('/shouts', {
        params: { lat, lng },
      });
      setNearbyShouts(data.data);
      return data.data;
    },
    enabled: !!lat && !!lng,
    staleTime: 30_000,
    refetchInterval: 60_000, // Refresh shouts every minute
  });
}

export function useCreateShout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (message: string) => {
      const { data } = await api.post<ApiResponse<Shout>>('/shouts', { message });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shouts'] });
    },
  });
}

export function useJoinShout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shoutId: string) => {
      await api.post(`/shouts/${shoutId}/join`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shouts'] });
    },
  });
}

export function useShoutDetail(shoutId: string) {
  return useQuery({
    queryKey: ['shout', shoutId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Shout>>(`/shouts/${shoutId}`);
      return data.data;
    },
    enabled: !!shoutId,
    staleTime: 15_000,
  });
}
