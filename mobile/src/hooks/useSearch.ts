import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import type { ApiResponse, PublicProfile } from '../types';

export function useSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PublicProfile[]>>('/search', {
        params: { q: query },
      });
      return data.data;
    },
    enabled: query.length >= 2,
    staleTime: 5 * 60_000, // 5 min
  });
}
