import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useMapStore } from '../stores/useMapStore';
import type { ApiResponse, Cluster, ClusterQuery, Position, PositionBatchPayload } from '../types';

export function useUploadPositions() {
  return useMutation({
    mutationFn: async (payload: PositionBatchPayload) => {
      const { data } = await api.post<ApiResponse<{ stored: number }>>('/positions', payload);
      return data.data;
    },
  });
}

export function useClusters(query: ClusterQuery) {
  const { setClusters } = useMapStore();

  return useQuery({
    queryKey: ['clusters', query.zoom, query.bbox],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Cluster[]>>('/clusters', {
        params: { zoom: query.zoom, bbox: query.bbox },
      });
      setClusters(data.data);
      return data.data;
    },
    enabled: !!query.bbox,
    staleTime: 30_000,
  });
}

export function useMyPositions(from?: string, to?: string) {
  return useQuery({
    queryKey: ['my-positions', from, to],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (from) params.from = from;
      if (to) params.to = to;
      const { data } = await api.get<ApiResponse<Position[]>>('/positions/me', { params });
      return data.data;
    },
  });
}
