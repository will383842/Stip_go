import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import type { ApiResponse, Pepite, CreatePepitePayload } from '../types';

export function useNearbyPepites(lat?: number, lng?: number, radius: number = 5000) {
  return useQuery({
    queryKey: ['pepites', lat, lng, radius],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Pepite[]>>('/pepites', {
        params: { lat, lng, radius },
      });
      return data.data;
    },
    enabled: !!lat && !!lng,
    staleTime: 60_000,
  });
}

export function usePepiteDetail(pepiteId: string) {
  return useQuery({
    queryKey: ['pepite', pepiteId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Pepite>>(`/pepites/${pepiteId}`);
      return data.data;
    },
    enabled: !!pepiteId,
    staleTime: 60_000,
  });
}

export function useCreatePepite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePepitePayload) => {
      const { data } = await api.post<ApiResponse<Pepite>>('/pepites', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pepites'] });
    },
  });
}

export function useVotePepite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pepiteId: string) => {
      await api.post(`/pepites/${pepiteId}/vote`);
      return pepiteId;
    },
    onSuccess: (pepiteId) => {
      queryClient.invalidateQueries({ queryKey: ['pepite', pepiteId] });
      queryClient.invalidateQueries({ queryKey: ['pepites'] });
    },
  });
}

export function useUnvotePepite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (pepiteId: string) => {
      await api.delete(`/pepites/${pepiteId}/vote`);
      return pepiteId;
    },
    onSuccess: (pepiteId) => {
      queryClient.invalidateQueries({ queryKey: ['pepite', pepiteId] });
      queryClient.invalidateQueries({ queryKey: ['pepites'] });
    },
  });
}

export function useTopPepites(city?: string) {
  return useQuery({
    queryKey: ['pepites-top', city],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Pepite[]>>('/pepites/top', {
        params: { city },
      });
      return data.data;
    },
    enabled: !!city,
    staleTime: 5 * 60_000,
  });
}
